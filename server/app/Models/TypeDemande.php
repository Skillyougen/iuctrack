<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeDemande extends Model
{
    protected $fillable = ['libelle', 'description', 'actif'];

    protected $casts = ['actif' => 'boolean'];

    public function documentsRequis()
    {
        return $this->hasMany(DocumentRequis::class);
    }

    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }
}