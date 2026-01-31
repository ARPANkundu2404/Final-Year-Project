'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ParkingCircle,
  Car,
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface Stats {
  overview: {
    totalLots: number;
    totalSlots: number;
    availableSlots: number;
    occupiedSlots: number;
    bookedSlots: number;
    occupancyRate: number;
  };
  bookings: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    average: number;
  };
  users: {
    total: number;
  };
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
  lotStats: Array<{
    _id: string;
    name: string;
    totalSlots: number;
    available: number;
    occupied: number;
    booked: number;
    occupancyRate: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Poll for real-time updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time parking system overview</p>
        </div>
        <Badge variant="outline" className="text-primary border-primary">
          Live Updates
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Slots</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.overview.totalSlots}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Across {stats.overview.totalLots} lots</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <ParkingCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.overview.occupancyRate}%</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-slot-available" />
                  <span className="text-xs text-slot-available">+5% from yesterday</span>
                </div>
              </div>
              <div className="p-3 bg-secondary rounded-xl">
                <Car className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground mt-1">Rs. {stats.revenue.total.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-3 w-3 text-slot-available" />
                  <span className="text-xs text-slot-available">+12% this week</span>
                </div>
              </div>
              <div className="p-3 bg-slot-available/20 rounded-xl">
                <DollarSign className="h-6 w-6 text-slot-available" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.users.total}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-3 w-3 text-slot-available" />
                  <span className="text-xs text-slot-available">+3 new today</span>
                </div>
              </div>
              <div className="p-3 bg-secondary rounded-xl">
                <Users className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slot Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-slot-available/10 border-slot-available/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slot-available">Available Slots</p>
                <p className="text-4xl font-bold text-slot-available mt-1">{stats.overview.availableSlots}</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-slot-available/20 flex items-center justify-center">
                <span className="text-xl font-bold text-slot-available">
                  {Math.round((stats.overview.availableSlots / stats.overview.totalSlots) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slot-booked/10 border-slot-booked/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slot-booked">Booked Slots</p>
                <p className="text-4xl font-bold text-slot-booked mt-1">{stats.overview.bookedSlots}</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-slot-booked/20 flex items-center justify-center">
                <span className="text-xl font-bold text-slot-booked">
                  {Math.round((stats.overview.bookedSlots / stats.overview.totalSlots) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slot-occupied/10 border-slot-occupied/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slot-occupied">Occupied Slots</p>
                <p className="text-4xl font-bold text-slot-occupied mt-1">{stats.overview.occupiedSlots}</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-slot-occupied/20 flex items-center justify-center">
                <span className="text-xl font-bold text-slot-occupied">
                  {Math.round((stats.overview.occupiedSlots / stats.overview.totalSlots) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue Overview</CardTitle>
            <CardDescription>Daily revenue for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyStats}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.72 0.19 160)" stopOpacity={0.3} />
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
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.72 0.19 160)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Booking Trends</CardTitle>
            <CardDescription>Daily bookings for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyStats}>
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
                  <Bar dataKey="bookings" fill="oklch(0.72 0.19 160)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parking Lots Status */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Parking Lots Status</CardTitle>
          <CardDescription>Real-time status of all parking locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.lotStats.map((lot) => (
              <div key={lot._id} className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{lot.name}</h4>
                    <p className="text-sm text-muted-foreground">{lot.totalSlots} total slots</p>
                  </div>
                  <Badge variant={lot.occupancyRate > 80 ? 'destructive' : lot.occupancyRate > 50 ? 'secondary' : 'default'}>
                    {lot.occupancyRate}% occupied
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="h-3 bg-background rounded-full overflow-hidden flex">
                  <div
                    className="bg-slot-occupied h-full transition-all"
                    style={{ width: `${(lot.occupied / lot.totalSlots) * 100}%` }}
                  />
                  <div
                    className="bg-slot-booked h-full transition-all"
                    style={{ width: `${(lot.booked / lot.totalSlots) * 100}%` }}
                  />
                  <div
                    className="bg-slot-available h-full transition-all"
                    style={{ width: `${(lot.available / lot.totalSlots) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded bg-slot-available" />
                    {lot.available} available
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded bg-slot-booked" />
                    {lot.booked} booked
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded bg-slot-occupied" />
                    {lot.occupied} occupied
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
