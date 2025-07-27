'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import type { User } from '@supabase/supabase-js'; // at the top



export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true); // Track if we're still checking session
  const [user, setUser] = useState<User | null>(null);

  // On mount, check user session and redirect if already logged in
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return;
      setUser(user);
      setIsLoading(false);
      if (user) {
        // Check role and redirect
        supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.role === 'vendor') {
              window.location.href = '/vendor-home';
            } else {
              window.location.href = '/group-chat';
            }
          });
      }
    });
    return () => { mounted = false; };
  }, []);

  // Loading state prevents loop/flicker
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Checking authentication…</div>
      </div>
    );
  }
  // If user is here, then not logged in
  // --- Login handler ---
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(`Login failed: ${error.message}`);
    } else {
      const { user } = data;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'vendor') {
          window.location.href = '/vendor-home';
        } else {
          window.location.href = '/group-chat';
        }
      } else {
        window.location.href = '/group-chat';
      }
    }
  };

  // --- Signup handler ---
  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;

    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { username } }
    });

    if (error) {
      alert(`Signup failed: ${error.message}`);
    } else {
      alert('Signup successful! Please check your email to verify your account.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-center mb-4">Login</h2>
        <form onSubmit={handleLogin} className="space-y-3">
          <input name="email" type="email" required placeholder="Email" className="w-full p-2 border rounded"/>
          <input name="password" type="password" required placeholder="Password" className="w-full p-2 border rounded"/>
          <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Login</button>
        </form>

        <hr className="my-6"/>

        <h2 className="text-xl font-bold text-center mb-4">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-3">
          <input name="username" type="text" required placeholder="Your Vendor Name" className="w-full p-2 border rounded"/>
          <input name="email" type="email" required placeholder="Email" className="w-full p-2 border rounded"/>
          <input name="password" type="password" required placeholder="Password" className="w-full p-2 border rounded"/>
          <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
