'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Car,
  MapPin,
  Clock,
  Loader2,
  Zap,
  Accessibility,
  CheckCircle2,
} from 'lucide-react';

interface ParkingLot {
  _id: string;
  name: string;
  address: string;
  city: string;
  pricePerHour: number;
  openTime: string;
  closeTime: string;
  amenities: string[];
}

interface ParkingSlot {
  _id: string;
  slotNumber: string;
  floor: number;
  row: string;
  column: number;
  status: 'available' | 'occupied' | 'booked';
  type: 'regular' | 'handicapped' | 'ev' | 'compact';
}

interface SlotsByFloor {
  [floor: number]: ParkingSlot[];
}

export default function SlotSelectionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [lot, setLot] = useState<ParkingLot | null>(null);
  const [slotsByFloor, setSlotsByFloor] = useState<SlotsByFloor>({});
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [selectedFloor, setSelectedFloor] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  // Booking form state
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('1');

  useEffect(() => {
    fetchLotDetails();
    // Set default date and time
    const now = new Date();
    setStartDate(now.toISOString().split('T')[0]);
    setStartTime(now.toTimeString().slice(0, 5));
  }, [resolvedParams.id]);

  const fetchLotDetails = async () => {
    try {
      const res = await fetch(`/api/parking-lots/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setLot(data.parkingLot);
        setSlotsByFloor(data.slotsByFloor);
      }
    } catch (error) {
      console.error('Error fetching lot details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
    }
  };

  const calculateTotal = () => {
    if (!lot) return 0;
    return lot.pricePerHour * parseInt(duration);
  };

  const handleBooking = async () => {
    if (!selectedSlot || !lot) return;

    if (!vehicleNumber.trim()) {
      alert('Please enter your vehicle number');
      return;
    }

    setIsBooking(true);

    try {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(start);
      end.setHours(end.getHours() + parseInt(duration));

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parkingLotId: lot._id,
          slotId: selectedSlot._id,
          vehicleNumber: vehicleNumber.toUpperCase(),
          vehicleType,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Navigate to payment page
        router.push(`/dashboard/payment?bookingId=${data.booking._id}&amount=${data.totalAmount}`);
      } else {
        alert(data.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred while booking');
    } finally {
      setIsBooking(false);
    }
  };

  const getSlotIcon = (type: string) => {
    switch (type) {
      case 'handicapped':
        return <Accessibility className="h-3 w-3" />;
      case 'ev':
        return <Zap className="h-3 w-3" />;
      default:
        return <Car className="h-3 w-3" />;
    }
  };

  const getSlotColor = (status: string, isSelected: boolean) => {
    if (isSelected) return 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background';
    switch (status) {
      case 'available':
        return 'bg-slot-available text-background hover:opacity-80 cursor-pointer';
      case 'booked':
        return 'bg-slot-booked text-background cursor-not-allowed';
      case 'occupied':
        return 'bg-slot-occupied text-background cursor-not-allowed';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-foreground">Parking lot not found</h2>
        <Link href="/dashboard/locations">
          <Button className="mt-4">Back to Locations</Button>
        </Link>
      </div>
    );
  }

  const floors = Object.keys(slotsByFloor).map(Number).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/locations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{lot.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{lot.address}, {lot.city}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slot Grid */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Select Your Parking Slot</CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slot-available" />
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slot-booked" />
                    <span className="text-muted-foreground">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slot-occupied" />
                    <span className="text-muted-foreground">Occupied</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {floors.length > 1 && (
                <Tabs value={selectedFloor} onValueChange={setSelectedFloor} className="mb-6">
                  <TabsList className="bg-secondary">
                    {floors.map((floor) => (
                      <TabsTrigger key={floor} value={floor.toString()}>
                        Floor {floor}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}

              {/* Parking Grid - BookMyShow style */}
              <div className="bg-secondary/30 rounded-lg p-6">
                {/* Entry indicator */}
                <div className="flex justify-center mb-6">
                  <div className="px-8 py-2 bg-primary/20 rounded-full text-primary text-sm font-medium">
                    Entry / Exit
                  </div>
                </div>

                {/* Slots Grid */}
                <div className="space-y-4">
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((row) => {
                    const rowSlots = (slotsByFloor[parseInt(selectedFloor)] || [])
                      .filter((slot) => slot.row === row)
                      .sort((a, b) => a.column - b.column);

                    if (rowSlots.length === 0) return null;

                    return (
                      <div key={row} className="flex items-center gap-2">
                        <span className="w-8 text-center text-sm font-medium text-muted-foreground">
                          {row}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {rowSlots.map((slot) => (
                            <button
                              type="button"
                              key={slot._id}
                              onClick={() => handleSlotClick(slot)}
                              disabled={slot.status !== 'available'}
                              className={cn(
                                'w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all',
                                getSlotColor(slot.status, selectedSlot?._id === slot._id)
                              )}
                              title={`${slot.slotNumber} - ${slot.type} (${slot.status})`}
                            >
                              {getSlotIcon(slot.type)}
                              <span className="mt-0.5">{slot.column}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Type Legend */}
                <div className="flex justify-center gap-6 mt-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Car className="h-3 w-3" /> Regular
                  </div>
                  <div className="flex items-center gap-1">
                    <Accessibility className="h-3 w-3" /> Handicapped
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" /> EV Charging
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div className="space-y-6">
          {/* Selected Slot Info */}
          {selectedSlot && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Slot</p>
                    <p className="text-lg font-bold text-foreground">{selectedSlot.slotNumber}</p>
                  </div>
                  <Badge className="ml-auto">{selectedSlot.type}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Form */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Vehicle Number</Label>
                <Input
                  placeholder="e.g., MH12AB1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="bg-secondary border-border uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Vehicle Type</Label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-secondary border-border"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Time</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Duration (hours)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 8, 12, 24].map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {h} {h === 1 ? 'hour' : 'hours'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Summary */}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="text-foreground">Rs. {lot.pricePerHour}/hour</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground">{duration} hour(s)</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">Rs. {calculateTotal()}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!selectedSlot || isBooking}
                onClick={handleBooking}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Operating Hours:</span>
                <span className="text-foreground font-medium">{lot.openTime} - {lot.closeTime}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
