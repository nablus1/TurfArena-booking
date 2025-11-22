'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/src/components/ui/button';
import { Menu, User, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">JT</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">Juja Turf Arena</h1>
              <p className="text-xs text-gray-500">Book Your Game</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/schedule" className="text-gray-700 hover:text-green-600 font-medium">
              Schedule
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-green-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/bookings" className="text-gray-700 hover:text-green-600 font-medium">
                  My Bookings
                </Link>
                {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
                  <Link href="/admin" className="text-gray-700 hover:text-green-600 font-medium">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">{session.user.name}</span>
                  <Button variant="outline" size="sm" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-3">
              <Link href="/schedule" className="text-gray-700 hover:text-green-600 font-medium py-2">
                Schedule
              </Link>
              {session ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-green-600 font-medium py-2">
                    Dashboard
                  </Link>
                  <Link href="/bookings" className="text-gray-700 hover:text-green-600 font-medium py-2">
                    My Bookings
                  </Link>
                  {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
                    <Link href="/admin" className="text-gray-700 hover:text-green-600 font-medium py-2">
                      Admin
                    </Link>
                  )}
                  <Button variant="outline" onClick={() => signOut()}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full">Register</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
export { Header };