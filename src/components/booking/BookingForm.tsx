// src/components/booking/BookingForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/src/components/ui/calendar';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Input } from '@/src/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
}

export function BookingForm() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [playerCount, setPlayerCount] = useState(10);
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate]);

  const fetchSlots = async () => {
    try {
      const dateStr = format(selectedDate!, 'yyyy-MM-dd');
      const response = await fetch(`/api/slots/available?date=${dateStr}`);
      
      if (!response.ok) throw new Error('Failed to fetch slots');
      
      const data = await response.json();
      setSlots(data.slots);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load time slots',
        variant: 'destructive',
      });
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedSlot) {
      toast({
        title: 'Required',
        description: 'Please select a time slot',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSlotId: selectedSlot,
          playerCount,
          notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const booking = await response.json();
      setBookingId(booking.id);
      setShowPayment(true);

      toast({
        title: 'Booking Created',
        description: 'Proceed to payment',
      });
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

  const handlePayment = async () => {
    if (!phone) {
      toast({
        title: 'Required',
        description: 'Please enter your M-Pesa phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payments/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          phoneNumber: phone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment failed');
      }

      const data = await response.json();

      toast({
        title: 'STK Push Sent',
        description: data.message,
      });

      // Poll for payment status
      pollPaymentStatus(data.payment.checkoutRequestId);
    } catch (error: any) {
      toast({
        title: 'Payment Error',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`/api/payments/verify/${checkoutRequestId}`);
        const data = await response.json();

        if (data.status === 'COMPLETED') {
          clearInterval(interval);
          setLoading(false);
          
          toast({
            title: 'Payment Successful! 🎉',
            description: 'Your ticket is being generated...',
          });

          setTimeout(() => {
            router.push(`/bookings/${data.booking.id}`);
          }, 2000);
        } else if (data.status === 'FAILED') {
          clearInterval(interval);
          setLoading(false);
          
          toast({
            title: 'Payment Failed',
            description: 'Please try again',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Poll error:', error);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setLoading(false);
        
        toast({
          title: 'Timeout',
          description: 'Please check your booking status',
          variant: 'destructive',
        });
      }
    }, 1000);
  };

  const selectedSlotData = slots.find(s => s.id === selectedSlot);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {!showPayment ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                <div>
                  <Label>Available Time Slots</Label>
                  {selectedDate ? (
                    <div className="space-y-2 mt-2">
                      {slots.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No slots available for this date
                        </p>
                      ) : (
                        slots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot.id)}
                            disabled={!slot.isAvailable}
                            className={`w-full p-4 text-left rounded-lg border-2 transition ${
                              selectedSlot === slot.id
                                ? 'border-green-600 bg-green-50'
                                : slot.isAvailable
                                ? 'border-gray-200 hover:border-green-400'
                                : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  KES {slot.price.toLocaleString()}
                                </p>
                              </div>
                              {!slot.isAvailable && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  Booked
                                </span>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-4">
                      Select a date to view available slots
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="players">Number of Players</Label>
                <Input
                  id="players"
                  type="number"
                  min="1"
                  max="22"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {selectedSlotData && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p>Date: {format(selectedDate!, 'EEEE, MMMM d, yyyy')}</p>
                    <p>Time: {selectedSlotData.startTime} - {selectedSlotData.endTime}</p>
                    <p>Players: {playerCount}</p>
                    <p className="font-semibold text-lg mt-2">
                      Total: KES {selectedSlotData.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleCreateBooking}
                disabled={!selectedSlot || loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Creating Booking...' : 'Continue to Payment'}
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                You will receive an M-Pesa STK push on your phone. Enter your PIN to complete the payment.
              </p>
            </div>

            <div>
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the phone number registered with M-Pesa
              </p>
            </div>

            {selectedSlotData && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">Amount to Pay</p>
                <p className="text-2xl font-bold text-green-600">
                  KES {selectedSlotData.price.toLocaleString()}
                </p>
              </div>
            )}

            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Processing Payment...' : 'Pay with M-Pesa'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowPayment(false)}
              disabled={loading}
              className="w-full"
            >
              Back
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}