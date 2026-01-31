'use client';

import React from "react"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Car, Clock, Loader2, Wifi, Zap, Shield, Droplets } from 'lucide-react';

interface ParkingLot {
  _id: string;
  name: string;
  address: string;
  city: string;
  availableSlots: number;
  occupiedSlots: number;
  bookedSlots: number;
  totalSlots: number;
  pricePerHour: number;
  openTime: string;
  closeTime: string;
  amenities: string[];
}

const amenityIcons: Record<string, React.ReactNode> = {
  'CCTV': <Shield className="h-3 w-3" />,
  'EV Charging': <Zap className="h-3 w-3" />,
  'Covered Parking': <Droplets className="h-3 w-3" />,
  'Car Wash': <Droplets className="h-3 w-3" />,
  '24/7 Security': <Shield className="h-3 w-3" />,
  'Shuttle Service': <Car className="h-3 w-3" />,
  'Valet Service': <Car className="h-3 w-3" />,
  'Wheelchair Access': <Wifi className="h-3 w-3" />,
};

export default function LocationsPage() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async (search?: string) => {
    try {
      const url = search ? `/api/parking-lots?search=${encodeURIComponent(search)}` : '/api/parking-lots';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLots(data.parkingLots);
      }
    } catch (error) {
      console.error('Error fetching parking lots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetchLots(searchQuery);
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.3) return 'text-slot-available';
    if (ratio > 0.1) return 'text-slot-booked';
    return 'text-slot-occupied';
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Parking Locations</h1>
        <p className="text-muted-foreground mt-1">Find and book your perfect parking spot</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Slot Status Legend */}
      <div className="flex items-center gap-6 text-sm">
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

      {/* Parking Lots Grid */}
      {lots.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No parking locations found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lots.map((lot) => (
            <Card key={lot._id} className="bg-card border-border overflow-hidden hover:border-primary/50 transition-colors">
              <CardContent className="p-0">
                {/* Header section */}
                <div className="p-4 border-b border-border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground text-lg">{lot.name}</h3>
                    <Badge
                      variant={lot.availableSlots > 5 ? 'default' : lot.availableSlots > 0 ? 'secondary' : 'destructive'}
                    >
                      {lot.availableSlots > 0 ? `${lot.availableSlots} spots` : 'Full'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {lot.address}, {lot.city}
                  </div>
                </div>

                {/* Stats section */}
                <div className="p-4 bg-secondary/30">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className={`text-xl font-bold ${getAvailabilityColor(lot.availableSlots, lot.totalSlots)}`}>
                        {lot.availableSlots}
                      </p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-slot-booked">{lot.bookedSlots}</p>
                      <p className="text-xs text-muted-foreground">Booked</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-slot-occupied">{lot.occupiedSlots}</p>
                      <p className="text-xs text-muted-foreground">Occupied</p>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {lot.amenities.slice(0, 4).map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs py-0.5">
                        {amenityIcons[amenity]}
                        <span className="ml-1">{amenity}</span>
                      </Badge>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {lot.openTime} - {lot.closeTime}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">Rs. {lot.pricePerHour}</p>
                      <p className="text-xs text-muted-foreground">per hour</p>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="p-4">
                  <Link href={`/dashboard/locations/${lot._id}`}>
                    <Button className="w-full" disabled={lot.availableSlots === 0}>
                      {lot.availableSlots > 0 ? 'Select Slot' : 'No Slots Available'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
