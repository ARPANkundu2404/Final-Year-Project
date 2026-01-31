# Smart Parking System - Stripe Payment Architecture

## 📐 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SMART PARKING SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   CLIENT SIDE (Browser)                 │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Payment Page (/dashboard/payment/page.tsx)     │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ • Fetch booking details                          │  │   │
│  │  │ • Show order summary                             │  │   │
│  │  │ • Display loading state                          │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                      ↓                                  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Request PaymentIntent                           │  │   │
│  │  │  POST /api/create-payment-intent                 │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                      ↓                                  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  StripeProvider (stripe-provider.tsx)            │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ • Loads Stripe SDK                               │  │   │
│  │  │ • Passes clientSecret                            │  │   │
│  │  │ • Initializes Elements                           │  │   │
│  │  │ • Configures dark theme                          │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                      ↓                                  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  CheckoutForm (checkout-form.tsx)                │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ • PaymentElement component                       │  │   │
│  │  │ • Card input UI                                  │  │   │
│  │  │ • Error display                                  │  │   │
│  │  │ • Loading indicator                              │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                      ↓                                  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  User Enters Card Details                        │  │   │
│  │  │  • Card number (secured by Stripe)               │  │   │
│  │  │  • Expiry date                                   │  │   │
│  │  │  • CVC                                           │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                      ↓                                  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Confirm Payment with Stripe                     │  │   │
│  │  │  (stripe.confirmPayment)                         │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                            ↕                                   │
│                       (HTTPS)                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              STRIPE PAYMENT NETWORK                      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Stripe Cloud (stripe.com)                       │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ • Processes payment securely                     │  │   │
│  │  │ • Validates card details                         │  │   │
│  │  │ • Handles PCI compliance                         │  │   │
│  │  │ • Processes through payment networks             │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                            ↕                                   │
│                       (HTTPS)                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              SERVER SIDE (Backend)                      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  1. Create PaymentIntent API                     │  │   │
│  │  │  (/api/create-payment-intent)                    │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ • Authenticate user                              │  │   │
│  │  │ • Validate booking ID                            │  │   │
│  │  │ • Validate amount                                │  │   │
│  │  │ • Create PaymentIntent with Stripe               │  │   │
│  │  │ • Return clientSecret                            │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                      ↓                                  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  2. Stripe Processes Payment                     │  │   │
│  │  │  (Payment goes through Stripe network)           │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                      ↓                                  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  3. Confirm Payment API                          │  │   │
│  │  │  (/api/payments)                                 │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ • Authenticate user                              │  │   │
│  │  │ • Verify payment succeeded                       │  │   │
│  │  │ • Update booking status → 'confirmed'            │  │   │
│  │  │ • Generate QR code                               │  │   │
│  │  │ • Update parking slot → 'booked'                 │  │   │
│  │  │ • Save to database                               │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                      ↓                                  │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  4. Return Success Response                      │  │   │
│  │  │  {                                                │  │   │
│  │  │    message: "Payment successful",                 │  │   │
│  │  │    qrCode: "base64_encoded_data",                 │  │   │
│  │  │    booking: { ... }                              │  │   │
│  │  │  }                                                │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Database (MongoDB)                              │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ • Bookings collection                            │  │   │
│  │  │ • Payments collection                            │  │   │
│  │  │ • ParkingSlots collection                        │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                            ↕                                   │
│                       (HTTPS)                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          SUCCESS SCREEN - Client Displays QR Code       │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Success Page (payment/page.tsx)                 │  │   │
│  │  ├──────────────────────────────────────────────────┤  │   │
│  │  │ • Show confirmation                              │  │   │
│  │  │ • Display QR code (SVG)                          │  │   │
│  │  │ • Show booking details                           │  │   │
│  │  │ • Display amount paid                            │  │   │
│  │  │ • Show validity period                           │  │   │
│  │  │ • Provide navigation options                     │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  User can:                                              │   │
│  │  • Take screenshot of QR code                          │   │
│  │  • Print QR code                                       │   │
│  │  • View booking details                                │   │
│  │  • Navigate to dashboard                               │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

