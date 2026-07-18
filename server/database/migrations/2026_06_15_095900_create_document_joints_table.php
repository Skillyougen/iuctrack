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
    Schema::create('document_joints', function (Blueprint $table) {
        $table->id();
        $table->foreignId('demande_id')->constrained('demandes')->onDelete('cascade');
        $table->foreignId('document_requis_id')->constrained('document_requis')->onDelete('cascade');
        $table->string('chemin_fichier');
        $table->string('nom_original');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_joints');
    }
};
