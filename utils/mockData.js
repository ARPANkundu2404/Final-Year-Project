/**
 * utils/mockData.js
 * Simulated parking lot data.
 * FIREBASE_INTEGRATION_POINT: Replace with Firestore getDocs.
 */

export const MOCK_LOTS = [
  {
    id: "lot_mgroad",
    name: "MG Road Central",
    address: "MG Road, Bangalore",
    coordinates: { lat: 12.9757, lng: 77.6072 },
    totalSlots: 180,
    availableCount: 94,
    pricePerHour: 50,
    amenities: ["CCTV", "Valet", "EV Charging", "Covered", "24/7"],
    rating: 4.8,
  },
  {
    id: "lot_nexus",
    name: "Nexus Mall Whitefield",
    address: "Whitefield, Bangalore",
    coordinates: { lat: 12.9698, lng: 77.7499 },
    totalSlots: 240,
    availableCount: 0,
    pricePerHour: 40,
    amenities: ["CCTV", "Covered", "Valet"],
    rating: 4.5,
  },
  {
    id: "lot_indiranagar",
    name: "Indiranagar Metro Hub",
    address: "100 Feet Rd, Indiranagar",
    coordinates: { lat: 12.9784, lng: 77.6408 },
    totalSlots: 80,
    availableCount: 22,
    pricePerHour: 20,
    amenities: ["CCTV", "24/7"],
    rating: 4.2,
  },
  {
    id: "lot_koramangala",
    name: "Koramangala SmartPark",
    address: "80 Feet Rd, Koramangala",
    coordinates: { lat: 12.9352, lng: 77.6245 },
    totalSlots: 60,
    availableCount: 14,
    pricePerHour: 35,
    amenities: ["CCTV", "EV Charging", "App Controlled"],
    rating: 4.9,
  },
  {
    id: "lot_forum",
    name: "Forum Citadel",
    address: "Old Madras Road, Bangalore",
    coordinates: { lat: 12.9695, lng: 77.5920 },
    totalSlots: 100,
    availableCount: 37,
    pricePerHour: 30,
    amenities: ["CCTV", "Valet"],
    rating: 4.4,
  },
];