import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

type BookingFlight = {
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  price: number;
};

type BookingRequestBody = {
  bookingReference: string;
  status: string;
  passenger: {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneCountryCode?: string;
    phoneNumber?: string;
    phone?: string;
  };
  passengers: number;
  outboundFlight: BookingFlight;
  returnFlight?: BookingFlight | null;
  totalFare: number;
};

const TOTAL_SEATS_PER_FLIGHT = 6;

export async function POST(request: Request) {
  try {
    console.log("POST /api/bookings was called");

    const body = (await request.json()) as BookingRequestBody;

    console.log("Booking body received:", body);

    if (!body.bookingReference) {
      return NextResponse.json(
        { success: false, message: "Booking reference is missing." },
        { status: 400 }
      );
    }

    if (
      !body.passenger ||
      !body.passenger.firstName ||
      !body.passenger.lastName ||
      !body.passenger.email
    ) {
      return NextResponse.json(
        { success: false, message: "Passenger details are incomplete." },
        { status: 400 }
      );
    }

    if (!body.outboundFlight || !body.outboundFlight.flightNumber) {
      return NextResponse.json(
        { success: false, message: "Outbound flight details are missing." },
        { status: 400 }
      );
    }

    const passengers = Number(body.passengers || 1);

    if (!Number.isFinite(passengers) || passengers < 1) {
      return NextResponse.json(
        { success: false, message: "Passenger number is invalid." },
        { status: 400 }
      );
    }

    if (passengers > TOTAL_SEATS_PER_FLIGHT) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${TOTAL_SEATS_PER_FLIGHT} seat(s) are available per flight.`,
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("assignment2");
    const bookingsCollection = db.collection("bookings");

    const bookingReference = body.bookingReference.trim();

    const outboundSeatsBooked = await getBookedSeatsForFlight(
      bookingsCollection,
      body.outboundFlight.flightNumber,
      bookingReference
    );

    const outboundSeatsLeft = Math.max(
      TOTAL_SEATS_PER_FLIGHT - outboundSeatsBooked,
      0
    );

    if (passengers > outboundSeatsLeft) {
      return NextResponse.json(
        {
          success: false,
          message: `Only ${outboundSeatsLeft} seat(s) left for the departure flight.`,
        },
        { status: 400 }
      );
    }

    if (body.returnFlight?.flightNumber) {
      const returnSeatsBooked = await getBookedSeatsForFlight(
        bookingsCollection,
        body.returnFlight.flightNumber,
        bookingReference
      );

      const returnSeatsLeft = Math.max(
        TOTAL_SEATS_PER_FLIGHT - returnSeatsBooked,
        0
      );

      if (passengers > returnSeatsLeft) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${returnSeatsLeft} seat(s) left for the return flight.`,
          },
          { status: 400 }
        );
      }
    }

    const now = new Date();

    const booking = {
      bookingReference,
      status: body.status || "confirmed",

      passenger: {
        title: body.passenger.title,
        firstName: body.passenger.firstName,
        lastName: body.passenger.lastName,
        email: body.passenger.email,
        phoneCountryCode: body.passenger.phoneCountryCode || "",
        phoneNumber: body.passenger.phoneNumber || "",
        phone: body.passenger.phone || "",
      },

      passengers,

      outboundFlight: body.outboundFlight,
      returnFlight: body.returnFlight || null,

      totalFare: body.totalFare,

      createdAt: now,
      updatedAt: now,
    };

    await bookingsCollection.updateOne(
      { bookingReference },
      {
        $setOnInsert: {
          bookingReference: booking.bookingReference,
          createdAt: booking.createdAt,
        },
        $set: {
          status: booking.status,
          passenger: booking.passenger,
          passengers: booking.passengers,
          outboundFlight: booking.outboundFlight,
          returnFlight: booking.returnFlight,
          totalFare: booking.totalFare,
          updatedAt: booking.updatedAt,
        },
      },
      { upsert: true }
    );

    console.log("Booking saved successfully:", bookingReference);

    return NextResponse.json({
      success: true,
      message: "Booking saved successfully.",
      bookingReference,
    });
  } catch (error) {
    console.error("Booking save error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Booking could not be saved into MongoDB.",
      },
      { status: 500 }
    );
  }
}

async function getBookedSeatsForFlight(
  bookingsCollection: any,
  flightNumber: string,
  currentBookingReference?: string
) {
  const filter: any = {
    status: "confirmed",
    $or: [
      { "outboundFlight.flightNumber": flightNumber },
      { "returnFlight.flightNumber": flightNumber },
    ],
  };

  if (currentBookingReference) {
    filter.bookingReference = { $ne: currentBookingReference };
  }

  const bookings = await bookingsCollection.find(filter).toArray();

  let totalBooked = 0;

  bookings.forEach((booking: any) => {
    totalBooked += Number(booking.passengers || 1);
  });

  return totalBooked;
}
