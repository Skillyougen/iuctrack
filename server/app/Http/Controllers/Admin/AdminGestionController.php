<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminGestionController extends Controller
{
    public function index()
    {
        return response()->json(Admin::orderBy('nom')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom'      => 'required|string|max:255',
            'prenom'   => 'required|string|max:255',
            'email'    => 'required|email|unique:admins,email',
            'password' => 'required|string|min:6',
            'role'     => 'in:admin,super_admin',
        ]);

        if ($request->role === 'super_admin' && $request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        // Permissions : tableau envoyé depuis le front → JSON string
        $permissions = null;
        if ($request->role === 'admin' && $request->has('permissions')) {
            $perms = $request->permissions;
            // Si c'est déjà une string JSON, on la garde
            if (is_string($perms)) {
                $permissions = $perms;
            } elseif (is_array($perms)) {
                $permissions = json_encode($perms);
            }
        }

        $admin = Admin::create([
            'nom'         => $request->nom,
            'prenom'      => $request->prenom,
            'email'       => $request->email,
            'password'    => Hash::make($request->password),
            'role'        => $request->role ?? 'admin',
            'permissions' => $permissions,
        ]);

        return response()->json($admin, 201);
    }

    public function destroy(Request $request, $id)
    {
        if ($id == $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas vous supprimer.'], 403);
        }
        Admin::findOrFail($id)->delete();
        return response()->json(['message' => 'Administrateur supprimé.']);
    }
}