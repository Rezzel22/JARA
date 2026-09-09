// routes/api.php (sementara, untuk testing lokal)
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::delete('/users/{user}', [UserController::class, 'destroy']);