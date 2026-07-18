<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;

class NotificationAdminController extends Controller
{
    public function index()
    {
        return response()->json(
            Notification::with(['etudiant', 'demande.typeDemande'])
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }
}