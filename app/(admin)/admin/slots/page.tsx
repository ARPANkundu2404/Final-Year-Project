"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCw, Car, MapPin } from "lucide-react";

interface ParkingLot {
  id: string;
  name: string;
  address: string;
  totalSlots: number;
}

interface ParkingSlot {
  id: string;
  slotNumber: string;
  floor: number;
  section: string;
  status: "available" | "occupied" | "booked" | "maintenance";
  vehicleType: "car" | "bike" | "truck";
}

export default function AdminSlotsPage() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<string>("");
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const response = await fetch("/api/parking-lots");
      const data = await response.json();
      if (data.lots) {
        setLots(data.lots);
        if (data.lots.length > 0) {
          setSelectedLotId(data.lots[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch lots:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = useCallback(async (lotId: string) => {
    setSlotsLoading(true);
    try {
      const response = await fetch(`/api/parking-lots/${lotId}/slots`);
      const data = await response.json();
      if (data.slots) {
        setSlots(data.slots);
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLotId) {
      fetchSlots(selectedLotId);
    }
  }, [selectedLotId, fetchSlots]);

  const handleStatusUpdate = async (slotId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `/api/parking-lots/${selectedLotId}/slots/${slotId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setSlots((prev) =>
          prev.map((s) =>
            s.id === slotId
              ? { ...s, status: newStatus as ParkingSlot["status"] }
              : s
          )
        );
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to update slot:", error);
    }
  };

  const getSlotColor = (status: ParkingSlot["status"]) => {
    switch (status) {
      case "available":
        return "bg-slot-available hover:bg-slot-available/80";
      case "occupied":
        return "bg-slot-occupied hover:bg-slot-occupied/80";
      case "booked":
        return "bg-slot-booked hover:bg-slot-booked/80";
      case "maintenance":
        return "bg-muted hover:bg-muted/80";
      default:
        return "bg-muted";
    }
  };

  const getStatusBadge = (status: ParkingSlot["status"]) => {
    const colors: Record<ParkingSlot["status"], string> = {
      available: "bg-green-500/20 text-green-400 border-green-500/30",
      occupied: "bg-red-500/20 text-red-400 border-red-500/30",
      booked: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      maintenance: "bg-muted text-muted-foreground border-border",
    };

    return (
      <Badge variant="outline" className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Group slots by floor and section
  const groupedSlots = slots.reduce(
    (acc, slot) => {
      const key = `Floor ${slot.floor} - Section ${slot.section}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(slot);
      return acc;
    },
    {} as Record<string, ParkingSlot[]>
  );

  const slotStats = {
    total: slots.length,
    available: slots.filter((s) => s.status === "available").length,
    occupied: slots.filter((s) => s.status === "occupied").length,
    booked: slots.filter((s) => s.status === "booked").length,
    maintenance: slots.filter((s) => s.status === "maintenance").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Manage Parking Slots
        </h1>
        <p className="text-muted-foreground mt-1">
          View and update slot statuses in real-time
        </p>
      </div>

      {/* Location Selector */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-foreground font-medium">
                Select Location:
              </span>
            </div>
            <Select value={selectedLotId} onValueChange={setSelectedLotId}>
              <SelectTrigger className="w-full sm:w-72 bg-secondary border-border">
                <SelectValue placeholder="Choose a parking lot" />
              </SelectTrigger>
              <SelectContent>
                {lots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => fetchSlots(selectedLotId)}
              className="border-border"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">
              {slotStats.total}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-green-400">
              {slotStats.available}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Occupied</p>
            <p className="text-2xl font-bold text-red-400">
              {slotStats.occupied}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Booked</p>
            <p className="text-2xl font-bold text-yellow-400">
              {slotStats.booked}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Maintenance</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {slotStats.maintenance}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-sm text-muted-foreground">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slot-available" />
              <span className="text-sm text-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slot-occupied" />
              <span className="text-sm text-foreground">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slot-booked" />
              <span className="text-sm text-foreground">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted" />
              <span className="text-sm text-foreground">Maintenance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slot Grid */}
      {slotsLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSlots).map(([section, sectionSlots]) => (
            <Card key={section} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{section}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                  {sectionSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setIsDialogOpen(true);
                      }}
                      className={`
                        aspect-square rounded-lg flex flex-col items-center justify-center
                        text-xs font-medium transition-all cursor-pointer
                        ${getSlotColor(slot.status)}
                        ${slot.status === "available" || slot.status === "booked" ? "text-background" : "text-foreground"}
                      `}
                    >
                      <Car className="h-4 w-4 mb-0.5" />
                      <span>{slot.slotNumber}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Slot Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Slot {selectedSlot?.slotNumber}
            </DialogTitle>
            <DialogDescription>
              Floor {selectedSlot?.floor}, Section {selectedSlot?.section}
            </DialogDescription>
          </DialogHeader>

          {selectedSlot && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                {getStatusBadge(selectedSlot.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Vehicle Type:</span>
                <span className="text-foreground capitalize">
                  {selectedSlot.vehicleType}
                </span>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Update Status:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={
                      selectedSlot.status === "available"
                        ? "default"
                        : "outline"
                    }
                    className={
                      selectedSlot.status === "available"
                        ? "bg-slot-available"
                        : "border-green-500/30 text-green-400 hover:bg-green-500/20"
                    }
                    onClick={() =>
                      handleStatusUpdate(selectedSlot.id, "available")
                    }
                  >
                    Available
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      selectedSlot.status === "occupied" ? "default" : "outline"
                    }
                    className={
                      selectedSlot.status === "occupied"
                        ? "bg-slot-occupied"
                        : "border-red-500/30 text-red-400 hover:bg-red-500/20"
                    }
                    onClick={() =>
                      handleStatusUpdate(selectedSlot.id, "occupied")
                    }
                  >
                    Occupied
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      selectedSlot.status === "booked" ? "default" : "outline"
                    }
                    className={
                      selectedSlot.status === "booked"
                        ? "bg-slot-booked"
                        : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                    }
                    onClick={() =>
                      handleStatusUpdate(selectedSlot.id, "booked")
                    }
                  >
                    Booked
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      selectedSlot.status === "maintenance"
                        ? "default"
                        : "outline"
                    }
                    className={
                      selectedSlot.status === "maintenance"
                        ? "bg-muted"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }
                    onClick={() =>
                      handleStatusUpdate(selectedSlot.id, "maintenance")
                    }
                  >
                    Maintenance
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
