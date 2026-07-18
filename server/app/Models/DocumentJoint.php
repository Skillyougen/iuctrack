<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentJoint extends Model
{
    protected $fillable = [
        'demande_id', 'document_requis_id',
        'chemin_fichier', 'nom_original'
    ];

    public function documentRequis()
    {
        return $this->belongsTo(DocumentRequis::class);
    }
}