'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { useToast } from '@/src/components/ui/use-toast';
import { Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalAmount: number;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  turf: {
    name: string;
    location: string;
  };
}

export default function SchedulePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings/my-bookings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filterBookings = () => {
    const now = new Date();
    
    return bookings.filter((booking) => {
      const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
      
      if (filter === 'upcoming') {
        return bookingDateTime >= now && booking.status !== 'CANCELLED';
      } else if (filter === 'past') {
        return bookingDateTime < now || booking.status === 'CANCELLED';
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return filter === 'upcoming' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const filteredBookings = filterBookings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your schedule...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Schedule</h1>
          <p className="text-gray-600">View and manage your turf bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Bookings
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === 'past' ? 'default' : 'outline'}
            onClick={() => setFilter('past')}
          >
            Past
          </Button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                <p>You don't have any {filter !== 'all' ? filter : ''} bookings yet.</p>
                <Button className="mt-4" onClick={() => window.location.href = '/turfs'}>
                  Book a Turf
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left Section - Booking Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {booking.turf.name}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            {booking.turf.location}
                          </div>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="h-4 w-4 mr-2 text-green-600" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Clock className="h-4 w-4 mr-2 text-green-600" />
                          <span>
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <User className="h-4 w-4 mr-2 text-green-600" />
                          <span>{booking.user.name}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Phone className="h-4 w-4 mr-2 text-green-600" />
                          <span>{booking.user.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Amount & Actions */}
                    <div className="flex flex-col items-end gap-3 md:border-l md:pl-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-green-600">
                          KSh {booking.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      
                      {booking.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full md:w-auto"
                        >
                          Cancel Booking
                        </Button>
                      )}
                      
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          className="w-full md:w-auto"
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}