<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use App\Models\Demande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EtudiantAdminController extends Controller
{
    public function index()
    {
        return response()->json(Etudiant::orderBy('nom')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'matricule' => 'required|string|unique:etudiants,matricule',
            'nom'       => 'required|string|max:255',
            'prenom'    => 'required|string|max:255',
            'filiere'   => 'required|string|max:255',
            'password'  => 'nullable|string|min:6',
        ]);

        $etudiant = Etudiant::create([
            'matricule'    => strtoupper($request->matricule),
            'nom'          => strtoupper($request->nom),
            'prenom'       => $request->prenom,
            'filiere'      => $request->filiere,
            'password'     => $request->password ? Hash::make($request->password) : null,
            'has_password' => $request->password ? true : false,
        ]);

        return response()->json($etudiant, 201);
    }

    public function demandes($id)
    {
        Etudiant::findOrFail($id);
        return response()->json(
            Demande::with('typeDemande')
                ->where('etudiant_id', $id)
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }
}