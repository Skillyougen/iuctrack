<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'conversation_id', 'expediteur_id',
        'type', 'contenu_chiffre', 'iv', 'image_path', 'lu'
    ];

    public function expediteur() { return $this->belongsTo(Etudiant::class, 'expediteur_id'); }
    public function conversation() { return $this->belongsTo(Conversation::class); }
}