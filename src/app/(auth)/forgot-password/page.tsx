"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Connect your API later
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
        }),
        });

        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.error);
        }

      setSent(true);
    } catch (error) {
      console.error(error);
      alert("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Mail className="h-8 w-8 text-emerald-600" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Forgot Password
            </h1>

            <p className="mt-2 text-slate-600">
              Enter your email address and we'll send you a password reset link.
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                <p className="text-emerald-800 font-medium">
                  Password reset instructions have been sent to:
                </p>

                <p className="mt-2 font-bold text-emerald-700">
                  {email}
                </p>
              </div>

              <p className="text-sm text-slate-600">
                Please check your inbox and spam folder.
              </p>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Turf Booking Management System
        </div>
      </div>
    </div>
  );
}