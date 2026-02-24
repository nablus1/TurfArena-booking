'use client';

import { useState, useEffect, type ComponentType, type SVGProps } from 'react';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Calendar,
  Activity, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  Sparkles, Clock, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart
} from 'recharts';

// Types
interface Stats {
  totalBookings: string;
  bookingsChange: string;
  bookingsTrend: 'up' | 'down';
  revenue: string;
  revenueChange: string;
  revenueTrend: 'up' | 'down';
  todayBookings: string;
  todayChange: string;
  todayTrend: 'up' | 'down';
  occupancyRate: string;
  occupancyChange: string;
  occupancyTrend: 'up' | 'down';
}

interface MonthlyData {
  month: string;
  bookings: number;
  target: number;
}

interface RecentBooking {
  id: string;
  customer: string;
  time: string;
  status: string;
  amount: string;
  timestamp: string;
}

interface MonthlyTarget {
  target: string;
  achieved: string;
  remaining: string;
  percentage: number;
  change: string;
  trend: 'up' | 'down';
}

// Enhanced Stat Card
function StatCard({
  icon: Icon,
  label,
  value,
  change,
  trend,
  bgColor,
  iconColor
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  bgColor: string;
  iconColor: string;
}) {
  return (
    <div className="group bg-white rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <div
            className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend === 'up' 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {change}
          </div>
        </div>
        <div className="text-slate-500 text-xs mb-1 font-medium">{label}</div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      </div>
    </div>
  );
}

// Custom Tooltip for Charts
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl border border-slate-700">
        <p className="text-xs font-semibold mb-0.5">{label}</p>
        <p className="text-emerald-400 text-xs font-medium">
          {payload[0].value} bookings
        </p>
      </div>
    );
  }
  return null;
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  
  // State for real data
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [monthlyTarget, setMonthlyTarget] = useState<MonthlyTarget | null>(null);

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      // Fetch stats
      const statsRes = await fetch(`/api/admin/stats?timeRange=${timeRange}`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch monthly trends
      const trendsRes = await fetch('/api/admin/monthly-trends');
      const trendsData = await trendsRes.json();
      setMonthlyData(trendsData);

      // Fetch recent bookings
      const bookingsRes = await fetch('/api/admin/recent-bookings?limit=5');
      const bookingsData = await bookingsRes.json();
      setRecentBookings(bookingsData);

      // Fetch monthly target
      const targetRes = await fetch('/api/admin/monthly-target');
      const targetData = await targetRes.json();
      setMonthlyTarget(targetData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = stats ? [
    {
      icon: Users,
      label: 'Total Bookings',
      value: stats.totalBookings,
      change: stats.bookingsChange,
      trend: stats.bookingsTrend,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      icon: DollarSign,
      label: 'Revenue',
      value: stats.revenue,
      change: stats.revenueChange,
      trend: stats.revenueTrend,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Calendar,
      label: "Today's Games",
      value: stats.todayBookings,
      change: stats.todayChange,
      trend: stats.todayTrend,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: Activity,
      label: 'Occupancy Rate',
      value: stats.occupancyRate,
      change: stats.occupancyChange,
      trend: stats.occupancyTrend,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ] : [];

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 space-y-4">
      {/* Enhanced Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Overview</h1>
          </div>
          <p className="text-sm text-slate-600">Track your turf booking performance and revenue in real-time</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                timeRange === range
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {statsConfig.map((stat, index) => (
          <div
            key={index}
            style={{ animationDelay: `${index * 50}ms` }}
            className="animate-fadeIn"
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Booking Chart */}
        <div className="lg:col-span-4 bg-white rounded-lg p-4 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Booking Trends</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly booking volume vs target</p>
            </div>
            <button 
              onClick={fetchDashboardData}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-all"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                  dy={8}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  dx={-8}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                <Bar 
                  dataKey="bookings" 
                  fill="url(#colorBookings)" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p>No data available</p>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>
              <span className="text-xs text-slate-600 font-medium">Actual Bookings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 border-2 border-slate-400 border-dashed rounded-full"></div>
              <span className="text-xs text-slate-600 font-medium">Target</span>
            </div>
          </div>
        </div>

        {/* Monthly Target Card */}
        {monthlyTarget && (
          <div className="lg:col-span-3 bg-gradient-to-br from-emerald-50 via-white to-blue-50 rounded-lg p-4 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Monthly Target</h3>
                <p className="text-xs text-slate-500 mt-0.5">Performance tracking</p>
              </div>
            </div>

            <div className="relative w-36 h-36 mx-auto my-6">
              <svg className="transform -rotate-90" width="144" height="144">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 62 * (monthlyTarget.percentage / 100)} ${2 * Math.PI * 62}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 drop-shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-slate-900 mb-0.5">
                  {monthlyTarget.percentage.toFixed(1)}%
                </div>
                <div className={`flex items-center gap-0.5 font-semibold text-xs ${
                  monthlyTarget.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {monthlyTarget.trend === 'up' ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {monthlyTarget.change}
                </div>
              </div>
            </div>

            <div className="space-y-2 bg-white/60 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-slate-600 font-medium">Target</span>
                <span className="text-xs font-bold text-slate-900">{monthlyTarget.target}</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-slate-600 font-medium">Achieved</span>
                <span className="text-xs font-bold text-emerald-600">{monthlyTarget.achieved}</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-slate-600 font-medium">Remaining</span>
                <span className="text-xs font-bold text-slate-900">{monthlyTarget.remaining}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow duration-300">
        <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Bookings</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest booking activities and status</p>
            </div>
            <a 
              href="/admin/bookings"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              View All
            </a>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Time Slot</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking, index) => (
                  <tr 
                    key={booking.id} 
                    className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-transparent transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform duration-200">
                          <span className="text-xs font-bold text-emerald-700">
                            {booking.customer.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-900 block">{booking.customer}</span>
                          <span className="text-xs text-slate-500">Customer</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {booking.time}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm ${
                        booking.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20'
                          : booking.status === 'Pending'
                          ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20'
                          : 'bg-rose-100 text-rose-700 ring-1 ring-rose-600/20'
                      }`}>
                        <span className={`w-1 h-1 rounded-full mr-1.5 ${
                          booking.status === 'Confirmed' ? 'bg-emerald-600' :
                          booking.status === 'Pending' ? 'bg-amber-600' : 'bg-rose-600'
                        }`}></span>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-slate-900">{booking.amount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">{booking.timestamp}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No recent bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </main>
  );
}