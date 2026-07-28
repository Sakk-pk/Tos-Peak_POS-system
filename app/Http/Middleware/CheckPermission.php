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

        if ($user) {
            app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
            $user->load('roles.permissions', 'permissions');
        }

        if (! $user) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->guest(route('login'));
        }

        // Module permissions are the sole authorization boundary for admin routes.
        try {
            if (! $user->hasPermissionTo($permission)) {
                abort(403, 'You do not have the required permission.');
            }
        } catch (PermissionDoesNotExist) {
            abort(403, 'You do not have the required permission.');
        }

        // If permission is granted, allow the request to continue
        return $next($request);
    }
}
