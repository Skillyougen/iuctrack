<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequis;
use App\Models\TypeDemande;
use Illuminate\Http\Request;

class DocumentRequisController extends Controller
{
    public function store(Request $request, $typeId)
    {
        $request->validate([
            'libelle'     => 'required|string|max:255',
            'obligatoire' => 'boolean',
        ]);

        TypeDemande::findOrFail($typeId);

        $doc = DocumentRequis::create([
            'type_demande_id' => $typeId,
            'libelle'         => $request->libelle,
            'obligatoire'     => $request->obligatoire ?? true,
        ]);

        return response()->json($doc, 201);
    }

    public function update(Request $request, $typeId, $id)
    {
        $doc = DocumentRequis::where('type_demande_id', $typeId)->findOrFail($id);
        $request->validate([
            'libelle'     => 'sometimes|string|max:255',
            'obligatoire' => 'sometimes|boolean',
        ]);
        $doc->update($request->only('libelle', 'obligatoire'));
        return response()->json($doc);
    }

    public function destroy($typeId, $id)
    {
        DocumentRequis::where('type_demande_id', $typeId)->findOrFail($id)->delete();
        return response()->json(['message' => 'Document supprimé.']);
    }
}