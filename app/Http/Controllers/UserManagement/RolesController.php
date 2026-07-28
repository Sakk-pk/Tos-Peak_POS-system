<?php

namespace App\Http\Controllers\UserManagement;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use App\Models\User\User;

class RolesController extends Controller
{
    /** Permission catalogue for the administration modules. */
    private const PERMISSION_CATALOGUE = [
        'dashboard'    => ['label' => 'Dashboard', 'type' => 'module'],
        'pos'          => ['label' => 'POS', 'type' => 'module'],
        'catalog'      => ['label' => 'Catalog Settings', 'type' => 'module'],
        'products'     => ['label' => 'Products', 'type' => 'module'],
        'inventory'    => ['label' => 'Inventory', 'type' => 'module'],
        'orders'       => ['label' => 'Orders', 'type' => 'module'],
        'customers'    => ['label' => 'Customers', 'type' => 'module'],
        'team-members' => ['label' => 'Team Members', 'type' => 'module'],
        'roles'        => ['label' => 'Roles', 'type' => 'module'],
    ];

    public function index()
    {
        $roles = Role::with('permissions')
            ->orderBy('name')
            ->get();

        $rolesWithUserCount = $roles->map(function ($role) {
            return [
                'id'          => $role->id,
                'name'        => $role->name,
                'is_system'   => false,
                'users_count' => User::role($role->name)->count(),
                'permissions' => $role->permissions->pluck('name')->values(),
            ];
        });

        // Build the ordered permission catalogue from the DB
        $dbPermissions = Permission::whereIn('name', array_keys(self::PERMISSION_CATALOGUE))
            ->get()
            ->keyBy('name');

        $catalogue = collect(self::PERMISSION_CATALOGUE)
            ->map(function ($meta, $permName) use ($dbPermissions) {
                $perm = $dbPermissions->get($permName);
                return $perm ? [
                    'id'    => $perm->id,
                    'name'  => $perm->name,
                    'label' => $meta['label'],
                    'type'  => $meta['type'],
                ] : null;
            })
            ->filter()
            ->values();

        return Inertia::render('Admin/Roles/RolesListPage', [
            'roles'       => $rolesWithUserCount,
            'permissions' => $catalogue,
        ]);
    }

    public function create()
    {
        $permissions = Permission::whereIn('name', array_keys(self::PERMISSION_CATALOGUE))
            ->get(['id', 'name']);

        return Inertia::render('Admin/Roles/RoleFormPage', [
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|min:3|unique:roles,name',
            'permissions'   => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::create([
            'name'       => $validated['name'],
            'guard_name' => 'web',
        ]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        return to_route('roles.index')->with('success', 'Role created successfully.');
    }

    public function edit($id)
    {
        $role = Role::with(['permissions'])->findOrFail($id);

        $permissions = Permission::whereIn('name', array_keys(self::PERMISSION_CATALOGUE))
            ->get(['id', 'name']);

        return Inertia::render('Admin/Roles/RoleFormPage', [
            'role'        => [
                'id'          => $role->id,
                'name'        => $role->name,
                'is_system'   => false,
                'permissions' => $role->permissions->pluck('name')->values(),
            ],
            'permissions' => $permissions,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name'          => 'required|min:3|unique:roles,name,' . $id,
            'permissions'   => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::findById($id);

        $role->name = $validated['name'];
        $role->save();

        $role->syncPermissions($validated['permissions'] ?? []);

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        return to_route('roles.index')->with('success', 'Role updated successfully.');
    }

    public function destroy($id)
    {
        $role = Role::findById($id);

        $role->delete();

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        return to_route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
