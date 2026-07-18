<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TypeDemande;
use Illuminate\Http\Request;

class TypeDemandeController extends Controller
{
    public function index()
    {
        return response()->json(
            TypeDemande::with('documentsRequis')->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'libelle'     => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $type = TypeDemande::create($request->only('libelle', 'description'));

        return response()->json($type, 201);
    }

    public function show($id)
    {
        $type = TypeDemande::with('documentsRequis')->findOrFail($id);
        return response()->json($type);
    }

    public function update(Request $request, $id)
    {
        $type = TypeDemande::findOrFail($id);
        $request->validate([
            'libelle'     => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'actif'       => 'sometimes|boolean',
        ]);
        $type->update($request->only('libelle', 'description', 'actif'));
        return response()->json($type);
    }

    public function destroy($id)
    {
        TypeDemande::findOrFail($id)->delete();
        return response()->json(['message' => 'Type supprimé.']);
    }
}