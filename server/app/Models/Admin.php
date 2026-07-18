<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'role',
        'permissions',
        'photo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}