'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Calendar } from '@/src/components/ui/calendar';
import { useToast } from '@/src/components/ui/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
  bookingsCount: number;
}

export default function AdminSlotsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/slots/available?date=${dateStr}`);
      const data = await response.json();
      setSlots(data.slots || []);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlotAvailability = async (slotId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/slots/${slotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update slot');

      toast({
        title: 'Success',
        description: 'Slot updated successfully',
      });

      fetchSlots();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Time Slots</h1>
          <p className="text-gray-500 mt-1">Configure available booking slots</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Slots
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Slots List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Time Slots for {selectedDate.toLocaleDateString('en-KE', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No slots available for this date</p>
                <Button>Create Slots for This Date</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-4 border rounded-lg ${
                      slot.isAvailable
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <p className="font-semibold">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            slot.isAvailable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {slot.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                          {slot.bookingsCount > 0 && (
                            <span className="text-sm text-gray-500">
                              {slot.bookingsCount} booking{slot.bookingsCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          KES {slot.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSlotAvailability(slot.id, slot.isAvailable)}
                        >
                          {slot.isAvailable ? 'Disable' : 'Enable'}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
