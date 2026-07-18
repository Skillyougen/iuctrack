<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistoriqueStatut extends Model
{
    protected $fillable = [
        'demande_id', 'admin_id',
        'ancien_statut', 'nouveau_statut'
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }
}