<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('etudiants', function (Blueprint $table) {
        $table->id();
        $table->string('matricule')->unique();
        $table->string('nom');
        $table->string('prenom');
        $table->string('filiere');
        $table->string('photo')->nullable();
        $table->string('password')->nullable();
        $table->boolean('has_password')->default(false);
        $table->rememberToken();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('etudiants');
    }
};
