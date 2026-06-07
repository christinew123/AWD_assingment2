import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI as string;
const dbName = "assignment2";
const collectionName = "bookings";

let cachedClient: MongoClient | null = null;

async function getClient() {
  if (cachedClient) return cachedClient;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from .env.local");
  }

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const bookingReference = String(body.bookingReference || "").trim();
    const familyName = String(body.familyName || "").trim();

    if (!bookingReference) {
      return NextResponse.json(
        { error: "Booking reference is required." },
        { status: 400 }
      );
    }

    const client = await getClient();
    const db = client.db(dbName);
    const bookings = db.collection(collectionName);

    const booking = await bookings.findOne({
      bookingReference,
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking reference was not found." },
        { status: 404 }
      );
    }

    if (familyName) {
      const storedLastName =
        booking.passenger?.lastName ||
        booking.passenger?.familyName ||
        booking.passenger?.surname ||
        booking.lastName ||
        booking.familyName ||
        booking.surname ||
        "";

      if (
        storedLastName &&
        storedLastName.toLowerCase() !== familyName.toLowerCase()
      ) {
        return NextResponse.json(
          { error: "Last / family name does not match this booking." },
          { status: 403 }
        );
      }
    }

    if (String(booking.status || "").toLowerCase() === "cancelled") {
      return NextResponse.json(
        { error: "This booking has already been cancelled." },
        { status: 409 }
      );
    }

    await bookings.updateOne(
      { bookingReference },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: `Booking ${bookingReference} has been cancelled successfully.`,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return NextResponse.json(
      { error: "Unable to cancel booking." },
      { status: 500 }
    );
  }
}