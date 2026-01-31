import { NextRequest, NextResponse } from "next/server";
import { mockData } from "@/lib/mock-data";
import { verifyAuth, isAdmin } from "@/lib/auth";

// Update a specific slot's status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update slot status
    if (!isAdmin(authResult.user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id: lotId, slotId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["available", "occupied", "booked", "maintenance"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: available, occupied, booked, or maintenance" },
        { status: 400 }
      );
    }

    // Find the lot
    const lot = mockData.parkingLots.find((l) => l.id === lotId);
    if (!lot) {
      return NextResponse.json({ error: "Parking lot not found" }, { status: 404 });
    }

    // Find the slot
    const slotIndex = mockData.parkingSlots.findIndex(
      (s) => s.id === slotId && s.lotId === lotId
    );

    if (slotIndex === -1) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    // Update the slot status
    const previousStatus = mockData.parkingSlots[slotIndex].status;
    mockData.parkingSlots[slotIndex].status = status;
    mockData.parkingSlots[slotIndex].updatedAt = new Date();

    // Update lot counts
    if (previousStatus !== status) {
      // Decrement old status count
      if (previousStatus === "available") {
        lot.availableSlots = Math.max(0, lot.availableSlots - 1);
      }
      // Increment new status count
      if (status === "available") {
        lot.availableSlots = Math.min(lot.totalSlots, lot.availableSlots + 1);
      }
    }

    return NextResponse.json({
      success: true,
      slot: mockData.parkingSlots[slotIndex],
      message: `Slot ${mockData.parkingSlots[slotIndex].slotNumber} status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating slot:", error);
    return NextResponse.json(
      { error: "Failed to update slot" },
      { status: 500 }
    );
  }
}

// Get a specific slot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  try {
    const { id: lotId, slotId } = await params;

    const slot = mockData.parkingSlots.find(
      (s) => s.id === slotId && s.lotId === lotId
    );

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    return NextResponse.json({ slot });
  } catch (error) {
    console.error("Error fetching slot:", error);
    return NextResponse.json(
      { error: "Failed to fetch slot" },
      { status: 500 }
    );
  }
}
