<?php

use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\TaskController; // ✅ IMPORTANT

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';

// =======================
// TEMPORARY TEST ROUTES
// =======================

// Route::get('/tasks', [TaskController::class, 'index']);
// Route::post('/tasks', [TaskController::class, 'store']);
// Route::put('/tasks/{id}', [TaskController::class, 'update']);
// Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
// Route::patch('/tasks/{id}/status', [TaskController::class, 'toggleStatus']);