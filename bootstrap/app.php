<?php

use App\Http\Middleware\EnforceSiteMode;
use App\Http\Middleware\EnsureActive;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureStudent;
use App\Http\Middleware\EnsureTeacher;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            EnsureActive::class,
            EnforceSiteMode::class,
        ]);

        $middleware->alias([
            'admin' => EnsureAdmin::class,
            'teacher' => EnsureTeacher::class,
            'student' => EnsureStudent::class,
            'active' => EnsureActive::class,
        ]);

        // Webhook eksternal + mobile API tidak punya CSRF token.
        $middleware->validateCsrfTokens(except: [
            'payment/midtrans-webhook',
            'api/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
