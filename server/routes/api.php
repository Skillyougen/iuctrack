<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\EtudiantAuthController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Admin\TypeDemandeController;
use App\Http\Controllers\Admin\DocumentRequisController;
use App\Http\Controllers\Admin\DemandeAdminController;
use App\Http\Controllers\Admin\EtudiantAdminController;
use App\Http\Controllers\Admin\AdminGestionController;
use App\Http\Controllers\Admin\ProfilAdminController;
use App\Http\Controllers\Admin\NotificationAdminController;
use App\Http\Controllers\Etudiant\DemandeController;
use App\Http\Controllers\Etudiant\NotificationController;
use App\Http\Controllers\Admin\IAController;
use App\Http\Controllers\Etudiant\MessagerieController;

Route::get('/messagerie/non-lus', [MessagerieController::class, 'nonLusTotal']);

// ─── PUBLIC ───────────────────────────────────────────────────────
Route::post('/ia/chat', [IAController::class, 'chat']);

Route::prefix('etudiant')->group(function () {
    Route::post('/check-matricule', [EtudiantAuthController::class, 'checkMatricule']);
    Route::post('/login',           [EtudiantAuthController::class, 'login']);
});

Route::post('/admin/login', [AdminAuthController::class, 'login']);

Route::get('/type-demandes',      [TypeDemandeController::class, 'index']);
Route::get('/type-demandes/{id}', [TypeDemandeController::class, 'show']);

// ─── PROTÉGÉES ÉTUDIANT ───────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('etudiant')->group(function () {
    Route::post('/logout',       [EtudiantAuthController::class, 'logout']);
    Route::get('/me',            [EtudiantAuthController::class, 'me']);
    Route::post('/set-password', [EtudiantAuthController::class, 'setPassword']);
    Route::post('/photo',        [MessagerieController::class, 'updatePhoto']); // ✅ CORRIGÉ

    Route::get('/demandes',      [DemandeController::class, 'index']);
    Route::get('/demandes/{id}', [DemandeController::class, 'show']);
    Route::post('/demandes',     [DemandeController::class, 'store']);

    Route::get('/notifications',                     [NotificationController::class, 'index']);
    Route::put('/notifications/toutes-lues',         [NotificationController::class, 'marquerToutesLues']);
    Route::put('/notifications/{id}/lue',            [NotificationController::class, 'marquerLue']);

    Route::get('/messagerie/conversations',           [MessagerieController::class, 'conversations']);
    Route::post('/messagerie/ouvrir',                [MessagerieController::class, 'ouvrirConversation']);
    Route::get('/messagerie/{convId}/messages',       [MessagerieController::class, 'messages']);
    Route::post('/messagerie/{convId}/envoyer',       [MessagerieController::class, 'envoyerMessage']);
    Route::post('/messagerie/{convId}/envoyer-image', [MessagerieController::class, 'envoyerImage']);
});

// ─── PROTÉGÉES ADMIN ──────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me',      [AdminAuthController::class, 'me']);

    // Notifications demande (sans auth:sanctum prefix)
    Route::post('demandes/{id}/notifier', [DemandeAdminController::class, 'notifierEtudiant']);

    // IA
    Route::post('ia/import-etudiants', [IAController::class, 'importEtudiants']);

    // Profil admin
    Route::get('/profil',          [ProfilAdminController::class, 'show']);
    Route::put('/profil',          [ProfilAdminController::class, 'update']);
    Route::put('/profil/password', [ProfilAdminController::class, 'updatePassword']);

    // Types de demandes
    Route::apiResource('type-demandes', TypeDemandeController::class);
    Route::post('type-demandes/{typeId}/documents',        [DocumentRequisController::class, 'store']);
    Route::put('type-demandes/{typeId}/documents/{id}',    [DocumentRequisController::class, 'update']);
    Route::delete('type-demandes/{typeId}/documents/{id}', [DocumentRequisController::class, 'destroy']);

    // Demandes
    Route::get('demandes',             [DemandeAdminController::class, 'index']);
    Route::get('demandes/{id}',        [DemandeAdminController::class, 'show']);
    Route::put('demandes/{id}/statut', [DemandeAdminController::class, 'changerStatut']);

    // Étudiants
    Route::get('etudiants',               [EtudiantAdminController::class, 'index']);
    Route::post('etudiants',              [EtudiantAdminController::class, 'store']);
    Route::get('etudiants/{id}/demandes', [EtudiantAdminController::class, 'demandes']);

    // Admins
    Route::get('admins',         [AdminGestionController::class, 'index']);
    Route::post('admins',        [AdminGestionController::class, 'store']);
    Route::delete('admins/{id}', [AdminGestionController::class, 'destroy']);

    // Notifications
    Route::get('notifications', [NotificationAdminController::class, 'index']);
});