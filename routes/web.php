<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route(auth()->check() ? 'dashboard' : 'login'));
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', DashboardController::class)->middleware('permission:dashboard.view')->name('dashboard');
    require __DIR__.'/products.php';
    require __DIR__.'/product-categories.php';
    require __DIR__.'/suppliers.php';
    require __DIR__.'/transactions.php';
    require __DIR__.'/users.php';
});
