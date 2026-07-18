<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentRequis extends Model
{
    protected $fillable = ['type_demande_id', 'libelle', 'obligatoire'];

    protected $casts = ['obligatoire' => 'boolean'];

    public function typeDemande()
    {
        return $this->belongsTo(TypeDemande::class);
    }
}