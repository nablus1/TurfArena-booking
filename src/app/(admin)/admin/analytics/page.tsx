'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp, Download, RefreshCw, Calendar, DollarSign,
  Users, BarChart3, PieChart, FileText, Sparkles, Clock,
  Activity, Target, Award, AlertCircle, ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts';

interface AnalyticsData {
  bookingsByStatus: Array<{ status: string; count: number }>;
  revenueByMethod: Array<{ method: string; revenue: number; count: number }>;
  bookingsByDay: Record<string, number>;
  bookingsByHour: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number; bookings: number }>;
  topCustomers: Array<{
    userId: string;
    name: string;
    email: string;
    totalSpent: number;
    bookingsCount: number;
  }>;
  metrics: {
    cancellationRate: number;
    averageBookingValue: number;
    conversionRate: number;
    totalBookings: number;
    cancelledBookings: number;
    confirmedBookings: number;
  };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Stat Card Component
function MetricCard({ icon: Icon, label, value, change, trend, color }: any) {
  return (
    <div className="bg-white rounded-lg p-4 border border-slate-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center shadow-sm`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {change}
          </div>
        )}
      </div>
      <div className="text-slate-500 text-xs mb-1 font-medium">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

export default function AnalyticsReportsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const data = await res.json();
      
      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  // Transform data for charts
  const bookingsStatusData = analytics?.bookingsByStatus || [];
  const revenueMethodData = analytics?.revenueByMethod || [];
  
  const dailyBookingsData = Object.entries(analytics?.bookingsByDay || {})
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bookings: count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14); // Last 14 days

  const peakHoursData = Object.entries(analytics?.bookingsByHour || {})
    .map(([hour, count]) => ({
      hour,
      bookings: count,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Reports</h1>
          </div>
          <p className="text-sm text-slate-600">Comprehensive business insights and performance metrics</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === range
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
          
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={Target}
            label="Conversion Rate"
            value={`${analytics.metrics.conversionRate}%`}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <MetricCard
            icon={DollarSign}
            label="Avg Booking Value"
            value={`KES ${Math.round(analytics.metrics.averageBookingValue).toLocaleString()}`}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <MetricCard
            icon={AlertCircle}
            label="Cancellation Rate"
            value={`${analytics.metrics.cancellationRate}%`}
            color="bg-gradient-to-br from-amber-500 to-amber-600"
          />
          <MetricCard
            icon={Activity}
            label="Total Bookings"
            value={analytics.metrics.totalBookings}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Bookings Trend */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-4">Daily Bookings Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyBookingsData}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="bookings" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorBookings)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-4">Booking Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={bookingsStatusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {bookingsStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-4">Peak Booking Hours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Method */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-4">Revenue by Payment Method</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueMethodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="method" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Revenue Trend */}
      {analytics && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-4">Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Customers */}
      {analytics && analytics.topCustomers.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-4">Top Customers</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Bookings</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.topCustomers.slice(0, 10).map((customer, index) => (
                  <tr key={customer.userId} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-slate-100 text-slate-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-emerald-700">
                            {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{customer.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        {customer.bookingsCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      KES {customer.totalSpent.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Generation */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-900">Generate Reports</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
          >
            <option value="summary">Executive Summary</option>
            <option value="revenue">Revenue Report</option>
            <option value="bookings">Bookings Report</option>
            <option value="customers">Customer Report</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
            placeholder="Start Date"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
            placeholder="End Date"
          />

          <button
            onClick={downloadReport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { type: 'summary', label: 'Executive Summary', desc: 'Overview of all metrics' },
            { type: 'revenue', label: 'Revenue Report', desc: 'Detailed revenue breakdown' },
            { type: 'bookings', label: 'Bookings Report', desc: 'All booking transactions' },
            { type: 'customers', label: 'Customer Report', desc: 'Customer analytics' },
          ].map((report) => (
            <button
              key={report.type}
              onClick={() => setReportType(report.type)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                reportType === report.type
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-semibold text-sm text-slate-900 mb-1">{report.label}</div>
              <div className="text-xs text-slate-500">{report.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}