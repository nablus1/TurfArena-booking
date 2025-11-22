'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { Search, Eye, Download } from 'lucide-react';

interface Booking {
  id: string;
  bookingReference: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  time: string;
  amount: number;
  status: string;
  paymentStatus: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'ALL'
        ? '/api/admin/bookings?limit=100'
        : `/api/admin/bookings?status=${statusFilter}&limit=100`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Transform data
      const transformed = await Promise.all(
        data.bookings.map(async (b: any) => {
          const fullBooking = await fetch(`/api/bookings/${b.id}`).then(r => r.json());
          return {
            id: b.id,
            bookingReference: b.bookingReference,
            userName: b.userName,
            userEmail: fullBooking.user.email,
            userPhone: fullBooking.user.phone,
            date: b.date,
            time: b.time,
            amount: b.amount,
            status: b.status,
            paymentStatus: fullBooking.payment?.status || 'PENDING',
          };
        })
      );
      
      setBookings(transformed);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Reference', 'Customer', 'Email', 'Phone', 'Date', 'Time', 'Amount', 'Status'];
    const csvData = filteredBookings.map(b => [
      b.bookingReference,
      b.userName,
      b.userEmail,
      b.userPhone,
      b.date,
      b.time,
      b.amount,
      b.status,
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
          <p className="text-gray-500 mt-1">Manage customer bookings</p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex space-x-2">
              {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-sm">
                      {booking.bookingReference}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.userName}</p>
                        <p className="text-sm text-gray-500">{booking.userPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{booking.date}</p>
                        <p className="text-gray-500">{booking.time}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      KES {booking.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/bookings/${booking.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}