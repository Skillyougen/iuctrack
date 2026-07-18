<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EtudiantAuthController extends Controller
{
    public function checkMatricule(Request $request)
    {
        $request->validate(['matricule' => 'required|string']);
        $etudiant = Etudiant::where('matricule', $request->matricule)->first();
        if (!$etudiant) {
            return response()->json(['exists' => false, 'has_password' => false]);
        }
        return response()->json([
            'exists'       => true,
            'has_password' => $etudiant->has_password,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'matricule' => 'required|string',
            'password'  => 'nullable|string',
        ]);

        $etudiant = Etudiant::where('matricule', $request->matricule)->first();

        if (!$etudiant) {
            return response()->json(['message' => 'Matricule introuvable.'], 404);
        }

        if ($etudiant->has_password) {
            if (!$request->password || !Hash::check($request->password, $etudiant->password)) {
                return response()->json(['message' => 'Mot de passe incorrect.'], 401);
            }
        }

        $token = $etudiant->createToken('etudiant-token')->plainTextToken;

        return response()->json([
            'token'    => $token,
            'etudiant' => $etudiant->only([
                'id', 'matricule', 'nom', 'prenom', 'filiere', 'photo', 'has_password'
            ]),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    public function setPassword(Request $request)
    {
        $request->validate([
            'password' => 'required|string|min:6|confirmed'
        ]);
        $etudiant = $request->user();
        $etudiant->update([
            'password'     => Hash::make($request->password),
            'has_password' => true,
        ]);
        return response()->json(['message' => 'Mot de passe défini avec succès.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}