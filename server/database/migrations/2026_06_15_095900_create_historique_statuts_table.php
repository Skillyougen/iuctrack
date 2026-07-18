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
    Schema::create('historique_statuts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('demande_id')->constrained('demandes')->onDelete('cascade');
        $table->foreignId('admin_id')->constrained('admins')->onDelete('cascade');
        $table->enum('ancien_statut', ['envoyee', 'en_cours', 'terminee'])->nullable();
        $table->enum('nouveau_statut', ['envoyee', 'en_cours', 'terminee']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historique_statuts');
    }
};
