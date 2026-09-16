<?php

use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::put('/tasks/{id}', [TaskController::class, 'update']);
Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
Route::patch('/tasks/{id}/status', [TaskController::class, 'toggleStatus']);
Route::post('/tasks/{id}/assignees', [TaskController::class, 'addAssignee']);
Route::delete('/tasks/{id}/assignees/{userId}', [TaskController::class, 'removeAssignee']);

Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

Route::get('/projects', [ProjectController::class, 'index']);
Route::post('/projects', [ProjectController::class, 'store']);
Route::get('/projects/{id}/progress', [ProjectController::class, 'progress']);
Route::post('/projects/{id}/members', [ProjectController::class, 'addMember']);