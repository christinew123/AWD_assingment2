import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const TOTAL_SEATS_PER_FLIGHT = 6;

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("assignment2");
    const bookingsCollection = db.collection("bookings");

    const confirmedBookings = await bookingsCollection
      .find({
        status: "confirmed",
      })
      .toArray();

    const bookedSeats: Record<string, number> = {};

    confirmedBookings.forEach((booking) => {
      const passengers = Number(booking.passengers || 1);

      const outboundFlightNumber = booking.outboundFlight?.flightNumber;
      const returnFlightNumber = booking.returnFlight?.flightNumber;

      if (outboundFlightNumber) {
        bookedSeats[outboundFlightNumber] =
          (bookedSeats[outboundFlightNumber] || 0) + passengers;
      }

      if (returnFlightNumber) {
        bookedSeats[returnFlightNumber] =
          (bookedSeats[returnFlightNumber] || 0) + passengers;
      }
    });

    return NextResponse.json({
      success: true,
      totalSeatsPerFlight: TOTAL_SEATS_PER_FLIGHT,
      bookedSeats,
    });
  } catch (error) {
    console.error("Seat availability API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load seat availability.",
        bookedSeats: {},
      },
      { status: 500 }
    );
  }
}