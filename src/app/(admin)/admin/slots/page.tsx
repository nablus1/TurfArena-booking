'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Calendar } from '@/src/components/ui/calendar';
import { useToast } from '@/src/components/ui/use-toast';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { Plus, Edit, Trash2, Clock, Calendar as CalendarIcon, DollarSign, RefreshCw, Copy } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
  bookingsCount: number;
}

interface CreateSlotFormData {
  startTime: string;
  endTime: string;
  price: number;
}

interface BulkCreateData {
  startDate: string;
  endDate: string;
  timeSlots: Array<{ startTime: string; endTime: string; price: number }>;
}

export default function AdminSlotsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const { toast } = useToast();

  const [createFormData, setCreateFormData] = useState<CreateSlotFormData>({
    startTime: '08:00',
    endTime: '09:00',
    price: 3000,
  });

  const [bulkCreateData, setBulkCreateData] = useState<BulkCreateData>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timeSlots: [
      { startTime: '08:00', endTime: '09:00', price: 3000 },
      { startTime: '09:00', endTime: '10:00', price: 3000 },
      { startTime: '10:00', endTime: '11:00', price: 3000 },
    ],
  });

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
      
      if (!response.ok) {
        throw new Error('Failed to fetch slots');
      }
      
      const data = await response.json();
      setSlots(data.slots || []);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch time slots',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate.toISOString().split('T')[0],
          ...createFormData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create slot');
      }

      toast({
        title: 'Success',
        description: 'Time slot created successfully',
      });

      setIsCreateDialogOpen(false);
      setCreateFormData({ startTime: '08:00', endTime: '09:00', price: 3000 });
      fetchSlots();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('📤 Sending bulk create:', bulkCreateData);
      
      const response = await fetch('/api/admin/slots/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkCreateData),
      });

      const result = await response.json();
      console.log('📥 Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create slots');
      }

      toast({
        title: 'Success',
        description: result.message || `Created ${result.count} time slots successfully`,
      });

      setIsBulkCreateDialogOpen(false);
      fetchSlots();
    } catch (error: any) {
      console.error('💥 Bulk create failed:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/slots/${editingSlot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: editingSlot.startTime,
          endTime: editingSlot.endTime,
          price: editingSlot.price,
          isAvailable: editingSlot.isAvailable,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update slot');
      }

      toast({
        title: 'Success',
        description: 'Time slot updated successfully',
      });

      setIsEditDialogOpen(false);
      setEditingSlot(null);
      fetchSlots();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return;

    try {
      const response = await fetch(`/api/admin/slots/${slotId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete slot');
      }

      toast({
        title: 'Success',
        description: 'Time slot deleted successfully',
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

  const toggleSlotAvailability = async (slotId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/slots/${slotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update slot');
      }

      toast({
        title: 'Success',
        description: `Slot ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
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

  const duplicateSlot = (slot: TimeSlot) => {
    setCreateFormData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
    });
    setIsCreateDialogOpen(true);
  };

  const addBulkTimeSlot = () => {
    setBulkCreateData({
      ...bulkCreateData,
      timeSlots: [...bulkCreateData.timeSlots, { startTime: '08:00', endTime: '09:00', price: 3000 }],
    });
  };

  const removeBulkTimeSlot = (index: number) => {
    setBulkCreateData({
      ...bulkCreateData,
      timeSlots: bulkCreateData.timeSlots.filter((_, i) => i !== index),
    });
  };

  const stats = {
    total: slots.length,
    available: slots.filter(s => s.isAvailable).length,
    booked: slots.filter(s => s.bookingsCount > 0).length,
    revenue: slots.reduce((sum, s) => sum + (s.price * s.bookingsCount), 0),
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Slots Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure and manage available booking slots</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSlots} disabled={loading} size="sm" className="text-sm px-3 py-1.5">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isBulkCreateDialogOpen} onOpenChange={setIsBulkCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-sm px-3 py-1.5">
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                Bulk Create
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto p-4">
              <DialogHeader>
                <DialogTitle className="text-lg">Bulk Create Time Slots</DialogTitle>
                <DialogDescription className="text-xs">
                  Create multiple time slots across a date range
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBulkCreate}>
                <div className="space-y-3 py-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={bulkCreateData.startDate}
                        onChange={(e) => setBulkCreateData({ ...bulkCreateData, startDate: e.target.value })}
                        className="px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="endDate" className="text-xs">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={bulkCreateData.endDate}
                        onChange={(e) => setBulkCreateData({ ...bulkCreateData, endDate: e.target.value })}
                        className="px-3 py-2 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Time Slots</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addBulkTimeSlot} className="text-xs px-2 py-1">
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    {bulkCreateData.timeSlots.map((slot, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-xs">Start</Label>
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => {
                              const newSlots = [...bulkCreateData.timeSlots];
                              newSlots[index].startTime = e.target.value;
                              setBulkCreateData({ ...bulkCreateData, timeSlots: newSlots });
                            }}
                            className="px-3 py-1.5 text-sm"
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">End</Label>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => {
                              const newSlots = [...bulkCreateData.timeSlots];
                              newSlots[index].endTime = e.target.value;
                              setBulkCreateData({ ...bulkCreateData, timeSlots: newSlots });
                            }}
                            className="px-3 py-1.5 text-sm"
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">Price</Label>
                          <Input
                            type="number"
                            value={slot.price}
                            onChange={(e) => {
                              const newSlots = [...bulkCreateData.timeSlots];
                              newSlots[index].price = Number(e.target.value);
                              setBulkCreateData({ ...bulkCreateData, timeSlots: newSlots });
                            }}
                            className="px-3 py-1.5 text-sm"
                            required
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBulkTimeSlot(index)}
                          disabled={bulkCreateData.timeSlots.length === 1}
                          className="px-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsBulkCreateDialogOpen(false)} className="text-sm">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} size="sm" className="text-sm">
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-sm px-3 py-1.5">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Create Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="p-4">
              <DialogHeader>
                <DialogTitle className="text-lg">Create Time Slot</DialogTitle>
                <DialogDescription className="text-xs">
                  Add a new time slot for {selectedDate.toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSlot}>
                <div className="grid gap-3 py-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="startTime" className="text-xs">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={createFormData.startTime}
                      onChange={(e) => setCreateFormData({ ...createFormData, startTime: e.target.value })}
                      className="px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="endTime" className="text-xs">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={createFormData.endTime}
                      onChange={(e) => setCreateFormData({ ...createFormData, endTime: e.target.value })}
                      className="px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="price" className="text-xs">Price (KES)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={createFormData.price}
                      onChange={(e) => setCreateFormData({ ...createFormData, price: Number(e.target.value) })}
                      min="1"
                      step="1"
                      className="px-3 py-2 text-sm"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(false)} className="text-sm">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} size="sm" className="text-sm">
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">Total Slots</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">Available</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">Booked Slots</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600">{stats.booked}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500">Revenue (Today)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">KES {stats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Date</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
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
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Time Slots for {selectedDate.toLocaleDateString('en-KE', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mb-2"></div>
                <p className="text-xs text-gray-500">Loading time slots...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium mb-1">No slots available for this date</p>
                <p className="text-xs text-gray-400 mb-3">Create your first time slot to get started</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} size="sm" className="text-sm px-3 py-1.5">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Create First Slot
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-3 border rounded-lg transition-all ${
                      slot.isAvailable
                        ? 'bg-white hover:bg-gray-50 border-gray-200'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <p className="font-semibold text-sm">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                          <Badge variant={slot.isAvailable ? 'default' : 'secondary'} className="px-2 py-0.5 text-xs">
                            {slot.isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                          {slot.bookingsCount > 0 && (
                            <Badge variant="outline" className="px-2 py-0.5 text-xs">
                              {slot.bookingsCount} booking{slot.bookingsCount !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium">KES {slot.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateSlot(slot)}
                          title="Duplicate slot"
                          className="px-2 py-1.5"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant={slot.isAvailable ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => toggleSlotAvailability(slot.id, slot.isAvailable)}
                          className="px-2.5 py-1.5 text-xs"
                        >
                          {slot.isAvailable ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSlot(slot);
                            setIsEditDialogOpen(true);
                          }}
                          className="px-2 py-1.5"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                          disabled={slot.bookingsCount > 0}
                          title={slot.bookingsCount > 0 ? 'Cannot delete slot with bookings' : 'Delete slot'}
                          className="px-2 py-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="p-4">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Time Slot</DialogTitle>
            <DialogDescription className="text-xs">
              Update the time slot details
            </DialogDescription>
          </DialogHeader>
          {editingSlot && (
            <form onSubmit={handleUpdateSlot}>
              <div className="grid gap-3 py-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-startTime" className="text-xs">Start Time</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={editingSlot.startTime}
                    onChange={(e) => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
                    className="px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-endTime" className="text-xs">End Time</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={editingSlot.endTime}
                    onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                    className="px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-price" className="text-xs">Price (KES)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingSlot.price}
                    onChange={(e) => setEditingSlot({ ...editingSlot, price: Number(e.target.value) })}
                    min="0"
                    step="100"
                    className="px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-available"
                    checked={editingSlot.isAvailable}
                    onChange={(e) => setEditingSlot({ ...editingSlot, isAvailable: e.target.checked })}
                    className="w-3.5 h-3.5"
                  />
                  <Label htmlFor="edit-available" className="text-xs">Available for booking</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)} className="text-sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} size="sm" className="text-sm">
                  {isSubmitting ? 'Updating...' : 'Update'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}