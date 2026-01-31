'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Car, Clock, MapPin, Calendar, Loader2, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Booking {
  _id: string;
  vehicleNumber: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  qrCode?: string;
  createdAt: string;
  parkingLot: {
    name: string;
    address: string;
    city: string;
  } | null;
  slot: {
    slotNumber: string;
    floor: number;
    row: string;
  } | null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBookings(bookings.map(b => 
          b._id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('An error occurred');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending Payment' },
      confirmed: { variant: 'default', label: 'Confirmed' },
      active: { variant: 'default', label: 'Active' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filterBookings = (status: string) => {
    if (status === 'all') return bookings;
    if (status === 'active') return bookings.filter(b => ['confirmed', 'active'].includes(b.status));
    if (status === 'past') return bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
    return bookings.filter(b => b.status === status);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
          <p className="text-muted-foreground mt-1">View and manage your parking reservations</p>
        </div>
        <Link href="/dashboard/locations">
          <Button>New Booking</Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({filterBookings('active').length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({filterBookings('past').length})
          </TabsTrigger>
        </TabsList>

        {['all', 'active', 'past'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filterBookings(tab).length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No bookings found</h3>
                  <p className="text-muted-foreground mb-4">
                    {tab === 'active' 
                      ? "You don't have any active bookings"
                      : "Start by booking a parking spot"}
                  </p>
                  <Link href="/dashboard/locations">
                    <Button>Find Parking</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterBookings(tab).map((booking) => {
                  const start = formatDateTime(booking.startTime);
                  const end = formatDateTime(booking.endTime);

                  return (
                    <Card key={booking._id} className="bg-card border-border overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Left section */}
                          <div className="flex-1 p-4 md:p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-lg text-foreground">
                                  {booking.parkingLot?.name || 'Unknown Location'}
                                </h3>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {booking.parkingLot?.address}, {booking.parkingLot?.city}
                                </div>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Slot</p>
                                <p className="font-medium text-foreground">
                                  {booking.slot?.slotNumber || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Vehicle</p>
                                <p className="font-medium text-foreground">{booking.vehicleNumber}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Check-in</p>
                                <p className="font-medium text-foreground">{start.date}</p>
                                <p className="text-xs text-muted-foreground">{start.time}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Check-out</p>
                                <p className="font-medium text-foreground">{end.date}</p>
                                <p className="text-xs text-muted-foreground">{end.time}</p>
                              </div>
                            </div>
                          </div>

                          {/* Right section */}
                          <div className="bg-secondary/30 p-4 md:p-6 md:w-48 flex flex-col justify-between">
                            <div className="text-center md:text-right">
                              <p className="text-sm text-muted-foreground">Total Amount</p>
                              <p className="text-2xl font-bold text-primary">
                                Rs. {booking.totalAmount}
                              </p>
                            </div>

                            <div className="flex gap-2 mt-4">
                              {booking.qrCode && ['confirmed', 'active'].includes(booking.status) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 bg-transparent"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowQR(true);
                                  }}
                                >
                                  <QrCode className="h-4 w-4 mr-1" />
                                  QR
                                </Button>
                              )}
                              {['pending', 'confirmed'].includes(booking.status) && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => cancelBooking(booking._id)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                              {booking.status === 'pending' && (
                                <Link href={`/dashboard/payment?bookingId=${booking._id}&amount=${booking.totalAmount}`}>
                                  <Button size="sm" className="flex-1">
                                    Pay Now
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking QR Code</DialogTitle>
            <DialogDescription>
              Show this QR code at the parking entrance
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="flex flex-col items-center p-6">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG
                  value={JSON.stringify({
                    bookingId: selectedBooking._id,
                    slot: selectedBooking.slot?.slotNumber,
                    vehicle: selectedBooking.vehicleNumber,
                  })}
                  size={200}
                  level="H"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="font-semibold text-foreground">{selectedBooking.slot?.slotNumber}</p>
                <p className="text-sm text-muted-foreground">{selectedBooking.vehicleNumber}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
