<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Laragear\TwoFactor\Facades\Auth2FA;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->ensureIsNotRateLimited();

        $attempt = Auth2FA::redirect(route('2fa.confirm'))
            ->input('2fa_code')
            ->attempt(
                $request->only('email', 'password'),
                $request->boolean('remember')
            );

        if ($attempt) {
            $user = Auth::user();
            if ($user) {
                if ($user->status === 'Inactive') {
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'email' => 'Your account has been deactivated. Please contact an administrator.',
                    ]);
                }
                $user->increment('visits');
            }
            \Illuminate\Support\Facades\RateLimiter::clear($request->throttleKey());
            $request->session()->regenerate();

            $roleName = $user->roles->first()?->name ?? '';

            // Role-based post-login redirect
            if ($roleName === 'Admin') {
                return redirect()->intended('/dashboard');
            } elseif ($roleName === 'Manager') {
                return redirect()->intended('/dashboard');
            } elseif ($roleName === 'Staff') {
                return redirect()->intended('/point-of-sale');
            }

            $fallback = $request->input('redirect_to') ?: '/';
            return redirect()->intended($fallback);
        }

        \Illuminate\Support\Facades\RateLimiter::hit($request->throttleKey());

        throw \Illuminate\Validation\ValidationException::withMessages([
            'email' => trans('auth.failed'),
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}

