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
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Validate Ticket</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Scan QR code or enter booking reference
        </p>
      </div>

      {/* Scanner Input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Scan className="h-4 w-4" />
            Scan Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div>
            <Label htmlFor="qrCode" className="text-xs mb-1.5">QR Code / Booking Reference</Label>
            <Input
              id="qrCode"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Enter code or scan QR"
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              className="px-3 py-2 text-sm"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleScan} disabled={loading} className="flex-1 text-sm px-3 py-1.5" size="sm">
              {loading ? 'Scanning...' : 'Verify Ticket'}
            </Button>
            {booking && (
              <Button variant="outline" onClick={handleReset} size="sm" className="text-sm px-3 py-1.5">
                Reset
              </Button>
            )}
          </div>

          {/* Web Camera Scanner Option */}
          <div className="text-center pt-3 border-t">
            <p className="text-xs text-gray-500 mb-2">Or use camera to scan</p>
            <Button variant="secondary" className="gap-1.5 text-sm px-3 py-1.5" size="sm">
              <Scan className="h-3.5 w-3.5" />
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
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Booking Details</CardTitle>
              {booking.isValidated ? (
                <div className="flex items-center gap-1.5 text-green-600 font-semibold text-xs">
                  <CheckCircle className="h-4 w-4" />
                  Validated
                </div>
              ) : canValidate ? (
                <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs">
                  <Clock className="h-4 w-4" />
                  Ready to Validate
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-600 font-semibold text-xs">
                  <XCircle className="h-4 w-4" />
                  Cannot Validate
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            {/* Status Badge */}
            <div
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status}
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-0.5">
                    <User className="h-3 w-3" />
                    Customer
                  </p>
                  <p className="font-semibold text-sm">{booking.user.name}</p>
                  <p className="text-xs text-gray-600">{booking.user.phone}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-0.5">
                    <Calendar className="h-3 w-3" />
                    Date
                  </p>
                  <p className="font-semibold text-sm">
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

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-0.5">
                    <Clock className="h-3 w-3" />
                    Time Slot
                  </p>
                  <p className="font-semibold text-sm">
                    {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-0.5">
                    <DollarSign className="h-3 w-3" />
                    Amount Paid
                  </p>
                  <p className="font-semibold text-base">
                    KES {booking.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {booking.payment?.mpesaReceiptNumber && (
              <div className="p-2.5 bg-white rounded-lg border">
                <p className="text-xs text-gray-500 mb-0.5">M-Pesa Receipt</p>
                <p className="font-mono font-semibold text-sm">
                  {booking.payment.mpesaReceiptNumber}
                </p>
              </div>
            )}

            {/* Booking Reference */}
            <div className="p-2.5 bg-white rounded-lg border">
              <p className="text-xs text-gray-500 mb-0.5">Booking Reference</p>
              <p className="font-mono font-semibold text-base">
                {booking.bookingReference}
              </p>
            </div>

            {/* Validation Info */}
            {booking.isValidated && booking.validatedAt && (
              <div className="p-2.5 bg-green-100 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 mb-0.5">Validated At</p>
                <p className="font-semibold text-sm text-green-900">
                  {new Date(booking.validatedAt).toLocaleString('en-KE')}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {canValidate && (
              <Button
                onClick={handleValidate}
                disabled={validating}
                className="w-full text-sm px-3 py-2"
                size="sm"
              >
                {validating ? 'Validating...' : 'Validate & Allow Entry'}
              </Button>
            )}

            {!canValidate && !booking.isValidated && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-red-700 font-medium mb-1">
                  This ticket cannot be validated:
                </p>
                <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
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