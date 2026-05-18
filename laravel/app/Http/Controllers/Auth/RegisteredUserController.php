<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RegisteredUserController extends Controller
{
    /**
     * Register manual dimatikan — semua jalur daftar pakai Google di /login.
     * Query param dilanjut biar konteks (mis. ?promo=only25k) tetap nyampai.
     */
    public function create(Request $request): RedirectResponse
    {
        $qs = http_build_query($request->query());
        return redirect($qs ? "/login?{$qs}" : '/login');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('login');
    }
}
