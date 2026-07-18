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
    Schema::create('demandes', function (Blueprint $table) {
        $table->id();
        $table->foreignId('etudiant_id')->constrained('etudiants')->onDelete('cascade');
        $table->foreignId('type_demande_id')->constrained('type_demandes')->onDelete('cascade');
        $table->enum('statut', ['envoyee', 'en_cours', 'terminee'])->default('envoyee');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
