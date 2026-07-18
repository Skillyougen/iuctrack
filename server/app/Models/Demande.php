<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    protected $fillable = ['etudiant_id', 'type_demande_id', 'statut'];

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function typeDemande()
    {
        return $this->belongsTo(TypeDemande::class);
    }

    public function documentsJoints()
    {
        return $this->hasMany(DocumentJoint::class);
    }

    public function historique()
    {
        return $this->hasMany(HistoriqueStatut::class);
    }
}