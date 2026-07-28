<?php

namespace App\Support;

use App\Models\User\User;
use Spatie\Permission\PermissionRegistrar;

/**
 * Centralised post-login redirect helper.
 *
 * Use this trait in any controller that needs to decide where to send a user
 * after they authenticate.  Always call loginRedirectUrl() *after* the user is
 * fully persisted and has roles/permissions assigned.
 */
trait RedirectsAfterLogin
{
    /**
     * Return the correct post-login URL for $user.
     *
     * Resolution order (team members only):
     *   1. Has `dashboard` permission → /dashboard
     *   2. Has `pos` permission       → /point-of-sale
     *   3. Fallback                   → / (storefront)
     *
     * Customers (is_team_member = false) always go to /.
     */
    protected function loginRedirectUrl(User $user): string
    {
        if ($redirectTo = request()->input('redirect_to')) {
            return $redirectTo;
        }

        if (! $user->is_team_member) {
            return '/';
        }

        // Flush Spatie's in-process permission cache so any permissions
        // assigned in the *same* request are visible to ->can() checks.
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Reload the user with its role and direct-permission relationships so
        // ->can() does not rely on a potentially stale in-memory model.
        $user->load('roles.permissions', 'permissions');

        if ($user->can('dashboard')) {
            return '/dashboard';
        }

        if ($user->can('pos')) {
            return '/point-of-sale';
        }

        return '/';
    }
}
