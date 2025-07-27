// app/excess-food/page.tsx
'use client';
import { ExcessFoodButton } from "@/components/ExcessFoodButton";
import { ExcessFoodListener } from "@/components/ExcessFoodListener";
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { BellRing, PlusCircle } from 'lucide-react'; // Importing icons

export default function ExcessFoodPage() {
  return (
    <div className="space-y-8">
      {/* This component is needed to show the pop-up notifications */}
      <Toaster position="bottom-right" />

      <div>
        <h1 className="text-3xl font-bold mb-2">Excess Food Dashboard</h1>
        <p className="text-muted-foreground">
          Notify nearby vendors about surplus food and see recent alerts.
        </p>
      </div>
      
      {/* Component to CREATE a new alert */}
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
            <PlusCircle className="w-6 h-6 mr-3 text-primary" />
            Create a New Alert
        </h2>
        <ExcessFoodButton />
      </div>

      {/* Component to SEE nearby alerts */}
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BellRing className="w-6 h-6 mr-3 text-primary" />
            Nearby Alerts
        </h2>
        <ExcessFoodListener />
      </div>

      <Link href="/vendor-home" className="block text-center text-primary hover:underline mt-8 font-semibold">
        &larr; Back to Dashboard
      </Link>
    </div>
  );
}