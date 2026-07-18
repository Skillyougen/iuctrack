<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'etudiant_id', 'demande_id', 'titre', 'message', 'lue'
    ];

    protected $casts = ['lue' => 'boolean'];

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }
}