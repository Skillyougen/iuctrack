<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::create([
            'nom'      => 'ANGO',
            'prenom'   => 'Jean-Baptiste',
            'email'    => 'admin@iuctrack.cm',
            'password' => Hash::make('admin123'),
            'role'     => 'super_admin',
        ]);
    }
}