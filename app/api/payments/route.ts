/**
 * Payments API
 * POST /api/payments - Process payment (mock Razorpay)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { mockBookings, mockPayments, mockParkingSlots, generateId, initializeMockData } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    await initializeMockData();

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, paymentMethod } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Find booking
    const bookingIndex = mockBookings.findIndex(b => b._id === bookingId);
    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = mockBookings[bookingIndex];

    // Check authorization
    if (booking.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check booking status
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Booking is not pending payment' },
        { status: 400 }
      );
    }

    // Find or create payment record
    let paymentIndex = mockPayments.findIndex(p => p.bookingId === bookingId);
    
    if (paymentIndex === -1) {
      // Create new payment
      const paymentId = generateId();
      mockPayments.push({
        _id: paymentId,
        bookingId,
        userId: user.userId,
        amount: booking.totalAmount,
        currency: 'INR',
        status: 'pending',
        createdAt: new Date(),
      });
      paymentIndex = mockPayments.length - 1;
    }

    // Simulate payment processing (mock Razorpay)
    const razorpayOrderId = `order_${generateId()}`;
    const razorpayPaymentId = `pay_${generateId()}`;

    // Update payment record
    mockPayments[paymentIndex] = {
      ...mockPayments[paymentIndex],
      status: 'completed',
      method: paymentMethod || 'card',
      razorpayOrderId,
      razorpayPaymentId,
    };

    // Update booking status
    mockBookings[bookingIndex].status = 'confirmed';
    mockBookings[bookingIndex].paymentId = mockPayments[paymentIndex]._id;

    // Generate QR code data
    const qrData = JSON.stringify({
      bookingId: booking._id,
      slotId: booking.slotId,
      vehicleNumber: booking.vehicleNumber,
      startTime: booking.startTime,
      endTime: booking.endTime,
    });
    mockBookings[bookingIndex].qrCode = Buffer.from(qrData).toString('base64');

    // Update slot status to booked
    const slotIndex = mockParkingSlots.findIndex(s => s._id === booking.slotId);
    if (slotIndex !== -1) {
      mockParkingSlots[slotIndex].status = 'booked';
      mockParkingSlots[slotIndex].currentBookingId = booking._id;
    }

    return NextResponse.json({
      message: 'Payment successful',
      payment: mockPayments[paymentIndex],
      booking: mockBookings[bookingIndex],
      qrCode: mockBookings[bookingIndex].qrCode,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
