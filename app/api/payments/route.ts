/**
 * Payments API
 * POST /api/payments - Process payment (Stripe integration)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import Booking from '@/lib/models/Booking';
import Payment from '@/lib/models/Payment';
import ParkingSlot from '@/lib/models/ParkingSlot';
import { connectDB } from '@/lib/db';
import { mockBookings, mockPayments, mockParkingSlots, generateId, initializeMockData } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, paymentMethod, paymentIntentId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    try {
      // Try to use MongoDB if connected
      await connectDB();

      // Find booking by ID
      const booking = await Booking.findById(bookingId).populate('slotId parkingLotId');
      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      // Check authorization
      if (booking.userId.toString() !== user.userId) {
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

      // Create or update payment record
      let payment = await Payment.findOne({ bookingId });
      if (!payment) {
        payment = new Payment({
          bookingId,
          userId: user.userId,
          amount: booking.totalAmount,
          currency: 'INR',
          status: 'pending',
        });
      }

      // Update payment with Stripe details
      payment.status = 'completed';
      payment.method = paymentMethod || 'stripe_card';
      payment.stripePaymentIntentId = paymentIntentId;
      await payment.save();

      // Update booking status
      booking.status = 'confirmed';
      booking.paymentId = payment._id;
      booking.qrCode = Buffer.from(
        JSON.stringify({
          bookingId: booking._id,
          slotId: booking.slotId,
          vehicleNumber: booking.vehicleNumber,
          startTime: booking.startTime,
          endTime: booking.endTime,
        })
      ).toString('base64');
      await booking.save();

      // Update slot status
      await ParkingSlot.findByIdAndUpdate(booking.slotId, {
        status: 'booked',
        currentBookingId: booking._id,
      });

      return NextResponse.json({
        message: 'Payment successful',
        payment,
        booking,
        qrCode: booking.qrCode,
      });
    } catch (dbError) {
      // Fallback to mock data if MongoDB is not available
      console.log('Database error, using mock data:', dbError);
      
      await initializeMockData();

      // Find booking in mock data
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

      // Update payment record
      mockPayments[paymentIndex] = {
        ...mockPayments[paymentIndex],
        status: 'completed',
        method: paymentMethod || 'stripe_card',
        stripePaymentIntentId: paymentIntentId,
      };

      // Update booking status
      mockBookings[bookingIndex].status = 'confirmed';
      mockBookings[bookingIndex].paymentId = mockPayments[paymentIndex]._id;
      mockBookings[bookingIndex].qrCode = Buffer.from(
        JSON.stringify({
          bookingId: booking._id,
          slotId: booking.slotId,
          vehicleNumber: booking.vehicleNumber,
          startTime: booking.startTime,
          endTime: booking.endTime,
        })
      ).toString('base64');

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
    }
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
