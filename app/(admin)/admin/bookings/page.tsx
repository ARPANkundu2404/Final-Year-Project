"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye, XCircle, CheckCircle, RefreshCw } from "lucide-react";

interface Booking {
  id: string;
  userName: string;
  userEmail: string;
  lotName: string;
  slotNumber: string;
  vehicleNumber: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  amount: number;
  paymentStatus: "pending" | "completed" | "refunded";
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/bookings");
      const data = await response.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, status: newStatus as Booking["status"] }
              : b
          )
        );
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.lotName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Booking["status"]) => {
    const variants: Record<
      Booking["status"],
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "secondary",
      confirmed: "default",
      active: "default",
      completed: "outline",
      cancelled: "destructive",
    };

    const colors: Record<Booking["status"], string> = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      active: "bg-green-500/20 text-green-400 border-green-500/30",
      completed: "bg-muted text-muted-foreground",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentBadge = (status: Booking["paymentStatus"]) => {
    const colors: Record<Booking["paymentStatus"], string> = {
      pending: "bg-yellow-500/20 text-yellow-400",
      completed: "bg-green-500/20 text-green-400",
      refunded: "bg-blue-500/20 text-blue-400",
    };

    return (
      <Badge variant="outline" className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
        <h1 className="text-3xl font-bold text-foreground">Manage Bookings</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all parking bookings
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, vehicle, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-secondary border-border">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchBookings}
              className="border-border bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            Bookings ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">
                    Location
                  </TableHead>
                  <TableHead className="text-muted-foreground">Slot</TableHead>
                  <TableHead className="text-muted-foreground">
                    Vehicle
                  </TableHead>
                  <TableHead className="text-muted-foreground">Time</TableHead>
                  <TableHead className="text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Payment
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id} className="border-border">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {booking.userName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.userEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {booking.lotName}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {booking.slotNumber}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {booking.vehicleNumber}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-foreground">
                            {new Date(booking.startTime).toLocaleDateString()}
                          </p>
                          <p className="text-muted-foreground">
                            {new Date(booking.startTime).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}{" "}
                            -
                            {new Date(booking.endTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        Rs. {booking.amount}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        {getPaymentBadge(booking.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Booking Details
            </DialogTitle>
            <DialogDescription>
              View and manage booking #{selectedBooking?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">
                    {selectedBooking.userName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">
                    {selectedBooking.userEmail}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">
                    {selectedBooking.lotName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Slot</p>
                  <p className="font-medium text-foreground">
                    {selectedBooking.slotNumber}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vehicle</p>
                  <p className="font-medium text-foreground">
                    {selectedBooking.vehicleNumber}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium text-foreground">
                    Rs. {selectedBooking.amount}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  {getPaymentBadge(selectedBooking.paymentStatus)}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.status !== "confirmed" &&
                    selectedBooking.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 bg-transparent"
                        onClick={() =>
                          handleStatusUpdate(selectedBooking.id, "confirmed")
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    )}
                  {selectedBooking.status !== "active" &&
                    selectedBooking.status !== "cancelled" &&
                    selectedBooking.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500/30 text-green-400 hover:bg-green-500/20 bg-transparent"
                        onClick={() =>
                          handleStatusUpdate(selectedBooking.id, "active")
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Active
                      </Button>
                    )}
                  {selectedBooking.status !== "completed" &&
                    selectedBooking.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-muted-foreground/30 text-muted-foreground hover:bg-muted bg-transparent"
                        onClick={() =>
                          handleStatusUpdate(selectedBooking.id, "completed")
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  {selectedBooking.status !== "cancelled" &&
                    selectedBooking.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/20 bg-transparent"
                        onClick={() =>
                          handleStatusUpdate(selectedBooking.id, "cancelled")
                        }
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
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
