'use client';

import { useEffect, useState } from 'react';
import {
  Search, Download, RefreshCw, Calendar, DollarSign,
  CreditCard, CheckCircle, Clock, XCircle, Filter,
  ArrowUpRight, TrendingUp, Sparkles, Eye, MoreHorizontal,
  AlertCircle, Receipt, Phone, Mail
} from 'lucide-react';

interface Payment {
  id: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  mpesaReceiptNumber: string;
  mpesaPhoneNumber: string;
  checkoutRequestId: string;
  date: string;
  time: string;
  paidAt: string | null;
  createdAt: string;
}

interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalRevenue: number;
  todayRevenue: number;
  paymentMethods: {
    mpesa: number;
    cash: number;
    card: number;
  };
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, subtext, color }: any) {
  return (
    <div className="group bg-white rounded-lg p-4 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="text-slate-500 text-xs mb-1 font-medium">{label}</div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [statusFilter, methodFilter, startDate, endDate]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (methodFilter !== 'ALL') params.append('method', methodFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      const data = await res.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/payments/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.mpesaReceiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      COMPLETED: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
      PENDING: 'bg-amber-100 text-amber-700 ring-amber-600/20',
      PROCESSING: 'bg-blue-100 text-blue-700 ring-blue-600/20',
      FAILED: 'bg-rose-100 text-rose-700 ring-rose-600/20',
      REFUNDED: 'bg-purple-100 text-purple-700 ring-purple-600/20',
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
        <span className={`w-1 h-1 rounded-full mr-1.5 ${
          status === 'COMPLETED' ? 'bg-emerald-600' :
          status === 'PENDING' ? 'bg-amber-600' :
          status === 'PROCESSING' ? 'bg-blue-600' :
          status === 'FAILED' ? 'bg-rose-600' : 'bg-purple-600'
        }`} />
        {status}
      </span>
    );
  };

  const getMethodBadge = (method: string) => {
    const styles: Record<string, string> = {
      MPESA: 'bg-green-100 text-green-700',
      CASH: 'bg-slate-100 text-slate-700',
      CARD: 'bg-blue-100 text-blue-700',
      BANK_TRANSFER: 'bg-purple-100 text-purple-700',
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${styles[method] || 'bg-slate-100 text-slate-700'}`}>
        {method.replace('_', ' ')}
      </span>
    );
  };

  const exportToCSV = () => {
    alert('Exporting payments to CSV...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments Management</h1>
          </div>
          <p className="text-sm text-slate-600">Track and manage all payment transactions</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchPayments}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:shadow-md transition-all duration-200 text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:shadow-md transition-all duration-200 text-sm font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`KES ${stats.totalRevenue.toLocaleString()}`}
            subtext="All completed payments"
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={stats.completedPayments}
            subtext={`${stats.totalPayments} total payments`}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats.pendingPayments}
            subtext="Awaiting confirmation"
            color="bg-gradient-to-br from-amber-500 to-amber-600"
          />
          <StatCard
            icon={CreditCard}
            label="Today's Revenue"
            value={`KES ${stats.todayRevenue.toLocaleString()}`}
            subtext="Last 24 hours"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative md:col-span-4">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by booking ref, receipt, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>

          <div className="md:col-span-2 relative">
            <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm appearance-none bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="md:col-span-2 relative">
            <CreditCard className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm appearance-none bg-white"
            >
              <option value="ALL">All Methods</option>
              <option value="MPESA">M-Pesa</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          <div className="md:col-span-2 relative">
            <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              placeholder="Start Date"
            />
          </div>

          <div className="md:col-span-2 relative">
            <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              placeholder="End Date"
            />
          </div>
        </div>

        {(statusFilter !== 'ALL' || methodFilter !== 'ALL' || startDate || endDate) && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setMethodFilter('ALL');
                setStartDate('');
                setEndDate('');
              }}
              className="text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Booking Ref</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Method</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Receipt</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                      <p className="text-sm text-slate-500 font-medium">Loading payments...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                        <Receipt className="h-7 w-7 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-semibold text-sm">No payments found</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {searchTerm || statusFilter !== 'ALL' || methodFilter !== 'ALL'
                            ? 'Try adjusting your filters'
                            : 'No payment records available'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => (
                  <tr 
                    key={payment.id} 
                    className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-transparent transition-all duration-200 group"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-50 px-2 py-1 rounded">
                        {payment.bookingReference}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                          <span className="text-xs font-bold text-emerald-700">
                            {payment.customerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{payment.customerName}</p>
                          <p className="text-xs text-slate-500">{payment.customerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 text-sm">
                        {payment.currency} {payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getMethodBadge(payment.paymentMethod)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 font-mono">
                        {payment.mpesaReceiptNumber !== 'N/A' 
                          ? payment.mpesaReceiptNumber 
                          : <span className="text-slate-400 italic">N/A</span>
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900 text-xs">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all text-xs font-medium opacity-0 group-hover:opacity-100">
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      {!loading && filteredPayments.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{filteredPayments.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{payments.length}</span> payment(s)
          </p>
        </div>
      )}
    </div>
  );
}