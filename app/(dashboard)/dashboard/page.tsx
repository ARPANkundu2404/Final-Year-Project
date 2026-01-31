'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, MapPin, Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react';

interface Booking {
  _id: string;
  vehicleNumber: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  parkingLot: {
    name: string;
    address: string;
  } | null;
  slot: {
    slotNumber: string;
    floor: number;
  } | null;
}

interface ParkingLot {
  _id: string;
  name: string;
  address: string;
  city: string;
  availableSlots: number;
  totalSlots: number;
  pricePerHour: number;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [nearbyLots, setNearbyLots] = useState<ParkingLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bookingsRes, lotsRes] = await Promise.all([
          fetch('/api/bookings?limit=3'),
          fetch('/api/parking-lots'),
        ]);

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setRecentBookings(bookingsData.bookings);
        }

        if (lotsRes.ok) {
          const lotsData = await lotsRes.json();
          setNearbyLots(lotsData.parkingLots.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      confirmed: { variant: 'default', label: 'Confirmed' },
      active: { variant: 'default', label: 'Active' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">Find and book your parking spot in seconds</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Find Parking</h3>
                <p className="text-sm text-muted-foreground">Browse available locations</p>
              </div>
              <Link href="/dashboard/locations">
                <Button size="sm">
                  Search <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-xl">
                <Calendar className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Active Bookings</h3>
                <p className="text-2xl font-bold text-primary">
                  {recentBookings.filter(b => ['confirmed', 'active'].includes(b.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary rounded-xl">
                <Car className="h-6 w-6 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Total Bookings</h3>
                <p className="text-2xl font-bold text-primary">{recentBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Recent Bookings</CardTitle>
            <CardDescription>Your latest parking reservations</CardDescription>
          </div>
          <Link href="/dashboard/bookings">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings yet</p>
              <Link href="/dashboard/locations">
                <Button className="mt-4">Book Your First Spot</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-background rounded-lg">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {booking.parkingLot?.name || 'Unknown Location'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Slot {booking.slot?.slotNumber}</span>
                        <span>-</span>
                        <span>{booking.vehicleNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      {new Date(booking.startTime).toLocaleDateString()}
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nearby Parking Locations */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Available Parking</CardTitle>
            <CardDescription>Popular parking locations near you</CardDescription>
          </div>
          <Link href="/dashboard/locations">
            <Button variant="outline" size="sm">
              See All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyLots.map((lot) => (
              <Link key={lot._id} href={`/dashboard/locations/${lot._id}`}>
                <div className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground">{lot.name}</h3>
                    <Badge variant={lot.availableSlots > 5 ? 'default' : 'secondary'}>
                      {lot.availableSlots} available
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{lot.address}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {lot.availableSlots}/{lot.totalSlots} slots
                    </span>
                    <span className="text-primary font-semibold">Rs. {lot.pricePerHour}/hr</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
