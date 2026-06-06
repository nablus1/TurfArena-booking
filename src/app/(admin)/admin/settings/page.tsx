"use client";

import { useState } from "react";
import {
  Settings,
  Save,
  Bell,
  Shield,
  CreditCard,
  Clock,
  Globe,
  Database,
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      // Connect to API later
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Settings saved successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-slate-900">
            System Settings
          </h1>
        </div>

        <p className="text-slate-600">
          Configure your Turf Booking Management System.
        </p>
      </div>

      <div className="space-y-6">
        {/* Booking Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              Booking Settings
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Default Turf Price (KES)
              </label>
              <input
                type="number"
                defaultValue={1500}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maximum Bookings Per Slot
              </label>
              <input
                type="number"
                defaultValue={1}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              Payment Settings
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5"
              />
              <span className="text-slate-800 font-medium">
                Enable M-Pesa Payments
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5"
              />
              <span className="text-slate-800 font-medium">
                Enable Cash Payments
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-5 w-5"
              />
              <span className="text-slate-800 font-medium">
                Enable Card Payments
              </span>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              Notification Settings
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5"
              />
              <span className="text-slate-800 font-medium">
                Booking Confirmation Notifications
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5"
              />
              <span className="text-slate-800 font-medium">
                Payment Notifications
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5"
              />
              <span className="text-slate-800 font-medium">
                Daily Admin Reports
              </span>
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              Security Settings
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Session Timeout (Minutes)
              </label>

              <input
                type="number"
                defaultValue={60}
                className="w-full md:w-64 rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5"
              />
              <span className="text-slate-800 font-medium">
                Require Admin Authentication
              </span>
            </label>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Database className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              System Information
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-100 rounded-lg p-4">
              <p className="text-sm text-slate-600">Application</p>
              <p className="font-semibold text-slate-900">
                Turf Booking System
              </p>
            </div>

            <div className="bg-slate-100 rounded-lg p-4">
              <p className="text-sm text-slate-600">Version</p>
              <p className="font-semibold text-slate-900">v1.0.0</p>
            </div>

            <div className="bg-slate-100 rounded-lg p-4">
              <p className="text-sm text-slate-600">Environment</p>
              <p className="font-semibold text-emerald-700">Production</p>
            </div>

            <div className="bg-slate-100 rounded-lg p-4">
              <p className="text-sm text-slate-600">Database</p>
              <p className="font-semibold text-slate-900">PostgreSQL</p>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              Regional Settings
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Currency
              </label>

              <select className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900">
                <option>KES</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Time Zone
              </label>

              <select className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900">
                <option>Africa/Nairobi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}