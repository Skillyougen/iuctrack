<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class IAController extends Controller
{
    private function callClaude(string $systemPrompt, string $userMessage): string
    {
        $response = Http::withoutVerifying()->withHeaders([
            'x-api-key'         => env('ANTHROPIC_API_KEY'),
            'anthropic-version' => '2023-06-01',
            'content-type'      => 'application/json',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model'      => 'claude-3-haiku-20240307',
            'max_tokens' => 1024,
            'system'     => $systemPrompt,
            'messages'   => [
                ['role' => 'user', 'content' => $userMessage]
            ],
        ]);

        if ($response->successful()) {
            return $response->json('content.0.text') ?? 'Réponse non disponible.';
        }

        throw new \Exception('Erreur API Claude : ' . $response->body());
    }

    // ── IMPORT IA ─────────────────────────────────────────────────
    public function importEtudiants(Request $request)
    {
        $request->validate(['contenu' => 'required|string']);

        $systemPrompt = <<<PROMPT
Tu es un assistant d'importation de données universitaires pour l'IUC (Institut Universitaire de la Côte).
Tu reçois le contenu brut d'un fichier (Excel converti en texte, CSV, ou texte libre) contenant des informations d'étudiants.

Ton rôle est d'extraire UNIQUEMENT les données des étudiants et de retourner un JSON valide.

Format de sortie STRICT — retourne UNIQUEMENT ce JSON, sans texte avant ni après, sans markdown, sans backticks :
[
  {
    "matricule": "IUC2024-XXXX",
    "nom": "NOM EN MAJUSCULES",
    "prenom": "Prénom avec majuscule initiale",
    "filiere": "Nom de la filière"
  }
]

Règles :
- Le matricule doit ressembler à IUC + année + numéro. S'il n'est pas trouvé, génère un format IUC2024-AUTO + index (0001, 0002...)
- Le nom doit être en MAJUSCULES
- Le prénom doit avoir une majuscule initiale seulement
- La filière : si non trouvée, mets "Non spécifiée"
- Ignore les lignes d'en-tête, lignes vides, totaux
- Si le contenu est vide ou illisible, retourne []
- Ne retourne RIEN d'autre que le tableau JSON
PROMPT;

        try {
            $jsonText = $this->callClaude($systemPrompt, $request->contenu);
            $jsonText = trim($jsonText);
            $jsonText = preg_replace('/```json|```/i', '', $jsonText);
            $jsonText = trim($jsonText);

            $etudiants = json_decode($jsonText, true);

            if (!is_array($etudiants)) {
                return response()->json(['message' => 'Impossible d\'extraire les données du fichier.'], 422);
            }

            $created = 0;
            $skipped = 0;
            $errors  = [];

            foreach ($etudiants as $index => $data) {
                try {
                    if (empty($data['nom']) || empty($data['prenom'])) {
                        $skipped++;
                        continue;
                    }

                    $matricule = $data['matricule'] ?? ('IUC2024-AUTO' . str_pad($index + 1, 4, '0', STR_PAD_LEFT));

                    $exists = Etudiant::where('matricule', $matricule)->exists();
                    if ($exists) {
                        $skipped++;
                        continue;
                    }

                    Etudiant::create([
                        'matricule'    => strtoupper($matricule),
                        'nom'          => strtoupper($data['nom']),
                        'prenom'       => ucfirst(strtolower($data['prenom'])),
                        'filiere'      => $data['filiere'] ?? 'Non spécifiée',
                        'password'     => null,
                        'has_password' => false,
                    ]);

                    $created++;
                } catch (\Exception $e) {
                    $errors[] = "Ligne " . ($index + 1) . " : " . $e->getMessage();
                    $skipped++;
                }
            }

            return response()->json([
                'message' => "Import terminé : $created étudiant(s) créé(s), $skipped ignoré(s).",
                'created' => $created,
                'skipped' => $skipped,
                'errors'  => $errors,
                'data'    => $etudiants,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }

    // ── CHAT IA ───────────────────────────────────────────────────
    public function chat(Request $request)
    {
        $request->validate([
            'message'    => 'required|string|max:1000',
            'historique' => 'nullable|array',
        ]);

        $message = strtolower($request->message);

        // ── FALLBACK LOCAL — réponses sans API ───────────────────
        $reponseLocale = $this->repondreLocalement($message);
        if ($reponseLocale) {
            return response()->json(['reponse' => $reponseLocale]);
        }

        // ── APPEL CLAUDE API ─────────────────────────────────────
        $systemPrompt = <<<PROMPT
Tu es IUCBot, l'assistant intelligent de la plateforme IUCTrack de l'Institut Universitaire de la Côte (IUC).

=== QUI TU ES ===
Tu es un assistant bienveillant, professionnel et précis. Tu réponds en français par défaut, en anglais si l'étudiant écrit en anglais.
Tu ne parles QUE des sujets suivants. Pour tout autre sujet, tu dis poliment que tu ne peux pas aider avec ça.

=== L'IUC ===
- Nom complet : Institut Universitaire de la Côte
- Fondateur : Paul Guimezap
- Fondé en : 2002 (arrêté ministériel du 13 septembre 2002)
- Vision : Former des techniciens, cadres et ingénieurs adaptés aux besoins du marché africain
- 5 campus : Logbessou (principal), Akwa, Excellence, Denver (tous à Douala), Dschang
- 3 cités universitaires
- Cycles : BTS, Licence, Bachelor, Master, Ingénieur

=== ÉCOLES DE L'IUC ===
1. ISTDI (Institut Supérieur des Technologies et du Design Industriel) - depuis 2002
   Domaines : Génie civil, Architecture, Génie électrique, Génie mécanique, Énergies renouvelables, HSE, Télécommunications
2. 3IAC (Institut d'Ingénierie Informatique d'Afrique Centrale) - depuis 2007
   Domaines : Génie logiciel, Informatique, Réseaux, Cybersécurité, Intelligence artificielle, Télécommunications
3. ICIA (Institut de Commerce et d'Ingénierie d'Affaires) - depuis 2011
   Domaines : Comptabilité, Banque et finance, Marketing, Commerce international, Logistique, GRH
4. Santé et Sciences Appliquées
   Domaines : Sciences infirmières, Kinésithérapie, Biomédical, Analyses médicales, Santé publique
5. SEAS (School of Engineering and Applied Sciences)
   Domaines : Agriculture, Informatique appliquée, Biomédical, Physiothérapie

=== PARTENARIATS IUC ===
- France : doubles diplômes et mobilité étudiante
- Italie : échanges académiques et cycles ingénieurs
- Canada : programmes internationaux conjoints

=== IUCTRACK — LA PLATEFORME ===
IUCTrack est la plateforme numérique officielle de l'IUC pour la gestion des demandes administratives.

Types de demandes disponibles :
- Attestation de scolarité : prouve l'inscription à l'IUC. Documents requis : Copie CNI + Photo identité
- Relevé de notes : récapitulatif des résultats académiques. Documents requis : Copie CNI + Photo identité
- Certificat de scolarité : document officiel de présence à l'IUC. Documents requis : Copie CNI + Photo identité
- Reinscription : demande de réinscription pour l'année suivante. Documents requis : Copie CNI + justificatif de paiement
- Demande de listing : extraction de la liste officielle d'une classe

=== COMMENT FONCTIONNE IUCTRACK ===
1. L'étudiant se connecte avec son matricule (format : IUC2024-XXXX)
2. Il choisit le type de demande
3. Il joint les documents requis (PDF, JPG, PNG)
4. Sa demande est soumise avec le statut "Envoyée"
5. L'administration traite la demande → statut "En cours de traitement"
6. Quand c'est prêt → statut "Terminée"
7. L'étudiant reçoit une notification à chaque changement de statut

=== CONNEXION ===
- Première connexion : matricule seul suffit
- Connexion suivante (si mot de passe défini) : matricule + mot de passe
- Le mot de passe peut être défini depuis l'onglet Profil de l'application

=== DÉLAIS DE TRAITEMENT ===
- Attestation de scolarité : 2 à 5 jours ouvrables
- Relevé de notes : 3 à 7 jours ouvrables
- Certificat de scolarité : 2 à 5 jours ouvrables
- Autres : variable selon la demande

=== CE QUE TU NE DIS PAS ===
- Tu ne donnes PAS d'informations sur le code source ou l'architecture technique
- Tu ne donnes PAS les données personnelles d'autres étudiants
- Tu ne fais PAS de calculs académiques (moyennes, résultats)
- Pour tout problème grave, tu invites l'étudiant à contacter directement l'administration

=== STYLE DE RÉPONSE ===
- Réponds de manière concise et claire
- Utilise des listes quand c'est utile
- Sois chaleureux et professionnel
- Maximum 200 mots par réponse
PROMPT;

        try {
            $messages = [];

            if ($request->historique) {
                foreach ($request->historique as $msg) {
                    if (isset($msg['role']) && isset($msg['content'])) {
                        $messages[] = [
                            'role'    => $msg['role'],
                            'content' => $msg['content'],
                        ];
                    }
                }
            }

            $messages[] = ['role' => 'user', 'content' => $request->message];

            $response = Http::withoutVerifying()->withHeaders([
                'x-api-key'         => env('ANTHROPIC_API_KEY'),
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model'      => 'claude-3-haiku-20240307',
                'max_tokens' => 512,
                'system'     => $systemPrompt,
                'messages'   => $messages,
            ]);

            if ($response->successful()) {
                return response()->json(['reponse' => $response->json('content.0.text')]);
            }

            // Erreur API → fallback générique
            return response()->json(['reponse' => $this->reponseGenerique($request->message)]);

        } catch (\Exception $e) {
            return response()->json(['reponse' => $this->reponseGenerique($request->message)]);
        }
    }

    // ── RÉPONSES LOCALES PAR MOTS-CLÉS ───────────────────────────
    private function repondreLocalement(string $message): ?string
    {
        // Types de demandes
        if (str_contains($message, 'type') || str_contains($message, 'demande') || str_contains($message, 'faire') || str_contains($message, 'request') || str_contains($message, 'disponible')) {
            return "Voici les types de demandes disponibles sur IUCTrack :\n\n• **Attestation de scolarité** — prouve votre inscription à l'IUC (CNI + Photo)\n• **Relevé de notes** — récapitulatif de vos résultats académiques (CNI + Photo)\n• **Certificat de scolarité** — document officiel de présence (CNI + Photo)\n• **Réinscription** — demande pour l'année suivante (CNI + Justificatif de paiement)\n• **Demande de listing** — liste officielle de votre classe\n\nPour soumettre une demande, connectez-vous et appuyez sur « Nouvelle demande ».";
        }

        // Statuts / suivi
        if (str_contains($message, 'statut') || str_contains($message, 'suivi') || str_contains($message, 'suivre') || str_contains($message, 'avancement') || str_contains($message, 'état') || str_contains($message, 'etat')) {
            return "Votre demande passe par 3 statuts :\n\n• **Envoyée** — votre demande a été reçue par l'administration\n• **En cours de traitement** — un agent traite votre dossier\n• **Terminée** — votre demande est prête\n\nVous recevrez une **notification automatique** à chaque changement de statut. Vous pouvez aussi consulter l'onglet « Mes demandes » à tout moment.";
        }

        // Délais
        if (str_contains($message, 'délai') || str_contains($message, 'delai') || str_contains($message, 'temps') || str_contains($message, 'combien') || str_contains($message, 'long') || str_contains($message, 'durée') || str_contains($message, 'duree')) {
            return "Les délais de traitement estimés sont :\n\n• **Attestation de scolarité** : 2 à 5 jours ouvrables\n• **Relevé de notes** : 3 à 7 jours ouvrables\n• **Certificat de scolarité** : 2 à 5 jours ouvrables\n• **Réinscription** : variable\n• **Demande de listing** : 1 à 3 jours ouvrables\n\nCes délais peuvent varier selon la charge administrative. Vous serez notifié dès que votre demande est prête.";
        }

        // Documents requis
        if (str_contains($message, 'document') || str_contains($message, 'pièce') || str_contains($message, 'piece') || str_contains($message, 'cni') || str_contains($message, 'photo') || str_contains($message, 'joindre') || str_contains($message, 'fournir') || str_contains($message, 'requis')) {
            return "Les documents généralement requis sont :\n\n• **Copie CNI** (Carte Nationale d'Identité) — obligatoire pour la plupart des demandes\n• **Photo d'identité** — pour les attestations et certificats\n• **Justificatif de paiement** — pour la réinscription\n\nLes formats acceptés sont : **PDF, JPG et PNG**. Vous pouvez les scanner ou les photographier directement depuis l'application.";
        }

        // Connexion / mot de passe
        if (str_contains($message, 'connecter') || str_contains($message, 'connexion') || str_contains($message, 'matricule') || str_contains($message, 'mot de passe') || str_contains($message, 'password') || str_contains($message, 'login') || str_contains($message, 'compte')) {
            return "Pour vous connecter à IUCTrack :\n\n• **Première connexion** : entrez uniquement votre matricule (format IUC2024-XXXX). Aucun mot de passe requis.\n• **Connexions suivantes** : si vous avez défini un mot de passe, il vous sera demandé.\n\nVous pouvez définir ou modifier votre mot de passe depuis l'onglet **Profil** → Paramètres de sécurité.";
        }

        // Notifications
        if (str_contains($message, 'notification') || str_contains($message, 'notif') || str_contains($message, 'alerte') || str_contains($message, 'prévenu') || str_contains($message, 'averti') || str_contains($message, 'informé')) {
            return "IUCTrack vous envoie des **notifications automatiques** à chaque changement de statut de vos demandes.\n\nVous pouvez consulter toutes vos notifications dans l'onglet **Notifications** (icône cloche). Les notifications non lues sont indiquées par un badge rouge.";
        }

        // IUC général
        if (str_contains($message, 'iuc') || str_contains($message, 'université') || str_contains($message, 'universite') || str_contains($message, 'campus') || str_contains($message, 'école') || str_contains($message, 'ecole') || str_contains($message, 'institut') || str_contains($message, 'histoire') || str_contains($message, 'fondateur')) {
            return "L'**Institut Universitaire de la Côte (IUC)** a été fondé en 2002 par **Paul Guimezap**.\n\n🏫 **5 campus** : Logbessou, Akwa, Excellence, Denver (Douala) et Dschang\n\n🎓 **5 écoles** :\n• ISTDI — Technologies et Design Industriel\n• 3IAC — Ingénierie Informatique\n• ICIA — Commerce et Ingénierie d'Affaires\n• Santé et Sciences Appliquées\n• SEAS — Engineering and Applied Sciences\n\n📚 **Cycles** : BTS, Licence, Bachelor, Master, Ingénieur";
        }

        // Partenariats
        if (str_contains($message, 'partenariat') || str_contains($message, 'france') || str_contains($message, 'italie') || str_contains($message, 'canada') || str_contains($message, 'international') || str_contains($message, 'double diplôme') || str_contains($message, 'etranger') || str_contains($message, 'étranger')) {
            return "L'IUC entretient des **partenariats internationaux** avec :\n\n🇫🇷 **France** — Doubles diplômes et mobilité étudiante\n🇮🇹 **Italie** — Échanges académiques et cycles ingénieurs\n🇨🇦 **Canada** — Programmes internationaux conjoints\n\nCes partenariats permettent aux étudiants d'obtenir des diplômes reconnus à l'international.";
        }

        // Salutations
        if (str_contains($message, 'bonjour') || str_contains($message, 'bonsoir') || str_contains($message, 'salut') || str_contains($message, 'hello') || str_contains($message, 'bonne journée') || $message === 'hi' || $message === 'hey') {
            return "Bonjour ! 👋 Je suis **IUCBot**, l'assistant de la plateforme IUCTrack.\n\nJe peux vous aider sur :\n• Les types de demandes disponibles\n• Le suivi de vos demandes\n• Les informations sur l'IUC\n• La connexion à IUCTrack\n\nComment puis-je vous aider ?";
        }

        // Remerciements
        if (str_contains($message, 'merci') || str_contains($message, 'thank') || str_contains($message, 'super') || str_contains($message, 'parfait') || str_contains($message, 'nickel')) {
            return "De rien ! 😊 N'hésitez pas si vous avez d'autres questions sur l'IUC ou IUCTrack. Je suis là pour vous aider.";
        }

        // IUCTrack général
        if (str_contains($message, 'iuctrack') || str_contains($message, 'application') || str_contains($message, 'plateforme') || str_contains($message, 'appli') || str_contains($message, 'fonctionne') || str_contains($message, 'comment')) {
            return "**IUCTrack** est la plateforme numérique officielle de l'IUC pour la gestion des demandes administratives.\n\n📱 **Comment ça marche ?**\n1. Connectez-vous avec votre matricule\n2. Choisissez le type de demande\n3. Joignez les documents requis\n4. Suivez l'avancement en temps réel\n5. Recevez une notification quand c'est prêt\n\nTout se fait depuis votre téléphone, sans déplacement !";
        }

        return null; // Pas de réponse locale → appel API
    }

    // ── RÉPONSE GÉNÉRIQUE SI API ÉCHOUE ──────────────────────────
    private function reponseGenerique(string $message): string
    {
        return "Je comprends votre question, mais je rencontre actuellement une difficulté à y répondre précisément.\n\nVoici ce que je peux vous dire :\n• Pour les **demandes administratives** : utilisez l'onglet « Nouvelle demande »\n• Pour le **suivi** : consultez « Mes demandes »\n• Pour toute question urgente : contactez directement l'administration de l'IUC\n\nReformandez votre question et je ferai de mon mieux pour vous aider !";
    }
}