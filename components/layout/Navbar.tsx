// components/layout/Navbar.tsx
import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function Navbar() {
  return (
    <header className="bg-white dark:bg-slate-900 border-b sticky top-0 z-50">
      <nav className="max-w-5xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
        <Link href="/vendor-home" className="flex items-center gap-2 font-bold text-lg">
          <Leaf className="w-6 h-6 text-green-600" />
          <span>StreetSource</span>
        </Link>
        {/* You can add more links here later if you want */}
      </nav>
    </header>
  );
}