```

## 🔄 Request/Response Flow

### Phase 1: Initialization
```
Client                    Server                Stripe
  │                         │                     │
  ├──────────────────────────────────────────────>│
  │ Request: Create PaymentIntent                 │
  │ • bookingId: "booking_123"                    │
  │ • amount: 150                                 │
  │                         │                     │
  │                         ├────────────────────>│
  │                         │ Create PaymentIntent│
  │                         │ • amount: 15000 (₹) │
  │                         │ • currency: INR     │
  │                         │ • metadata: {...}   │
  │                         │                     │
  │                         │<────────────────────┤
  │                         │ PaymentIntent ID    │
  │                         │ Client Secret       │
  │                         │                     │
  │<────────────────────────┤                     │
  │ Response: Client Secret │                     │
  │                         │                     │
```

### Phase 2: Card Entry
```
Client                    Stripe
  │
  ├──────────────────────────────────────────────>
  │ PaymentElement mounts and displays
  │
  User types card details (Client -> Stripe JS)
  │
  │<────────────────────────────────────────────┤
  │ Card details securely handled by Stripe JS
  │ (NOT sent to server)
  │
```

### Phase 3: Payment Processing
```
Client                    Stripe                Payment Network
  │                         │                        │
  ├──────────────────────────────────────────────────>
  │ confirmPayment()        │                        │
  │ • clientSecret          │                        │
  │ • card details          │                        │
  │                         │                        │
  │                         ├──────────────────────>│
  │                         │ Process payment       │
  │                         │ through network       │
  │                         │                        │
  │                         │<──────────────────────┤
  │                         │ Payment result        │
  │                         │                        │
  │<────────────────────────┤                        │
  │ Payment result          │                        │
  │ • status: 'succeeded'   │                        │
  │ • paymentIntentId       │                        │
  │                         │                        │
```

### Phase 4: Backend Confirmation
```
Client                    Server                Database
  │                         │                      │
  ├──────────────────────────────────────────────>│
  │ POST /api/payments      │                      │
  │ • bookingId             │                      │
  │ • paymentIntentId       │                      │
  │                         │                      │
  │                         ├─────────────────────>│
  │                         │ Update booking:      │
  │                         │ • status: confirmed  │
  │                         │ • paymentId: ref     │
  │                         │ • qrCode: data       │
  │                         │                      │
  │                         ├─────────────────────>│
  │                         │ Update slot:         │
  │                         │ • status: booked     │
  │                         │                      │
  │                         │<──────────────────────
  │                         │ Write complete       │
  │                         │                      │
  │<────────────────────────┤                      │
  │ Response:               │                      │
  │ • qrCode (base64)       │                      │
  │ • booking details       │                      │
  │                         │                      │
