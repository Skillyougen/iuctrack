<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfilAdminController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $request->validate([
            'nom'    => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email'  => 'required|email|unique:admins,email,' . $request->user()->id,
        ]);

        $admin = $request->user();
        $admin->update([
            'nom'    => $request->nom,
            'prenom' => $request->prenom,
            'email'  => $request->email,
        ]);

        return response()->json($admin);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password'      => 'required|string',
            'password'              => 'required|string|min:6',
            'password_confirmation' => 'required|same:password',
        ]);

        $admin = $request->user();

        if (!Hash::check($request->current_password, $admin->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
        }

        $admin->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }
}