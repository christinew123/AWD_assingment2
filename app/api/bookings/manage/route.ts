import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

type UpdateBookingBody = {
  bookingReference?: string;
  familyName?: string;
  action?: "update-details" | "cancel";
  status?: string;
  passenger?: {
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneCountryCode?: string;
    phoneNumber?: string;
    phone?: string;
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const bookingReference = searchParams.get("bookingReference") || "";
    const familyName = searchParams.get("familyName") || "";

    if (!bookingReference || !familyName) {
      return NextResponse.json(
        { error: "Booking reference and family name are required." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("assignment2");
    const bookingsCollection = db.collection("bookings");

    const booking = await bookingsCollection.findOne({
      bookingReference: bookingReference.trim(),
      $or: [
        {
          "passenger.lastName": new RegExp(
            `^${escapeRegex(familyName.trim())}$`,
            "i"
          ),
        },
        {
          "passenger.familyName": new RegExp(
            `^${escapeRegex(familyName.trim())}$`,
            "i"
          ),
        },
        {
          "passenger.name": new RegExp(
            `${escapeRegex(familyName.trim())}$`,
            "i"
          ),
        },
      ],
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({
      booking: {
        bookingReference: booking.bookingReference,
        status: booking.status || "confirmed",

        passenger: {
          title: booking.passenger?.title || "",
          firstName: booking.passenger?.firstName || "",
          lastName:
            booking.passenger?.lastName ||
            booking.passenger?.familyName ||
            "",
          email: booking.passenger?.email || "",
          phoneCountryCode: booking.passenger?.phoneCountryCode || "+64",
          phoneNumber: booking.passenger?.phoneNumber || "",
          phone: booking.passenger?.phone || "",
        },

        passengers: booking.passengers || 1,
        outboundFlight: booking.outboundFlight || null,
        returnFlight: booking.returnFlight || null,
        totalFare: booking.totalFare || booking.price || 0,
      },
    });
  } catch (error) {
    console.error("Manage booking lookup error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve booking." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as UpdateBookingBody;

    const bookingReference = String(body.bookingReference || "");
    const familyName = String(body.familyName || "");
    const action = body.action || "cancel";

    if (!bookingReference || !familyName) {
      return NextResponse.json(
        { error: "Booking reference and family name are required." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("assignment2");
    const bookingsCollection = db.collection("bookings");

    const bookingFilter = {
      bookingReference: bookingReference.trim(),
      $or: [
        {
          "passenger.lastName": new RegExp(
            `^${escapeRegex(familyName.trim())}$`,
            "i"
          ),
        },
        {
          "passenger.familyName": new RegExp(
            `^${escapeRegex(familyName.trim())}$`,
            "i"
          ),
        },
      ],
    };

    if (action === "cancel") {
      const result = await bookingsCollection.updateOne(bookingFilter, {
        $set: {
          status: "cancelled",
          updatedAt: new Date(),
        },
      });

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: "Booking not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Booking cancelled successfully.",
      });
    }

    if (action === "update-details") {
      const passenger = body.passenger;

      if (!passenger) {
        return NextResponse.json(
          { error: "Passenger details are required." },
          { status: 400 }
        );
      }

      const title = String(passenger.title || "").trim();
      const firstName = String(passenger.firstName || "").trim();
      const lastName = String(passenger.lastName || "").trim();
      const email = String(passenger.email || "").trim();
      const phoneCountryCode = String(passenger.phoneCountryCode || "").trim();
      const phoneNumber = String(passenger.phoneNumber || "").trim();
      const phone = `${phoneCountryCode} ${phoneNumber}`.trim();

      if (!title || !firstName || !lastName || !email || !phoneNumber) {
        return NextResponse.json(
          { error: "All passenger and contact fields are required." },
          { status: 400 }
        );
      }

      if (!isValidEmail(email)) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }

      if (!isValidPhoneNumber(phoneNumber)) {
        return NextResponse.json(
          {
            error:
              "Please enter a valid phone number using 7 to 11 digits, for example 21 123 4567.",
          },
          { status: 400 }
        );
      }

      const result = await bookingsCollection.updateOne(bookingFilter, {
        $set: {
          "passenger.title": title,
          "passenger.firstName": firstName,
          "passenger.lastName": lastName,
          "passenger.email": email,
          "passenger.phoneCountryCode": phoneCountryCode,
          "passenger.phoneNumber": phoneNumber,
          "passenger.phone": phone,
          updatedAt: new Date(),
        },
      });

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: "Booking not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Booking details updated successfully.",
      });
    }

    return NextResponse.json(
      { error: "Invalid booking action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Manage booking update error:", error);

    return NextResponse.json(
      { error: "Unable to update booking." },
      { status: 500 }
    );
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhoneNumber(phone: string) {
  const cleanedPhone = phone.replace(/[\s-]/g, "");
  return /^[0-9]{7,11}$/.test(cleanedPhone);
}