```

## 📦 Data Structure

### PaymentIntent Creation Request
```json
{
  "bookingId": "507f1f77bcf86cd799439011",
  "amount": 150
}
```

### PaymentIntent Creation Response
```json
{
  "clientSecret": "pi_1234567890_secret_0987654321",
  "paymentIntentId": "pi_1234567890"
}
```

### Payment Confirmation Request
```json
{
  "bookingId": "507f1f77bcf86cd799439011",
  "paymentMethod": "stripe_card",
  "paymentIntentId": "pi_1234567890"
}
```

### Payment Confirmation Response
```json
{
  "message": "Payment successful",
  "payment": {
    "_id": "60d5ec49c1234567890abcde",
    "bookingId": "507f1f77bcf86cd799439011",
    "userId": "60d5ec49c1234567890abcd0",
    "amount": 150,
    "currency": "INR",
    "status": "completed",
    "method": "stripe_card",
    "stripePaymentIntentId": "pi_1234567890"
  },
  "booking": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "confirmed",
    "qrCode": "eyJib29raW5nSWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEifQ==",
    "paymentId": "60d5ec49c1234567890abcde"
  },
  "qrCode": "eyJib29raW5nSWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEifQ=="
}
```

### QR Code Data (Decoded from Base64)
```json
{
  "bookingId": "507f1f77bcf86cd799439011",
  "slotId": "60d5ec49c1234567890abc12",
  "vehicleNumber": "MH01AB1234",
  "validFrom": "2024-01-31T10:00:00Z",
  "validTo": "2024-01-31T14:00:00Z"
}
```

## 🗂️ Database Schema

### Payment Collection
```typescript
{
  _id: ObjectId,
  bookingId: ObjectId (ref: Booking),
  userId: ObjectId (ref: User),
  amount: Number,              // in rupees
  currency: String,            // 'INR'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded',
  method: 'stripe_card' | 'razorpay' | ...,
  stripePaymentIntentId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  transactionId: String,
  refundAmount: Number,
  refundReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Collection (Updated)
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  parkingLotId: ObjectId (ref: ParkingLot),
  slotId: ObjectId (ref: ParkingSlot),
  vehicleNumber: String,
  vehicleType: 'car' | 'motorcycle' | 'truck',
  startTime: Date,
  endTime: Date,
  totalAmount: Number,
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled',
  paymentId: ObjectId (ref: Payment),    // ← Links to payment
  qrCode: String,                        // ← Base64 encoded
  checkInTime: Date,
  checkOutTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### ParkingSlot Collection (Updated)
```typescript
{
  _id: ObjectId,
  parkingLotId: ObjectId (ref: ParkingLot),
  slotNumber: String,
  status: 'available' | 'booked' | 'maintenance',
  currentBookingId: ObjectId (ref: Booking),  // ← Links to current booking
  vehicleType: 'car' | 'motorcycle' | 'truck',
  location: {
    floor: Number,
    section: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────┐
│                 Security Architecture               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Layer 1: Transport Security                       │
│  ├─ HTTPS/TLS encryption                           │
│  ├─ Certificate pinning (optional)                 │
│  └─ Secure headers                                 │
│                                                     │
│  Layer 2: Client-Side Security                     │
│  ├─ Stripe JS library                              │
│  ├─ PaymentElement (card data never in DOM)        │
│  ├─ CSRF token validation                          │
│  └─ Input validation & sanitization                │
│                                                     │
│  Layer 3: Server-Side Security                     │
│  ├─ User authentication                            │
│  ├─ Authorization checks                           │
│  ├─ Input validation                               │
│  ├─ Rate limiting                                  │
│  └─ Logging & monitoring                           │
│                                                     │
│  Layer 4: Stripe Security                          │
│  ├─ PCI DSS Level 1 compliance                     │
│  ├─ Card data tokenization                         │
│  ├─ Network security                               │
│  └─ Fraud detection                                │
│                                                     │
│  Layer 5: Database Security                        │
│  ├─ Encrypted at rest                              │
│  ├─ Access control                                 │
│  ├─ Parameterized queries                          │
│  └─ Connection pooling                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 📊 Component Dependencies

```
payment/page.tsx
├── StripeProvider
│   ├── Elements (from @stripe/react-stripe-js)
│   └── loadStripe (from @stripe/stripe-js)
│
├── CheckoutForm
│   ├── PaymentElement
│   ├── useStripe (hook)
│   ├── useElements (hook)
│   ├── Button (from @/components/ui/button)
│   ├── Card (from @/components/ui/card)
│   ├── toast (from sonner)
│   └── Lucide Icons
│
├── Card (from @/components/ui/card)
├── Skeleton (from @/components/ui/skeleton)
├── QRCodeSVG (from qrcode.react)
└── Other UI Components
```

## 🌐 API Endpoint Architecture

```
/api
├── /create-payment-intent
│   ├── Method: POST
│   ├── Auth: Required
│   ├── Input: { bookingId, amount }
│   └── Output: { clientSecret, paymentIntentId }
│
└── /payments
    ├── Method: POST
    ├── Auth: Required
    ├── Input: { bookingId, paymentIntentId, paymentMethod }
    └── Output: { message, payment, booking, qrCode }
```

## 🔄 State Flow Diagram

```
User initiates booking
        ↓
[Status: PENDING]
Booking created, pending payment
        ↓
User navigates to /dashboard/payment
        ↓
System fetches booking details
        ↓
System creates PaymentIntent
        ↓
PaymentElement displays
        ↓
User enters card details
        ↓
User submits form
        ↓
Stripe processes payment
        ↓
        ├─→ [Success] → System updates booking → [Status: CONFIRMED]
        │                          ↓
        │                   Generate QR code
        │                          ↓
        │                   Show success screen
        │
        └─→ [Failed] → Show error message
                              ↓
                       User can retry
                       Status remains: PENDING
```

## 📈 Scalability Considerations

```
Current Implementation:
- Single payment endpoint
- Synchronous processing
- Database fallback to mock data

Future Enhancements:
- Webhook event handling (async)
- Message queue (Redis/Kafka)
- Payment processing service
- Webhook retry logic
- Event-driven architecture
```

---

This architecture ensures:
- ✅ **Security**: PCI compliance, no card data stored
- ✅ **Reliability**: Fallback mechanisms, error handling
- ✅ **Scalability**: Stateless API design
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Performance**: Optimized request/response flow
