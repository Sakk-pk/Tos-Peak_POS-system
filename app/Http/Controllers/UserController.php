<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->paginate(10)->appends(request()->query());
        $roles = Role::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Users/UserListPage', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        return Inertia::render('Users/UserFormPage', [
            'roles' => $roles
        ]);
    }

    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email'), // use table name and column explicitly
            ],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['nullable', 'string', 'exists:roles,name'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ])->validate();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $roleNames = [];
        if (!empty($validated['role'])) {
            $roleNames[] = $validated['role'];
        }
        if (!empty($validated['roles'])) {
            $roleNames = array_merge($roleNames, $validated['roles']);
        }

        if (!empty($roleNames)) {
            $user->assignRole($roleNames);
        }

        return to_route('users.index')->with("success", "User created successfully");
    }

    public function edit($id)
    {
        $user = User::with(['roles'])->find($id);
        $roles = Role::all();

        return Inertia::render('Users/UserFormPage', [
            'roles' => $roles,
            'user' => $user
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['nullable', 'string', 'exists:roles,name'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ])->validate();

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        $roleNames = [];
        if (!empty($validated['role'])) {
            $roleNames[] = $validated['role'];
        }
        if (!empty($validated['roles'])) {
            $roleNames = array_merge($roleNames, $validated['roles']);
        }

        if (!empty($roleNames)) {
            $user->syncRoles($roleNames);
        }

        return to_route('users.index')->with("success", "User updated successfully");
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return to_route('users.index')->with("success", "User Deleted successfully");
    }
}
