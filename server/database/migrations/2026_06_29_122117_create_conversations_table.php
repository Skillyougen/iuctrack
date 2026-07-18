<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant1_id')->constrained('etudiants')->onDelete('cascade');
            $table->foreignId('etudiant2_id')->constrained('etudiants')->onDelete('cascade');
            $table->timestamp('dernier_message_at')->nullable();
            $table->timestamps();
            $table->unique(['etudiant1_id', 'etudiant2_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('conversations'); }
};