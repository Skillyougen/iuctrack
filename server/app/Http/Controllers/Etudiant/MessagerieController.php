<?php
namespace App\Http\Controllers\Etudiant;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Etudiant;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MessagerieController extends Controller
{
    public function conversations(Request $request)
    {
    $monId = $request->user()->id;

    $conversations = Conversation::with(['etudiant1', 'etudiant2', 'dernierMessage'])
        ->where('etudiant1_id', $monId)
        ->orWhere('etudiant2_id', $monId)
        ->orderBy('dernier_message_at', 'desc')
        ->get()
        ->map(function($conv) use ($monId) {
            $autre = $conv->getAutreEtudiant($monId);
            $nonLus = Message::where('conversation_id', $conv->id)
                ->where('expediteur_id', '!=', $monId)
                ->where('lu', false)->count();
            return [
                'id'              => $conv->id,
                'autre_etudiant'  => $autre,
                'dernier_message' => $conv->dernierMessage,
                'non_lus'         => $nonLus,
                'updated_at'      => $conv->dernier_message_at,
            ];
        });

    return response()->json($conversations);
    }

    public function ouvrirConversation(Request $request)
    {
        $request->validate(['matricule' => 'required|string']);
        $monId = $request->user()->id;

        $autre = Etudiant::where('matricule', $request->matricule)->first();
        if (!$autre) {
            return response()->json(['message' => 'Étudiant introuvable.'], 404);
        }
        if ($autre->id === $monId) {
            return response()->json(['message' => 'Vous ne pouvez pas vous écrire à vous-même.'], 422);
        }

        $conv = Conversation::where(function($q) use ($monId, $autre) {
            $q->where('etudiant1_id', $monId)->where('etudiant2_id', $autre->id);
        })->orWhere(function($q) use ($monId, $autre) {
            $q->where('etudiant1_id', $autre->id)->where('etudiant2_id', $monId);
        })->first();

        if (!$conv) {
            $conv = Conversation::create([
                'etudiant1_id'       => $monId,
                'etudiant2_id'       => $autre->id,
                'dernier_message_at' => now(),
            ]);
        }

        return response()->json([
            'conversation_id' => $conv->id,
            'autre_etudiant'  => $autre,
        ]);
    }

    public function messages(Request $request, $convId)
    {
        $monId = $request->user()->id;
        $conv = Conversation::where('id', $convId)
            ->where(function($q) use ($monId) {
                $q->where('etudiant1_id', $monId)->orWhere('etudiant2_id', $monId);
            })->firstOrFail();

        Message::where('conversation_id', $convId)
            ->where('expediteur_id', '!=', $monId)
            ->where('lu', false)
            ->update(['lu' => true]);

        $messages = $conv->messages()->with('expediteur')->get();
        return response()->json($messages);
    }

    public function envoyerMessage(Request $request, $convId)
    {
        $request->validate([
            'type'            => 'required|in:texte,image,sticker',
            'contenu_chiffre' => 'required|string',
            'iv'              => 'required|string',
        ]);

        $monId = $request->user()->id;
        $conv = Conversation::where('id', $convId)
            ->where(function($q) use ($monId) {
                $q->where('etudiant1_id', $monId)->orWhere('etudiant2_id', $monId);
            })->firstOrFail();

        $msg = Message::create([
            'conversation_id'  => $convId,
            'expediteur_id'    => $monId,
            'type'             => $request->type,
            'contenu_chiffre'  => $request->contenu_chiffre,
            'iv'               => $request->iv,
            'lu'               => false,
        ]);

        $conv->update(['dernier_message_at' => now()]);

        return response()->json($msg->load('expediteur'), 201);
    }

    public function envoyerImage(Request $request, $convId)
    {
        $request->validate([
            'contenu_chiffre' => 'required|string',
            'iv'              => 'required|string',
        ]);

        $monId = $request->user()->id;
        $conv = Conversation::where('id', $convId)
            ->where(function($q) use ($monId) {
                $q->where('etudiant1_id', $monId)->orWhere('etudiant2_id', $monId);
            })->firstOrFail();

        $path = null;

        // Essai 1 : fichier multipart normal
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $path = $request->file('image')->store('messagerie', 'public');
        }
        // Essai 2 : base64 (fallback iOS)
        elseif ($request->has('image_base64')) {
            $base64 = $request->image_base64;
            $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $base64);
            $base64 = str_replace(' ', '+', $base64);
            $imageData = base64_decode($base64);
            if ($imageData !== false) {
                $fileName = 'messagerie/' . uniqid() . '.jpg';
                Storage::disk('public')->put($fileName, $imageData);
                $path = $fileName;
            }
        }

        $msg = Message::create([
            'conversation_id'  => $convId,
            'expediteur_id'    => $monId,
            'type'             => 'image',
            'contenu_chiffre'  => $request->contenu_chiffre,
            'iv'               => $request->iv,
            'image_path'       => $path,
            'lu'               => false,
        ]);

        $conv->update(['dernier_message_at' => now()]);

        return response()->json($msg->load('expediteur'), 201);
    }

    public function updatePhoto(Request $request)
    {
        $request->validate(['photo' => 'required|file|mimes:jpg,jpeg,png|max:3072']);
        $path = $request->file('photo')->store('photos', 'public');
        $request->user()->update(['photo' => $path]);
        return response()->json(['photo' => $path]);
    }
}