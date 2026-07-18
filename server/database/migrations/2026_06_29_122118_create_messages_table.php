<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->foreignId('expediteur_id')->constrained('etudiants')->onDelete('cascade');
            $table->enum('type', ['texte', 'image', 'sticker'])->default('texte');
            $table->text('contenu_chiffre');
            $table->string('iv', 64);
            $table->string('image_path')->nullable();
            $table->boolean('lu')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('messages'); }
};