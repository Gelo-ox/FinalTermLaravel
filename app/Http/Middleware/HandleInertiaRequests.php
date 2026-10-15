<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [...parent::share($request),
            'auth' => fn () => ['user' => $request->user() ? [
                'id' => $request->user()->id, 'name' => $request->user()->name, 'email' => $request->user()->email,
                'roles' => $request->user()->getRoleNames(), 'permissions' => $request->user()->getAllPermissions()->pluck('name'),
            ] : null],
            'flash' => ['success' => fn () => $request->session()->get('success')],
            'status' => fn () => $request->session()->get('status'),
        ];
    }
}
