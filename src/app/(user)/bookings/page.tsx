'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Search, Filter } from 'lucide-react';

interface Booking {
  id: string;
  bookingReference: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  timeSlot: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

export default function BookingsPage() {
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
        ? '/api/bookings?limit=50'
        : `/api/bookings?status=${statusFilter}&limit=50`;
      
      const response = await fetch(url);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-1">View and manage your bookings</p>
        </div>
        <Link href="/bookings/new">
          <Button>New Booking</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by booking reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex space-x-2">
              {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'].map((status) => (
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

      {/* Bookings List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">No bookings found</p>
            <Link href="/bookings/new">
              <Button>Make a Booking</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{booking.bookingReference}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium">
                          {new Date(booking.timeSlot.date).toLocaleDateString('en-KE')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-medium">
                          {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="font-medium">KES {booking.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Booked</p>
                        <p className="font-medium">
                          {new Date(booking.createdAt).toLocaleDateString('en-KE')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link href={`/bookings/${booking.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
