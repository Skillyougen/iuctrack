<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Etudiant;

class EtudiantSeeder extends Seeder
{
    public function run(): void
    {
        Etudiant::create([
            'matricule'    => 'IUC2024-0042',
            'nom'          => 'NGONO',
            'prenom'       => 'Karine',
            'filiere'      => 'Programmation et Applications Mobiles',
            'photo'        => null,
            'password'     => null,
            'has_password' => false,
        ]);
    }
}