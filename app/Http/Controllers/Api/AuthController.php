<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;
use Tymon\JWTAuth\Facades\JWTAuth;
use JWTAuthException;
use HasApiTokens;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    private function getToken($email, $password)
    {
        $token = null;
        try {
            if (!$token = JWTAuth::attempt( ['email' => $email, 'password'=>$password])) {
                return response()->json([
                    'response' => 'error',
                    'message' => 'Password or email is invalid',
                    'token'=> $token
                ]);
            }
        } catch (JWTAuthException $e) {
            return response()->json([
                'response' => 'error',
                'message' => 'Token creation failed',
            ]);
        }
        return $token;
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email|max:255',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error'   => true,
                'message' => 'Validation error',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'error'   => true,
                'email'   => true,
                'message' => 'The email address is not registered.'
            ], 401);
        }

        if ($user->status === 'Inactive') {
            return response()->json([
                'success' => false,
                'error'   => true,
                'message' => 'Your account has been deactivated. Please contact an administrator.'
            ], 403);
        }

        if ($user->status == 2) {
            return response()->json([
                'success' => false,
                'error'   => true,
                'message' => 'Your account has been deleted.'
            ], 403);
        }

        if (Hash::check($request->password, $user->password)) {
            $token = self::getToken($request->email, $request->password);
            if (!is_string($token)) {
                return response()->json([
                    'success' => false,
                    'error'   => true,
                    'message' => 'Token generation failed'
                ], 500);
            }

            $user->token = $token;
            $user->save();

            $roleName = $user->roles->first()?->name ?? 'Customer';
            $scheme = $request->getScheme();
            $host = $request->getHost();
            
            $redirectUrl = '/';
            if ($roleName !== 'Customer') {
                $redirectUrl = '/dashboard';
            }

            return response()->json([
                'success' => true,
                'error'   => false,
                'data'    => $user,
                'role'    => $roleName,
                'redirect_url' => $redirectUrl,
                'message' => 'Login successfully!'
            ]);
        }

        return response()->json([
            'success' => false,
            'error'   => true,
            'password' => true,
            'message' => 'The password is incorrect.'
        ], 401);
    }

    public function redirectToGoogle(Request $request)
    {
        if (! config('services.google.client_id') || ! config('services.google.client_secret')) {
            return redirect()
                ->route('login')
                ->with('status', 'Google login is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.');
        }

        $redirectUrl = route('google.callback');

        return Socialite::driver('google')
            ->redirectUrl($redirectUrl)
            ->stateless()
            ->redirect();
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $redirectUrl = route('google.callback');
            $googleUser = Socialite::driver('google')
                ->redirectUrl($redirectUrl)
                ->stateless()
                ->user();
        } catch (Throwable $e) {
            return redirect()
                ->route('login')
                ->withErrors(['email' => 'Unable to login with Google at the moment.']);
        }

        if (! $googleUser->getEmail()) {
            return redirect()
                ->route('login')
                ->withErrors(['email' => 'Google account did not return an email address.']);
        }

        // Prefer matching an existing user by email first to avoid creating
        // duplicate accounts when the user previously registered with the same email.
        $user = User::where('email', $googleUser->getEmail())->first();

        // If no user found by email, try finding by google_id
        if (! $user) {
            $user = User::where('google_id', $googleUser->getId())->first();
        }

        if ($user) {
            // Link the Google account to the existing user if not already linked.
            $updated = false;
            if (! $user->google_id) {
                $user->google_id = $googleUser->getId();
                $updated = true;
            }
            if (! $user->avatar && $googleUser->getAvatar()) {
                $user->avatar = $googleUser->getAvatar();
                $updated = true;
            }
            if (! $user->email_verified_at) {
                $user->email_verified_at = now();
                $updated = true;
            }

            if ($updated) {
                $user->save();
            }
        } else {
            $user = User::create([
                'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: 'Google User',
                'email' => $googleUser->getEmail(),
                'password' => Hash::make(Str::random(32)),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => now(),
            ]);
        }

        $token = JWTAuth::fromUser($user);
        $user->forceFill(['token' => $token])->save();

        $user->increment('visits');
        Auth::login($user, true);
        $request->session()->regenerate();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'error' => false,
                'message' => 'Google login successfully!',
                'token' => $token,
                'data' => $user,
            ]);
        }

        return redirect('/');
    }

    public function register(Request $request)
    { 
        try {
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
                'roles' => ['nullable'],
                'roles.*' => ['string', 'exists:roles,name'], // validate each role exists if provided
            ])->validate();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);
    
            // Assign the role
            if (!empty($validated['roles'])) {
                $validRoles = [];
                foreach ((array) $validated['roles'] as $roleName) {
                    if (\Spatie\Permission\Models\Role::where('name', $roleName)->exists()) {
                        $validRoles[] = $roleName;
                    }
                }
                if (!empty($validRoles)) {
                    $user->assignRole($validRoles);
                } else {
                    $user->assignRole('Staff');
                }
            } else {
                $user->assignRole('Staff');
            }
           
            if ($user->save()){
                $token = self::getToken($request->email, $request->password); // generate user token
                if (!is_string($token))  return response()->json(['success' => false,'message'=>'Token generation failed'], 201);
                $user = User::where('email', $request->email)->get()->first();
                $user->token = $token; // update user token
                $user->save();
                return response()->json(['success' => true, "error" => false, 'message' => 'You are register successfully!!!.', 'data' => $user], 200);        
            }else{
                return response()->json(['success' => false, "error" => false, 'message' => 'Something went worng, You cannot register!', 'data' => 'Can not register user'], 201);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function me(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $user->loadMissing('roles');
        $roleName = $user->roles->first()?->name ?? 'Customer';
        $scheme = $request->getScheme();
        $host = $request->getHost();
        $redirectUrl = match ($roleName) {
            'Admin' => '/dashboard',
            'Staff' => '/pos',
            default => '/'
        };

        return response()->json(array_merge($user->toArray(), [
            'role' => $roleName,
            'redirect_url' => $redirectUrl,
        ]));
    }
    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */

    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }
}
