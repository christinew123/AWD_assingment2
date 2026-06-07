import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = String(searchParams.get("email") || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: "Passenger email is required." },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("assignment2");
  const bookingsCollection = db.collection("bookings");

  const bookings = await bookingsCollection
    .find({
      "passenger.email": email,
      status: "confirmed",
    })
    .sort({ departureDateTime: 1 })
    .toArray();

  return NextResponse.json({
    email,
    count: bookings.length,
    bookings,
  });
}