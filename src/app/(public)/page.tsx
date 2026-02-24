'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CreditCard, Shield, Zap, ChevronRight, Star, Users, CheckCircle, ArrowRight, Search, X, Loader2, Phone } from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  status: 'available' | 'booked';
  price: number;
}

interface Toast {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<string>('2025-11-20');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(true);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [playerCount, setPlayerCount] = useState<number>(10);
  const [userName, setUserName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<number>(1);
  const [toast, setToast] = useState<Toast | null>(null);

  const stats = [
    { label: 'Happy Players', value: '100+', icon: Users },
    { label: 'Games Played', value: '50+', icon: Zap },
    { label: 'Average Rating', value: '4.6', icon: Star },
  ];

  const features = [
    { icon: Calendar, title: 'Personal Training', description: 'Book your personal training sessions @Ksh 2000 per month as from 7 AM - 10 AM per day Monday - Friday.' },
    { icon: CreditCard, title: 'Kids Registration', description: 'Ksh 2000 per month per kid. Kids playtime as from 10 AM - 12 PM.' },
    { icon: Shield, title: 'Verified Tickets', description: 'QR code tickets for secure entry. No more paper tickets or confusion at the gate.' },
    { icon: MapPin, title: 'Prime Location', description: 'Located in Juja, Opposite ST Peters school, easily accessible with ample parking space.' },
    { icon: Zap, title: 'Quality Pitch', description: 'Well-maintained artificial turf with proper lighting for evening games, Sitting area for spectators.' },
    { icon: Clock, title: 'Flexible Hours', description: 'Open from 7 AM to 12 AM daily, Get extra 30 minutes Extra Between 8 AM - 5 PMS.' },
  ];

  const amenities = [
    'Full pitch access',
    'Changing rooms',
    'Parking space',
    'LED floodlights',
    'First aid kit',
    'Clean facilities'
  ];

  // Fetch real slots from backend
const fetchAvailableSlots = async (date: string) => {
  setLoadingSlots(true);
  try {
    const response = await fetch(`/api/slots/available?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch slots');

    const data = await response.json();

    const formattedSlots = data.slots.map((slot: any) => ({
      id: slot.id,
      time: `${slot.startTime} - ${slot.endTime}`,
      status: slot.bookingsCount > 0 ? 'booked' : 'available',
      price: slot.price
    }));

    setAvailableSlots(formattedSlots);

  } catch (error) {
    showToast({
      title: 'Error',
      description: 'Failed to load available slots',
      variant: 'destructive',
    });
  } finally {
    setLoadingSlots(false);
  }
};


  //  Fetch slots on mount and when date changes
  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [selectedDate]);

  const showToast = (toastData: Toast) => {
    setToast(toastData);
    setTimeout(() => setToast(null), 5000);
  };

  const handleBookSlot = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
      setShowPaymentModal(true);
      setPaymentStep(1);
      setPhoneNumber('');
    }
  };

  const closeModal = () => {
    if (!loading) {
      setShowPaymentModal(false);
      setSelectedSlot(null);
      setPhoneNumber('');
      setPlayerCount(10);
      setNotes('');
      setPaymentStep(1);
    }
  };

const handleCreateBookingAndPay = async () => {
  if (!selectedSlot) {
    showToast({
      title: 'No Slot Selected',
      description: 'Please select a slot before proceeding.',
      variant: 'destructive',
    });
    return;
  }

  const phoneRegex = /^(254|0)[17]\d{8}$/;
  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
    showToast({
      title: 'Invalid Phone Number',
      description: 'Please enter a valid Kenyan phone number',
      variant: 'destructive',
    });
    return;
  }

  setLoading(true);
  setPaymentStep(2);

  try {
    // Step 1: Create booking
    const bookingResponse = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeSlotId: selectedSlot.id,
        totalAmount: selectedSlot.price, 
        playerCount,
        notes,
      }),
    });

    if (!bookingResponse.ok) {
      const error = await bookingResponse.json();
      throw new Error(error.error || 'Failed to create booking');
    }

    const booking = await bookingResponse.json();
    // After creating booking
    const paymentResponse = await fetch('/api/payments/stk-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
    phoneNumber,
    amount: selectedSlot.price,
    accountReference: booking.bookingReference,
    transactionDesc: 'Turf Booking Payment',
  }),
});

const paymentData = await paymentResponse.json();

if (paymentData.error) throw new Error(paymentData.error);

// Now wait for callback ( for payment confirmation)

    // ... continue with STK push logic
  } catch (error: any) {
    showToast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
    setLoading(false);
    setPaymentStep(1);
  }
};


  return (
    <div className="bg-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div className={`rounded-lg shadow-lg p-4 max-w-md ${
            toast.variant === 'destructive' 
              ? 'bg-rose-600 text-white' 
              : 'bg-white border border-slate-200'
          }`}>
            <h4 className={`font-semibold mb-1 ${toast.variant === 'destructive' ? 'text-white' : 'text-slate-900'}`}>
              {toast.title}
            </h4>
            <p className={`text-sm ${toast.variant === 'destructive' ? 'text-rose-50' : 'text-slate-600'}`}>
              {toast.description}
            </p>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-900">
                {paymentStep === 1 ? 'Confirm Booking' : 'Processing Payment'}
              </h3>
              {!loading && (
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>

            <div className="p-6 space-y-6">
              {paymentStep === 1 ? (
                <>
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Booking Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Date:</span>
                        <span className="font-semibold text-emerald-900">
                          {new Date(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Time:</span>
                        <span className="font-semibold text-emerald-900">{selectedSlot?.time}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                        <span className="text-emerald-700">Amount:</span>
                        <span className="text-2xl font-bold text-emerald-600">
                          KES {selectedSlot?.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Number of Players
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        min="1"
                        max="22"
                        value={playerCount}
                        onChange={(e) => setPlayerCount(parseInt(e.target.value) || 1)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Your Name *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </div>
                  </div>
                   
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      M-Pesa Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="0712345678 or 254712345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter the number registered with M-Pesa
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Any special requests..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                    />
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-900 flex items-start gap-2">
                      <CreditCard className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        You will receive an M-Pesa STK push on your phone. Enter your PIN to complete the payment.
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateBookingAndPay}
                      disabled={!phoneNumber || loading}
                      className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CreditCard className="h-5 w-5" />
                      Pay Now
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 space-y-6">
                  <div className="inline-flex items-center justify-center">
                    <Loader2 className="h-16 w-16 animate-spin text-emerald-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-slate-900">
                      Processing Payment...
                    </h4>
                    <p className="text-sm text-slate-600">
                      Check your phone for the M-Pesa prompt
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span>Waiting for payment confirmation...</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Enter your M-Pesa PIN to complete
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>• Check your phone for STK push</p>
                      <p>• Enter your M-Pesa PIN</p>
                      <p>• Wait for confirmation</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/voltaout.jpg')",
          }}
        />
        
        <div className="absolute inset-0 bg-emerald-900/40" />
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <div className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-sm font-medium text-emerald-50">Now accepting online bookings</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Welcome to <span className="text-emerald-300">Volta Arena</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-10 text-emerald-50 leading-relaxed max-w-3xl mx-auto">
              Book your football turf online in seconds. Premium quality pitch, flexible timing, and easy payment with M-Pesa.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <button 
                onClick={() => document.getElementById('slots-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                Book Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-700 font-semibold px-8 py-4 rounded-lg transition-all flex items-center justify-center gap-2">
                View Schedule
                <Calendar className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <Icon className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-emerald-100 text-sm">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Available Slots Section */}
      <section id="slots-section" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Check Available Slots</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Select date to browse real-time availability and secure your preferred time slot instantly
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => fetchAvailableSlots(selectedDate)}
                  disabled={loadingSlots}
                  className="w-full md:w-auto mt-6 md:mt-0 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loadingSlots ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                  Search Slots
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="font-semibold text-slate-900">
                    Available on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="text-slate-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-slate-300" />
                      <span className="text-slate-600">Booked</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {loadingSlots ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
                    <p className="text-slate-600">Loading available slots...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600">No slots available for this date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() => handleBookSlot(slot)}
                        className={`p-5 rounded-lg border-2 transition-all ${
                          slot.status === 'available'
                            ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:shadow-md cursor-pointer'
                            : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className={`h-5 w-5 ${slot.status === 'available' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className={`font-semibold ${slot.status === 'available' ? 'text-slate-900' : 'text-slate-500'}`}>
                              {slot.time}
                            </span>
                          </div>
                          {slot.status === 'booked' && (
                            <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded">
                              Booked
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-2xl font-bold ${slot.status === 'available' ? 'text-emerald-600' : 'text-slate-400'}`}>
                            KES {slot.price.toLocaleString()}
                          </span>
                          {slot.status === 'available' && (
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all">
                              Book
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What We Offer!</h2>
            <p className="text-lg text-slate-600">Everything you need for the perfect game</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-8 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all group">
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-600 transition-colors">
                    <Icon className="h-7 w-7 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Pricing</h2>
            <p className="text-lg text-slate-600">Simple, transparent, and competitive rates</p>
          </div>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Morning</h3>
                <div className="text-4xl font-bold text-emerald-600 mb-1">KES 2,000</div>
                <p className="text-sm text-slate-500 mb-6">per hour</p>               
                  <p className="text-sm text-slate-600">6:00 AM - 12:00 PM</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Afternoon</h3>
                <div className="text-4xl font-bold text-emerald-600 mb-1">KES 2,500</div>
                <p className="text-sm text-slate-500 mb-6">per hour</p>
                <p className="text-sm text-slate-600">12:00 PM - 6:00 PM</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Evening</h3>
                <div className="text-4xl font-bold text-emerald-600 mb-1">KES 3,000</div>
                <p className="text-sm text-slate-500 mb-6">per hour</p>
                <p className="text-sm text-slate-600">6:00 PM - 12:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Amenities</h2>
            <p className="text-lg text-slate-600">Everything you need for a great experience</p>
          </div>
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
            {amenities.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
