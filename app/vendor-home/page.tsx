'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient'; // Same client as in login
import Link from 'next/link';
import { ExcessFoodButton } from '@/components/ExcessFoodButton';

export default function VendorHomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      // Confirm vendor role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role === 'vendor') {
        if (mounted) setAuthorized(true);
      } else {
        window.location.href = '/group-chat';
      }
      setIsLoading(false);
    };
    checkAuth();
    return () => { mounted = false; };
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!authorized) return null;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Vendor Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! What would you like to do today?</p>
      </div>
      {/* Main Navigation Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/freshness-scan" className="p-6 bg-card border rounded-lg hover:bg-accent transition-colors flex flex-col items-center justify-center text-center">
          <h3 className="font-semibold text-lg">Food Freshness Check</h3>
          <p className="text-sm text-muted-foreground mt-1">Use AI to check the quality of your produce.</p>
        </Link>
        <Link href="/excess-food" className="p-6 bg-card border rounded-lg hover:bg-accent transition-colors flex flex-col items-center justify-center text-center">
          <h3 className="font-semibold text-lg">Excess Food Dashboard</h3>
          <p className="text-sm text-muted-foreground mt-1">Notify others about surplus items.</p>
        </Link>
        <Link href="/group-chat" className="p-6 bg-card border rounded-lg hover:bg-accent transition-colors flex flex-col items-center justify-center text-center">
          <h3 className="font-semibold text-lg">Group Ordering</h3>
          <p className="text-sm text-muted-foreground mt-1">Join forces to buy supplies in bulk.</p>
        </Link>
      </div>
      {/* Excess Food Form */}
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Quick Alert</h2>
        <ExcessFoodButton />
      </div>
    </div>
  );
}
