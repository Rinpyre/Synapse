<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::get('/', function () {
    return response()->json(['message' => 'Welcome to Synapse']);
});

Route::get('/logs', [\App\Http\Controllers\LogController::class, 'index']);
Route::post('/suggestions', [\App\Http\Controllers\SuggestionController::class, 'index']);
