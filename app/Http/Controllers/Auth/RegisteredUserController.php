<?php

namespace App\Http\Controllers\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Notifications\RegisterUpdate;
use Illuminate\Support\Facades\Notification; // <--- CORRECT
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use App\Notifications\WelcomeNotification;
class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20'], // Optional phone number
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone, // Can be null

        ]);

        event(new Registered($user));
        $user->notify(new WelcomeNotification($user));
        $admins = User::where('role', 'admin')->get();
         Notification::send($admins, new RegisterUpdate(
                "New user registered: " . $user->name,
                $user
            ));
        Auth::login($user);
        // $request->session()->invalidate();

        // $request->session()->regenerateToken();

        return response()->noContent();
    }
}
