<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission  The required permission
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, $permission): Response
    {
        // Get the currently authenticated user
        $user = $request->user();

        if (! $user) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->guest(route('login'));
        }

        // Check if the user has the specified permission.
        try {
            if ($user->hasRole('Admin')) {
                return $next($request);
            }
            if (! $user->hasPermissionTo($permission)) {
                abort(403, 'You do not have the required permission.');
            }
        } catch (PermissionDoesNotExist) {
            if ($user->hasRole('Admin')) {
                return $next($request);
            }
            abort(403, 'You do not have the required permission.');
        }

        // If permission is granted, allow the request to continue
        return $next($request);
    }
}
