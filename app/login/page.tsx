// app/login/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { ExcessFoodButton } from '@/components/ExcessFoodButton';

export default function LoginPage() {
  const router = useRouter();
  const [isVendor, setIsVendor] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const checkVendor = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'vendor') {
          setIsVendor(true);
        }
      }
      setCheckedAuth(true);
    };
    checkVendor();
  }, [supabase]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(`Login failed: ${error.message}`);
    } else {
      // Check the user's role and redirect accordingly
      const { user } = data;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'vendor') {
          router.push('/vendor-home');
        } else {
          router.push('/group-chat');
        }
      } else {
        router.push('/group-chat');
      }
      router.refresh();
    }
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;

    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                username: username
            }
        }
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