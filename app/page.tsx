// app/page.tsx
import { supabase } from '@/utils/supabaseClient';
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  // Simple check to see if user is logged in.
  // In a real app, this would be in middleware.
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/group-chat');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center">Welcome to StreetSource</h1>
            <p className="text-center">Please log in to continue.</p>
            <Link href="/login" className="block w-full text-center p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Go to Login
            </Link>
        </div>
    </div>
  );
}