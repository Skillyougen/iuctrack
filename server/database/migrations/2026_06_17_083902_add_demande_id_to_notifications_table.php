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
    Schema::table('notifications', function (Blueprint $table) {
        $table->foreignId('demande_id')->nullable()->after('etudiant_id')->constrained('demandes')->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::table('notifications', function (Blueprint $table) {
        $table->dropForeign(['demande_id']);
        $table->dropColumn('demande_id');
    });
}
};
