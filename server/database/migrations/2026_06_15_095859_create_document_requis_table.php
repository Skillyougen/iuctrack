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
    Schema::create('document_requis', function (Blueprint $table) {
        $table->id();
        $table->foreignId('type_demande_id')->constrained('type_demandes')->onDelete('cascade');
        $table->string('libelle');
        $table->boolean('obligatoire')->default(true);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_requis');
    }
};
