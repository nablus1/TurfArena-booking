// src/app/(admin)/admin/validate/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useToast } from '@/src/components/ui/use-toast';
import {
  CheckCircle,
  XCircle,
  Scan,
  User,
  Calendar,
  Clock,
  DollarSign,
} from 'lucide-react';

interface BookingDetails {
  id: string;
  bookingReference: string;
  status: string;
  isValidated: boolean;
  validatedAt: string | null;
  user: {
    name: string;
    phone: string;
    email: string;
  };
  timeSlot: {
    date: string;
    startTime: string;
    endTime: string;
  };
  totalAmount: number;
  payment: {
    mpesaReceiptNumber: string | null;
    status: string;
  } | null;
}

export default function ValidateTicket() {
  const [qrCode, setQrCode] = useState('');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!qrCode.trim()) {
      toast({
        title: 'Required',
        description: 'Please enter a QR code or booking reference',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setBooking(null);

    try {
      const response = await fetch(`/api/bookings/validate?code=${qrCode}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Booking not found');
      }

      const data = await response.json();
      setBooking(data.booking);

      // Check if already validated
      if (data.booking.isValidated) {
        toast({
          title: 'Already Validated',
          description: `This ticket was validated on ${new Date(
            data.booking.validatedAt
          ).toLocaleString('en-KE')}`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!booking) return;

    setValidating(true);

    try {
      const response = await fetch(`/api/bookings/${booking.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Validation failed');
      }

      toast({
        title: 'Ticket Validated ✓',
        description: 'Customer can now enter the turf',
      });

      // Refresh booking details
      setBooking({
        ...booking,
        isValidated: true,
        validatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setValidating(false);
    }
  };

  const handleReset = () => {
    setQrCode('');
    setBooking(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const canValidate =
    booking &&
    !booking.isValidated &&
    booking.status === 'CONFIRMED' &&
    booking.payment?.status === 'COMPLETED';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Validate Ticket</h1>
        <p className="text-gray-500 mt-1">
          Scan QR code or enter booking reference
        </p>
      </div>

      {/* Scanner Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scan Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="qrCode">QR Code / Booking Reference</Label>
            <Input
              id="qrCode"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Enter code or scan QR"
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleScan} disabled={loading} className="flex-1">
              {loading ? 'Scanning...' : 'Verify Ticket'}
            </Button>
            {booking && (
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>

          {/* Web Camera Scanner Option */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500 mb-3">Or use camera to scan</p>
            <Button variant="secondary" className="gap-2">
              <Scan className="h-4 w-4" />
              Open Camera Scanner
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      {booking && (
        <Card
          className={`border-2 ${
            booking.isValidated
              ? 'border-green-500 bg-green-50'
              : canValidate
              ? 'border-blue-500 bg-blue-50'
              : 'border-red-500 bg-red-50'
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Booking Details</CardTitle>
              {booking.isValidated ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="h-5 w-5" />
                  Validated
                </div>
              ) : canValidate ? (
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <Clock className="h-5 w-5" />
                  Ready to Validate
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 font-semibold">
                  <XCircle className="h-5 w-5" />
                  Cannot Validate
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status}
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer
                  </p>
                  <p className="font-semibold">{booking.user.name}</p>
                  <p className="text-sm text-gray-600">{booking.user.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </p>
                  <p className="font-semibold">
                    {new Date(booking.timeSlot.date).toLocaleDateString(
                      'en-KE',
                      {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Slot
                  </p>
                  <p className="font-semibold">
                    {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Amount Paid
                  </p>
                  <p className="font-semibold text-lg">
                    KES {booking.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {booking.payment?.mpesaReceiptNumber && (
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-sm text-gray-500">M-Pesa Receipt</p>
                <p className="font-mono font-semibold">
                  {booking.payment.mpesaReceiptNumber}
                </p>
              </div>
            )}

            {/* Booking Reference */}
            <div className="p-3 bg-white rounded-lg border">
              <p className="text-sm text-gray-500">Booking Reference</p>
              <p className="font-mono font-semibold text-lg">
                {booking.bookingReference}
              </p>
            </div>

            {/* Validation Info */}
            {booking.isValidated && booking.validatedAt && (
              <div className="p-3 bg-green-100 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">Validated At</p>
                <p className="font-semibold text-green-900">
                  {new Date(booking.validatedAt).toLocaleString('en-KE')}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {canValidate && (
              <Button
                onClick={handleValidate}
                disabled={validating}
                className="w-full"
                size="lg"
              >
                {validating ? 'Validating...' : 'Validate & Allow Entry'}
              </Button>
            )}

            {!canValidate && !booking.isValidated && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 font-medium">
                  This ticket cannot be validated:
                </p>
                <ul className="text-sm text-red-600 mt-2 space-y-1 list-disc list-inside">
                  {booking.status !== 'CONFIRMED' && (
                    <li>Booking status is {booking.status}</li>
                  )}
                  {booking.payment?.status !== 'COMPLETED' && (
                    <li>Payment not completed</li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// API Route: src/app/api/bookings/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import prisma from '@/src/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || 
        (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'QR code or booking reference required' },
        { status: 400 }
      );
    }

    // Search by QR code or booking reference
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { qrCode: code },
          { bookingReference: code },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        timeSlot: true,
        payment: {
          select: {
            mpesaReceiptNumber: true,
            status: true,
          },
        },
        validation: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Validate lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup booking' },
      { status: 500 }
    );
  }
}