'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  dailyStats: Array<{
    date: string;
    bookings: number;
    revenue: number;
    label: string;
  }>;
  hourlyDistribution: Array<{
    hour: number;
    label: string;
    bookings: number;
  }>;
  bookings: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  lotStats: Array<{
    name: string;
    totalBookings: number;
    occupancyRate: number;
  }>;
}

const COLORS = ['oklch(0.72 0.19 160)', 'oklch(0.75 0.18 85)', 'oklch(0.60 0.20 25)', 'oklch(0.55 0.15 220)'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const bookingStatusData = [
    { name: 'Active', value: stats.bookings.active },
    { name: 'Completed', value: stats.bookings.completed },
    { name: 'Cancelled', value: stats.bookings.cancelled },
  ];

  const peakHours = stats.hourlyDistribution
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">In-depth analysis of parking operations</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Bookings Trend */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Daily Bookings Trend</CardTitle>
                <CardDescription>Bookings over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
                      <XAxis dataKey="label" stroke="oklch(0.65 0 0)" fontSize={12} />
                      <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.17 0.01 260)',
                          border: '1px solid oklch(0.28 0.01 260)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'oklch(0.98 0 0)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="bookings"
                        stroke="oklch(0.72 0.19 160)"
                        strokeWidth={2}
                        dot={{ fill: 'oklch(0.72 0.19 160)', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Booking Status Distribution */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Booking Status Distribution</CardTitle>
                <CardDescription>Overview of all booking statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bookingStatusData.map((entry, index) => (
                          <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.17 0.01 260)',
                          border: '1px solid oklch(0.28 0.01 260)',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hourly Distribution */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Hourly Booking Distribution</CardTitle>
              <CardDescription>Number of bookings by hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
                    <XAxis dataKey="label" stroke="oklch(0.65 0 0)" fontSize={10} interval={1} />
                    <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.17 0.01 260)',
                        border: '1px solid oklch(0.28 0.01 260)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'oklch(0.98 0 0)' }}
                    />
                    <Bar dataKey="bookings" fill="oklch(0.72 0.19 160)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Peak Hours</CardTitle>
              <CardDescription>Most popular booking times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {peakHours.map((hour, index) => (
                  <div key={hour.hour} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-foreground font-medium">{hour.label}</span>
                        <span className="text-muted-foreground">{hour.bookings} bookings</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(hour.bookings / Math.max(...peakHours.map((h) => h.bookings))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-4xl font-bold text-foreground mt-2">{stats.bookings.total}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Active Bookings</p>
                <p className="text-4xl font-bold text-primary mt-2">{stats.bookings.active}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-4xl font-bold text-slot-available mt-2">
                  {stats.bookings.total > 0
                    ? Math.round((stats.bookings.completed / stats.bookings.total) * 100)
                    : 0}
                  %
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lot Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Parking Lot Performance</CardTitle>
              <CardDescription>Bookings per location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.lotStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
                    <XAxis type="number" stroke="oklch(0.65 0 0)" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="oklch(0.65 0 0)" fontSize={12} width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.17 0.01 260)',
                        border: '1px solid oklch(0.28 0.01 260)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'oklch(0.98 0 0)' }}
                    />
                    <Bar dataKey="totalBookings" fill="oklch(0.72 0.19 160)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Revenue Trend</CardTitle>
              <CardDescription>Daily revenue over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.dailyStats}>
                    <defs>
                      <linearGradient id="colorRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.72 0.19 160)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="oklch(0.72 0.19 160)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
                    <XAxis dataKey="label" stroke="oklch(0.65 0 0)" fontSize={12} />
                    <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.17 0.01 260)',
                        border: '1px solid oklch(0.28 0.01 260)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'oklch(0.98 0 0)' }}
                      formatter={(value: number) => [`Rs. ${value}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="oklch(0.72 0.19 160)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
