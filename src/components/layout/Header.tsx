"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/src/components/ui/button";
import { Menu, LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // theme hook
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">VA</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Volta Arena</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Book Your Playtime</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/schedule"
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 font-medium"
            >
              Schedule
            </Link>

            {session ? (
              <>
                {(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
                  <Link
                    href="/admin"
                    className="text-gray-700 dark:text-gray-300 hover:text-green-600 font-medium"
                  >
                    Admin Panel
                  </Link>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {session.user.name}
                  </span>
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

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t dark:border-gray-700">
            <nav className="flex flex-col space-y-3">

              {/* Dark Mode Toggle Mobile */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center space-x-2 py-2 text-gray-700 dark:text-gray-300"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-5 w-5" /> <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5" /> <span>Dark Mode</span>
                  </>
                )}
              </button>

              <Link href="/schedule" className="text-gray-700 dark:text-gray-300 hover:text-green-600 font-medium py-2">
                Schedule
              </Link>

              {session ? (
                <>
                  {(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
                    <Link
                      href="/admin"
                      className="text-gray-700 dark:text-gray-300 hover:text-green-600 font-medium py-2"
                    >
                      Admin Panel
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
