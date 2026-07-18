<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['etudiant1_id', 'etudiant2_id', 'dernier_message_at'];

    public function etudiant1() { return $this->belongsTo(Etudiant::class, 'etudiant1_id'); }
    public function etudiant2() { return $this->belongsTo(Etudiant::class, 'etudiant2_id'); }

    public function messages() { return $this->hasMany(Message::class)->orderBy('created_at', 'asc'); }

    // Relation dédiée pour récupérer le dernier message
    public function dernierMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function getAutreEtudiant(int $monId): Etudiant
    {
        return $this->etudiant1_id === $monId ? $this->etudiant2 : $this->etudiant1;
    }
}