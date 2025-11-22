'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  BarChart3,
  Settings,
  Scan,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Time Slots', href: '/admin/slots', icon: CheckSquare },
  { name: 'Validate Tickets', href: '/admin/validate', icon: Scan },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
      </div>
      <nav className="px-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}