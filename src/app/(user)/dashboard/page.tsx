'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Download,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Booking {
  id: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  totalAmount: number;
  timeSlot: {
    date: string;
    startTime: string;
    endTime: string;
  };
  createdAt: string;
}

interface Stats {
  totalRevenue: number;
  revenueGrowth: number;
  totalBookings: number;
  bookingsGrowth: number;
  activeUsers: number;
  usersGrowth: number;
  occupancyRate: number;
  occupancyGrowth: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 245000,
    revenueGrowth: 12.5,
    totalBookings: 89,
    bookingsGrowth: 8.3,
    activeUsers: 156,
    usersGrowth: 15.2,
    occupancyRate: 72,
    occupancyGrowth: 5.8,
  });

  const [recentBookings, setRecentBookings] = useState<Booking[]>([
    {
      id: '1',
      bookingReference: 'BK-2024-089',
      customerName: 'John Kamau',
      customerEmail: 'john.kamau@email.com',
      status: 'CONFIRMED',
      totalAmount: 2500,
      timeSlot: {
        date: '2025-11-20',
        startTime: '14:00',
        endTime: '16:00',
      },
      createdAt: '2025-11-19T10:30:00Z',
    },
    {
      id: '2',
      bookingReference: 'BK-2024-088',
      customerName: 'Mary Wanjiku',
      customerEmail: 'mary.w@email.com',
      status: 'PENDING',
      totalAmount: 3000,
      timeSlot: {
        date: '2025-11-19',
        startTime: '18:00',
        endTime: '20:00',
      },
      createdAt: '2025-11-19T09:15:00Z',
    },
    {
      id: '3',
      bookingReference: 'BK-2024-087',
      customerName: 'Peter Omondi',
      customerEmail: 'p.omondi@email.com',
      status: 'COMPLETED',
      totalAmount: 2500,
      timeSlot: {
        date: '2025-11-18',
        startTime: '10:00',
        endTime: '12:00',
      },
      createdAt: '2025-11-18T08:20:00Z',
    },
    {
      id: '4',
      bookingReference: 'BK-2024-086',
      customerName: 'Sarah Njeri',
      customerEmail: 'sarah.njeri@email.com',
      status: 'CANCELLED',
      totalAmount: 2000,
      timeSlot: {
        date: '2025-11-17',
        startTime: '07:00',
        endTime: '08:00',
      },
      createdAt: '2025-11-17T06:45:00Z',
    },
  ]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const getStatusConfig = (status: Booking['status']) => {
    const configs = {
      CONFIRMED: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
      PENDING: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
      CANCELLED: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle },
      COMPLETED: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
    };
    return configs[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-emerald-600 mx-auto" />
          <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Time Range Filter */}
              <div className="flex items-center bg-white rounded-lg shadow-sm border border-slate-200">
                {(['today', 'week', 'month', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                      timeRange === range
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    } ${range === 'today' ? 'rounded-l-lg' : ''} ${range === 'year' ? 'rounded-r-lg' : ''}`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-emerald-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <span className={`text-sm font-semibold ${stats.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">KES {stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-2">vs last {timeRange}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <span className={`text-sm font-semibold ${stats.bookingsGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.bookingsGrowth >= 0 ? '+' : ''}{stats.bookingsGrowth}%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Bookings</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
              <p className="text-xs text-slate-500 mt-2">vs last {timeRange}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <span className={`text-sm font-semibold ${stats.usersGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.usersGrowth >= 0 ? '+' : ''}{stats.usersGrowth}%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Active Users</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
              <p className="text-xs text-slate-500 mt-2">vs last {timeRange}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <span className={`text-sm font-semibold ${stats.occupancyGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.occupancyGrowth >= 0 ? '+' : ''}{stats.occupancyGrowth}%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Occupancy Rate</p>
              <p className="text-2xl font-bold text-slate-900">{stats.occupancyRate}%</p>
              <p className="text-xs text-slate-500 mt-2">vs last {timeRange}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Calendar className="h-8 w-8 mb-3 opacity-90" />
              <h3 className="text-lg font-semibold mb-1">Manage Bookings</h3>
              <p className="text-sm text-emerald-100 mb-4">View and manage all bookings</p>
              <Button variant="secondary" size="sm" className="bg-white text-emerald-700 hover:bg-emerald-50">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Clock className="h-8 w-8 mb-3 opacity-90" />
              <h3 className="text-lg font-semibold mb-1">Manage Schedule</h3>
              <p className="text-sm text-blue-100 mb-4">Configure time slots and pricing</p>
              <Button variant="secondary" size="sm" className="bg-white text-blue-700 hover:bg-blue-50">
                Configure
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Users className="h-8 w-8 mb-3 opacity-90" />
              <h3 className="text-lg font-semibold mb-1">Manage Users</h3>
              <p className="text-sm text-purple-100 mb-4">View and manage user accounts</p>
              <Button variant="secondary" size="sm" className="bg-white text-purple-700 hover:bg-purple-50">
                View Users
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings Table */}
        <Card>
          <CardHeader className="border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Latest booking activities and transactions</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Booking Ref
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentBookings.map((booking) => {
                    const statusConfig = getStatusConfig(booking.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-900">{booking.bookingReference}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{booking.customerName}</p>
                            <p className="text-sm text-slate-500">{booking.customerEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {new Date(booking.timeSlot.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-sm text-slate-500">
                              {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-900">
                            KES {booking.totalAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of{' '}
                <span className="font-medium">89</span> results
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}