<?php
namespace App\Http\Controllers\Etudiant;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('etudiant_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    public function marquerLue(Request $request, $id)
    {
        $notification = Notification::where('etudiant_id', $request->user()->id)
            ->findOrFail($id);
        $notification->update(['lue' => true]);
        return response()->json($notification);
    }

    public function marquerToutesLues(Request $request)
    {
        Notification::where('etudiant_id', $request->user()->id)
            ->where('lue', false)
            ->update(['lue' => true]);
        return response()->json(['message' => 'Toutes les notifications ont été lues.']);
    }
}