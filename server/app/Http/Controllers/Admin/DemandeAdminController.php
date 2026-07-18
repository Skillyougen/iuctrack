<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\Notification;
use App\Models\HistoriqueStatut;
use Illuminate\Http\Request;

class DemandeAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = Demande::with(['typeDemande', 'etudiant', 'documentsJoints.documentRequis']);

        if ($request->has('statut') && $request->statut !== '') {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function show($id)
    {
        $demande = Demande::with([
            'typeDemande',
            'etudiant',
            'documentsJoints.documentRequis',
            'historiqueStatuts.admin'
        ])->findOrFail($id);

        return response()->json($demande);
    }

    public function changerStatut(Request $request, $id)
    {
        $request->validate(['statut' => 'required|in:envoyee,en_cours,terminee']);

        $demande = Demande::with(['typeDemande', 'etudiant'])->findOrFail($id);
        $ancienStatut = $demande->statut;
        $demande->update(['statut' => $request->statut]);

        // Historique
        HistoriqueStatut::create([
            'demande_id'     => $demande->id,
            'admin_id'       => $request->user()->id,
            'ancien_statut'  => $ancienStatut,
            'nouveau_statut' => $request->statut,
        ]);

        // Notification automatique étudiant
        $messages = [
            'en_cours' => 'Votre demande "' . $demande->typeDemande->libelle . '" est en cours de traitement.',
            'terminee' => 'Votre demande "' . $demande->typeDemande->libelle . '" a été traitée et est maintenant terminée.',
        ];

        if (isset($messages[$request->statut])) {
            Notification::create([
                'etudiant_id' => $demande->etudiant_id,
                'demande_id'  => $demande->id,
                'titre'       => 'Statut mis à jour',
                'message'     => $messages[$request->statut],
                'lue'         => false,
            ]);
        }

        return response()->json($demande->fresh(['typeDemande', 'etudiant', 'documentsJoints.documentRequis']));
    }

    public function notifierEtudiant(Request $request, $id)
{
    $request->validate([
        'titre'   => 'required|string|max:255',
        'message' => 'required|string',
    ]);

    $demande = Demande::with(['typeDemande', 'etudiant'])->findOrFail($id);

    Notification::create([
        'etudiant_id' => $demande->etudiant_id,
        'demande_id'  => $demande->id,
        'titre'       => $request->titre,
        'message'     => $request->message,
        'lue'         => false,
    ]);

    return response()->json(['message' => 'Notification envoyée avec succès.']);
}
}