<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Etudiant extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'matricule', 'nom', 'prenom', 'filiere',
        'photo', 'password', 'has_password'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'has_password' => 'boolean',
        'password' => 'hashed',
    ];
}