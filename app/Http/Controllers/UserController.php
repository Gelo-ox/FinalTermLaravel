<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/Index', ['users' => User::with('roles')->orderBy('name')->get(['id', 'name', 'email']), 'roles' => ['Admin', 'Manager', 'User']]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate(['role' => ['required', Rule::in(['Admin', 'Manager', 'User'])]]);
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['role' => 'Ask another administrator to change your role.']);
        }
        DB::transaction(fn () => $user->syncRoles([$data['role']]));

        return back()->with('success', 'User role updated.');
    }
}
