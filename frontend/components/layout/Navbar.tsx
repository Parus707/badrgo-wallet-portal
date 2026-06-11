'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const active = 'px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white';
  const inactive = 'px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700';

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">
              W
            </div>
            <span className="font-semibold text-lg">Wallet Portal</span>
          </div>

          <div className="flex gap-1">
            <Link href="/" className={pathname === '/' ? active : inactive}>Dashboard</Link>
            <Link href="/users" className={pathname === '/users' ? active : inactive}>Users</Link>
            <Link href="/reports" className={pathname === '/reports' ? active : inactive}>Reports</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
