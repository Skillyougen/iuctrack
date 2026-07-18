<?php
namespace App\Http\Controllers\Etudiant;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\DocumentJoint;
use App\Models\Notification;
use App\Models\TypeDemande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DemandeController extends Controller
{
    // Liste des demandes de l'étudiant connecté
    public function index(Request $request)
    {
        $demandes = Demande::with(['typeDemande', 'documentsJoints.documentRequis', 'historique'])
            ->where('etudiant_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($demandes);
    }

    // Détail d'une demande
    public function show(Request $request, $id)
    {
        $demande = Demande::with(['typeDemande', 'documentsJoints.documentRequis', 'historique.admin'])
            ->where('etudiant_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json($demande);
    }

    // Soumettre une nouvelle demande
    public function store(Request $request)
    {
        $request->validate([
            'type_demande_id' => 'required|exists:type_demandes,id',
            'documents'       => 'required|array',
            'documents.*.document_requis_id' => 'required|exists:document_requis,id',
            'documents.*.fichier' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        // Créer la demande
        $demande = Demande::create([
            'etudiant_id'     => $request->user()->id,
            'type_demande_id' => $request->type_demande_id,
            'statut'          => 'envoyee',
        ]);

        // Uploader les documents
        foreach ($request->documents as $doc) {
            $fichier = $doc['fichier'];
            $path = $fichier->store('documents/' . $demande->id, 'public');

            DocumentJoint::create([
                'demande_id'         => $demande->id,
                'document_requis_id' => $doc['document_requis_id'],
                'chemin_fichier'     => $path,
                'nom_original'       => $fichier->getClientOriginalName(),
            ]);
        }

        // Notification à l'étudiant
        Notification::create([
            'etudiant_id' => $request->user()->id,
            'demande_id'  => $demande->id,
            'titre'       => 'Demande envoyée',
            'message'     => 'Votre demande "' . $demande->typeDemande->libelle . '" a bien été reçue.',
        ]);

        return response()->json(
            $demande->load(['typeDemande', 'documentsJoints']),
            201
        );
    }
}