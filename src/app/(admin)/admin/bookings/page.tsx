'use client';

import { useEffect, useState } from 'react';
import {
  Search, Eye, Download, Plus, RefreshCw, Calendar,
  Users, CheckCircle, Clock, DollarSign, X, ChevronRight, 
  TrendingUp, ArrowUpRight, Filter, Mail, Phone, Sparkles
} from 'lucide-react';

interface Booking {
  id: string;
  bookingReference: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  date?: string;
  time?: string;
  amount: number;
  status: string;
  paymentStatus?: string;
}

interface BookingFormData {
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  timeSlotId: string;
  amount: number;
}

// Helper function to safely get user initials
const getUserInitials = (name: string | null | undefined): string => {
  if (!name) return '??';
  const trimmedName = name.trim();
  if (!trimmedName) return '??';
  
  const parts = trimmedName.split(' ').filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return parts.map(n => n.charAt(0).toUpperCase()).join('');
};

// Enhanced Stat Card Component
function EnhancedStatCard({ icon: Icon, label, value, subtext, color, trend }: any) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 text-emerald-700',
    blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-700',
    amber: 'from-amber-500 to-amber-600 bg-amber-50 text-amber-700',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-700',
  };

  return (
    <div className="group bg-white rounded-lg p-4 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[color as keyof typeof colorClasses].split(' ')[1]} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          {trend && (
            <div className="flex items-center gap-0.5 text-emerald-600 text-xs font-semibold">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </div>
          )}
        </div>
        <p className="text-slate-500 text-xs font-medium mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<BookingFormData>({
    userName: '',
    userEmail: '',
    userPhone: '',
    date: '',
    timeSlotId: '',
    amount: 3000,
  });

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/bookings");
        const data = await res.json();
        setBookings(data);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter, dateFilter]);

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create booking");

      const newBooking = await res.json();
      setBookings(prev => [...prev, newBooking]);
      setIsAddDialogOpen(false);

      setFormData({
        userName: "",
        userEmail: "",
        userPhone: "",
        date: "",
        timeSlotId: "",
        amount: 3000,
      });

      alert("Booking created successfully!");
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userPhone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
    const matchesDate = !dateFilter || booking.date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportToCSV = () => {
    alert('Exporting to CSV...');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      CONFIRMED: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
      PENDING: 'bg-amber-100 text-amber-700 ring-amber-600/20',
      CANCELLED: 'bg-rose-100 text-rose-700 ring-rose-600/20',
      COMPLETED: 'bg-blue-100 text-blue-700 ring-blue-600/20',
      REFUNDED: 'bg-purple-100 text-purple-700 ring-purple-600/20',
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
        <span className={`w-1 h-1 rounded-full mr-1.5 ${
          status === 'CONFIRMED' ? 'bg-emerald-600' :
          status === 'PENDING' ? 'bg-amber-600' :
          status === 'CANCELLED' ? 'bg-rose-600' :
          status === 'COMPLETED' ? 'bg-blue-600' : 'bg-purple-600'
        }`} />
        {status}
      </span>
    );
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    revenue: bookings
      .filter(b => b.paymentStatus === 'COMPLETED')
      .reduce((sum, b) => sum + b.amount, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bookings Management</h1>
          </div>
          <p className="text-sm text-slate-600">View, manage, and create turf bookings</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setLoading(true);
              window.location.reload();
            }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:shadow-md transition-all duration-200 text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:shadow-md transition-all duration-200 text-sm font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Booking
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <EnhancedStatCard
          icon={Users}
          label="Total Bookings"
          value={stats.total}
          subtext="All time bookings"
          color="emerald"
          trend="+12%"
        />
        <EnhancedStatCard
          icon={CheckCircle}
          label="Confirmed"
          value={stats.confirmed}
          subtext="Ready to play"
          color="blue"
        />
        <EnhancedStatCard
          icon={Clock}
          label="Pending"
          value={stats.pending}
          subtext="Awaiting confirmation"
          color="amber"
        />
        <EnhancedStatCard
          icon={DollarSign}
          label="Revenue"
          value={`KES ${stats.revenue.toLocaleString()}`}
          subtext="Completed payments"
          color="purple"
          trend="+8.2%"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative md:col-span-5">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by reference, name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>

          <div className="md:col-span-3 relative">
            <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>

          <div className="md:col-span-4 flex gap-2">
            <div className="relative flex-1">
              <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm appearance-none bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            {(statusFilter !== 'ALL' || dateFilter) && (
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setDateFilter('');
                }}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
