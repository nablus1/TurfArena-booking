'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  revenueGrowth: number;
  bookingsGrowth: number;
}

interface RecentBooking {
  id: string;
  bookingReference: string;
  userName: string;
  date: string;
  time: string;
  amount: number;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/admin/bookings?limit=5&sort=latest'),
      ]);

      const statsData = await statsRes.json();
      const bookingsData = await bookingsRes.json();

      setStats(statsData);
      setRecentBookings(bookingsData.bookings);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `KES ${stats?.totalRevenue.toLocaleString() || 0}`,
      icon: DollarSign,
      change: `+${stats?.revenueGrowth || 0}%`,
      changeType: 'positive',
      bgColor: 'bg-green-500',
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      change: `+${stats?.bookingsGrowth || 0}%`,
      changeType: 'positive',
      bgColor: 'bg-blue-500',
    },
    {
      title: "Today's Bookings",
      value: stats?.todayBookings || 0,
      icon: Clock,
      change: 'Today',
      changeType: 'neutral',
      bgColor: 'bg-purple-500',
    },
    {
      title: 'Pending',
      value: stats?.pendingBookings || 0,
      icon: Clock,
      change: 'Awaiting payment',
      changeType: 'neutral',
      bgColor: 'bg-yellow-500',
    },
    {
      title: 'Confirmed',
      value: stats?.confirmedBookings || 0,
      icon: CheckCircle,
      change: 'Active bookings',
      changeType: 'positive',
      bgColor: 'bg-green-500',
    },
    {
      title: 'Cancelled',
      value: stats?.cancelledBookings || 0,
      icon: XCircle,
      change: 'This month',
      changeType: 'negative',
      bgColor: 'bg-red-500',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to Juja Turf Arena Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : stat.changeType === 'negative'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">
                    Reference
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No bookings yet
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">
                          {booking.bookingReference}
                        </span>
                      </td>
                      <td className="py-3 px-4">{booking.userName}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p>{booking.date}</p>
                          <p className="text-gray-500">{booking.time}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        KES {booking.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition cursor-pointer">
          <CardContent className="p-6">
            <Calendar className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold mb-2">Manage Slots</h3>
            <p className="text-sm text-gray-500">
              Add or edit available time slots
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition cursor-pointer">
          <CardContent className="p-6">
            <Users className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold mb-2">View All Bookings</h3>
            <p className="text-sm text-gray-500">
              Manage and validate bookings
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition cursor-pointer">
          <CardContent className="p-6">
            <TrendingUp className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-gray-500">View detailed reports</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}