<div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50/50">
          <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Reference</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date & Time</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
          <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Payment</th>
          <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {loading ? (
          <tr>
            <td colSpan={8} className="text-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Loading bookings...</p>
              </div>
            </td>
          </tr>
        ) : filteredBookings.length === 0 ? (
          <tr>
            <td colSpan={8} className="text-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-slate-400" />
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-sm">No bookings found</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {searchTerm || statusFilter !== 'ALL' || dateFilter
                      ? 'Try adjusting your filters'
                      : 'Get started by creating your first booking'}
                  </p>
                </div>
              </div>
            </td>
          </tr>
        ) : (
          filteredBookings.map((booking, index) => (
            <tr 
              key={booking.id} 
              className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-transparent transition-all duration-200 group"
            >
              <td className="px-4 py-3">
                <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-50 px-2 py-1 rounded">
                  {booking.bookingReference}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform">
                    <span className="text-xs font-bold text-emerald-700">
                      {getUserInitials(booking.userName || booking.user?.name)}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {booking.userName || booking.user?.name || 'Unknown User'}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Mail className="h-3 w-3 text-slate-400" />
                    {booking.userEmail || booking.user?.email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone className="h-3 w-3 text-slate-400" />
                    {booking.userPhone || booking.user?.phone || 'N/A'}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900 text-xs">{booking.date || 'N/A'}</p>
                  <p className="text-slate-500 text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {booking.time || 'N/A'}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-bold text-slate-900 text-sm">
                  KES {booking.amount?.toLocaleString() || '0'}
                </span>
              </td>
              <td className="px-4 py-3">
                {getStatusBadge(booking.status)}
              </td>
              <td className="px-4 py-3">
                {getStatusBadge(booking.paymentStatus || 'PENDING')}
              </td>
              <td className="px-4 py-3 text-right">
                <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all text-xs font-medium opacity-0 group-hover:opacity-100">
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>


      {/* Results Count */}
      {!loading && filteredBookings.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{filteredBookings.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{bookings.length}</span> booking(s)
          </p>
        </div>
      )}

{/* Add Booking Dialog */}
{isAddDialogOpen && (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New Booking</h2>
            <p className="text-xs text-slate-500 mt-0.5">Add a new booking manually</p>
          </div>
          <button
            onClick={() => setIsAddDialogOpen(false)}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleAddBooking} className="p-4 space-y-3">

        {/* Customer Info */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Customer Name</label>
          <input
            type="text"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            placeholder="John Doe"
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            value={formData.userEmail}
            onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
            placeholder="john@example.com"
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={formData.userPhone}
            onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
            placeholder="+254712345678"
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
          />
        </div>

        {/* Date & Slot */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value, timeSlotId: '' })}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Time Slot</label>
            <select
              value={formData.timeSlotId}
              onChange={(e) => setFormData({ ...formData, timeSlotId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              disabled={!formData.date || availableSlots.length === 0}
            >
              <option value="" disabled>
                {availableSlots.length === 0 ? 'Select a date first' : 'Select a slot'}
              </option>
              {availableSlots.map(slot => (
                <option key={slot.id} value={slot.id} disabled={!slot.isAvailable}>
                  {slot.startTime} - {slot.endTime} {slot.isAvailable ? '' : '(Full)'}
                </option>
              ))}
            </select>
            {formData.timeSlotId && (
              <p className="text-xs text-slate-500 mt-1">
                Price: KES {availableSlots.find(s => s.id === formData.timeSlotId)?.price?.toLocaleString() || 'N/A'}
              </p>
            )}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Amount (KES)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            min="0"
            step="100"
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsAddDialogOpen(false)}
            className="flex-1 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all text-sm font-medium"
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}