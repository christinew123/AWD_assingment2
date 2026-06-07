"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Navbar from "../components/Navbar";
import BookingSteps from "../components/BookingSteps";

type Flight = {
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
  seatsAvailable: number;
};

const airports: Record<string, { name: string; airport: string }> = {
  NZNE: { name: "Dairy Flat", airport: "Dairy Flat Airport" },
  YSSY: { name: "Sydney", airport: "Sydney Airport" },
  NZRO: { name: "Rotorua", airport: "Rotorua Airport" },
  NZGB: { name: "Great Barrier Island", airport: "Great Barrier Aerodrome" },
  NZCI: { name: "Chatham Islands", airport: "Tuuta Airport" },
  NZTL: { name: "Lake Tekapo", airport: "Lake Tekapo Airport" },
};

const routeTemplates = [
  {
    prefix: "DFA1",
    origin: "NZNE",
    destination: "YSSY",
    departTime: "10:30",
    arriveTime: "12:30",
    returnDepartTime: "09:30",
    returnArriveTime: "11:30",
    duration: "02hrs 00mins",
    aircraft: "SyberJet SJ30i",
    price: 1850,
  },
  {
    prefix: "DFA2",
    origin: "NZNE",
    destination: "NZRO",
    departTime: "07:00",
    arriveTime: "08:00",
    returnDepartTime: "16:00",
    returnArriveTime: "17:00",
    duration: "01hrs 00mins",
    aircraft: "Cirrus SF50 Jet",
    price: 320,
  },
  {
    prefix: "DFA3",
    origin: "NZNE",
    destination: "NZGB",
    departTime: "09:00",
    arriveTime: "09:45",
    returnDepartTime: "17:00",
    returnArriveTime: "17:45",
    duration: "45mins",
    aircraft: "Cirrus SF50 Jet",
    price: 450,
  },
  {
    prefix: "DFA4",
    origin: "NZNE",
    destination: "NZCI",
    departTime: "08:30",
    arriveTime: "11:15",
    returnDepartTime: "12:30",
    returnArriveTime: "15:15",
    duration: "02hrs 45mins",
    aircraft: "SyberJet SJ30i",
    price: 980,
  },
  {
    prefix: "DFA5",
    origin: "NZNE",
    destination: "NZTL",
    departTime: "13:00",
    arriveTime: "15:00",
    returnDepartTime: "10:00",
    returnArriveTime: "12:00",
    duration: "02hrs 00mins",
    aircraft: "SyberJet SJ30i",
    price: 620,
  },
];

function generateJuneFlights(): Flight[] {
  const generatedFlights: Flight[] = [];

  for (let day = 1; day <= 30; day++) {
    const date = `2026-06-${String(day).padStart(2, "0")}`;

    routeTemplates.forEach((route, routeIndex) => {
      generatedFlights.push({
        flightNumber: `${route.prefix}${String(day).padStart(2, "0")}A`,
        origin: route.origin,
        destination: route.destination,
        departureDate: date,
        arrivalDate: date,
        departureTime: route.departTime,
        arrivalTime: route.arriveTime,
        duration: route.duration,
        aircraft: route.aircraft,
        price: route.price,
        seatsAvailable: (day + routeIndex) % 7 === 0 ? 0 : 6,
      });

      generatedFlights.push({
        flightNumber: `${route.prefix}${String(day).padStart(2, "0")}B`,
        origin: route.destination,
        destination: route.origin,
        departureDate: date,
        arrivalDate: date,
        departureTime: route.returnDepartTime,
        arrivalTime: route.returnArriveTime,
        duration: route.duration,
        aircraft: route.aircraft,
        price: route.price,
        seatsAvailable: (day + routeIndex + 2) % 9 === 0 ? 0 : 6,
      });
    });
  }

  return generatedFlights;
}

const flights: Flight[] = generateJuneFlights();

function getAirport(code: string) {
  return airports[code] || { name: code, airport: code };
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date
    .toLocaleDateString("en-NZ", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    .toUpperCase();
}

function findFlight(flightNumber: string) {
  return flights.find(
    (flight) =>
      flight.flightNumber.trim().toLowerCase() ===
      flightNumber.trim().toLowerCase()
  );
}

function createBookingReference(rawText: string) {
  let total = 0;

  for (let i = 0; i < rawText.length; i++) {
    total += rawText.charCodeAt(i) * (i + 1);
  }

  return `DFA-${String(total).slice(0, 6).padStart(6, "0")}`;
}

function buildFlightForDatabase(flight: Flight) {
  return {
    flightNumber: flight.flightNumber,
    origin: flight.origin,
    destination: flight.destination,
    departureDate: flight.departureDate,
    arrivalDate: flight.arrivalDate,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    duration: flight.duration,
    aircraft: flight.aircraft,
    price: flight.price,
  };
}

function ConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const flightNumber = searchParams.get("flightNumber") || "";
  const returnFlightNumber = searchParams.get("returnFlightNumber") || "";
  const passengers = Number(searchParams.get("passengers") || "1");
  const email = searchParams.get("email") || "";
  const title = searchParams.get("title") || "";
  const firstName = searchParams.get("firstName") || "";
  const lastName = searchParams.get("lastName") || "";
  const phone = searchParams.get("phone") || "";
  const phoneCountryCode = searchParams.get("phoneCountryCode") || "";
  const phoneNumber = searchParams.get("phoneNumber") || "";
  const isChangingFlight = searchParams.get("isChangingFlight") === "true";
  const existingBookingReference = searchParams.get("bookingReference") || "";
  const familyName = searchParams.get("familyName") || "";

  const outboundFlight = findFlight(flightNumber);
  const returnFlight = findFlight(returnFlightNumber);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (!outboundFlight) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f3f6fb",
          padding: "80px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            background: "white",
            padding: 42,
          }}
        >
          <Link href="/search">← Back to Search</Link>
          <h1>Booking Not Found</h1>
        </div>
      </main>
    );
  }

  const outboundFrom = getAirport(outboundFlight.origin);
  const outboundTo = getAirport(outboundFlight.destination);

  const returnFrom = returnFlight ? getAirport(returnFlight.origin) : null;
  const returnTo = returnFlight ? getAirport(returnFlight.destination) : null;

  const totalFare =
    (outboundFlight.price + (returnFlight ? returnFlight.price : 0)) *
    passengers;

  const bookingReference =
    isChangingFlight && existingBookingReference
      ? existingBookingReference
      : createBookingReference(
          `${flightNumber}-${returnFlightNumber}-${passengers}-${email}-${title}-${firstName}-${lastName}`
        );

  const invoiceUrl =
    `/invoice?flightNumber=${outboundFlight.flightNumber}` +
    `&returnFlightNumber=${returnFlight ? returnFlight.flightNumber : ""}` +
    `&passengers=${passengers}` +
    `&firstName=${encodeURIComponent(firstName)}` +
    `&lastName=${encodeURIComponent(lastName)}` +
    `&email=${encodeURIComponent(email)}` +
    `&phone=${encodeURIComponent(phone)}` +
    `&phoneCountryCode=${encodeURIComponent(phoneCountryCode)}` +
    `&phoneNumber=${encodeURIComponent(phoneNumber)}` +
    `&reference=${encodeURIComponent(bookingReference)}` +
    `&isChangingFlight=${isChangingFlight ? "true" : "false"}` +
    `&bookingReference=${encodeURIComponent(bookingReference)}` +
    `&familyName=${encodeURIComponent(familyName)}`;

  async function handleConfirmBooking() {
    setSaveError("");

    if (!firstName || !lastName || !email) {
      setSaveError(
        "Please go back and enter the passenger name and email before confirming."
      );
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingReference,
          status: "confirmed",
          passenger: {
            title,
            firstName,
            lastName,
            email,
            phoneCountryCode,
            phoneNumber,
            phone,
          },
          passengers,
          outboundFlight: buildFlightForDatabase(outboundFlight!),
          returnFlight: returnFlight
            ? buildFlightForDatabase(returnFlight)
            : null,
          totalFare,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Booking could not be saved.");
      }

      router.push(invoiceUrl);
    } catch (error) {
      console.error(error);
      setSaveError(
        "Booking could not be saved into MongoDB. Please check the terminal error."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #f3f6fb;
          color: #071733;
          overflow-x: hidden;
        }

        .page {
          min-height: 100vh;
          background: #f3f6fb;
        }

        .summary-banner {
          background: #062b67;
          color: white;
          border-bottom: 1px solid #001b4f;
        }

        .summary-inner {
          max-width: 1500px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .trip-title-row {
          min-height: 38px;
          display: flex;
          align-items: center;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .simple-flight-summary {
          background: #f3f6fb;
          color: #071733;
          display: grid;
          grid-template-columns: 1fr 1fr 0.55fr;
          border-bottom: 1px solid #cbd5e1;
        }

        .simple-flight-box,
        .simple-fare-box {
          min-height: 82px;
          padding: 14px 28px;
          border-right: 1px solid #cbd5e1;
        }

        .simple-label,
        .simple-fare-label {
          margin: 0 0 5px;
          font-size: 11px;
          color: #334155;
        }

        .simple-date {
          margin: 0 0 5px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .simple-route {
          display: grid;
          grid-template-columns: 1fr 42px 1fr;
          align-items: center;
          gap: 12px;
        }

        .simple-airport-code {
          font-size: 20px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #062b67;
          white-space: nowrap;
        }

        .simple-airport-name {
          margin-top: 2px;
          font-size: 11px;
          font-weight: 700;
        }

        .simple-plane {
          text-align: center;
          font-size: 20px;
          color: #062b67;
        }

        .simple-duration {
          margin-top: 3px;
          text-align: center;
          font-size: 10px;
          color: #475569;
          white-space: nowrap;
        }

        .simple-passenger {
          margin: 0;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .simple-price {
          margin: 5px 0 3px;
          font-size: 20px;
          font-weight: 500;
          color: #062b67;
        }

        .simple-note {
          margin: 0;
          font-size: 10px;
          font-style: italic;
          color: #334155;
          line-height: 1.35;
        }

        .container {
          max-width: 1040px;
          margin: 0 auto;
          padding: 32px 28px 70px;
        }

        .back {
          display: inline-block;
          margin-bottom: 22px;
          color: #0070a8;
          font-weight: 800;
          text-decoration: none;
          font-size: 14px;
        }

        .label {
          margin: 0 0 8px;
          color: #0070a8;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .title {
          margin: 0 0 12px;
          font-size: 30px;
          letter-spacing: 0.08em;
          font-weight: 500;
        }

        .subtitle {
          margin: 0 0 28px;
          font-size: 14px;
          color: #475569;
          line-height: 1.5;
        }

        .grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 18px;
        }

        .card {
          background: white;
          border: 1px solid #d7dde8;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
          min-width: 0;
          overflow: hidden;
        }

        .section-title {
          margin: 0 0 16px;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 0.06em;
        }

        .flight-card {
          border: 1px solid #e2e8f0;
          padding: 16px;
          margin-bottom: 14px;
        }

        .flight-heading {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
          font-size: 13px;
          font-weight: 900;
          color: #062b67;
        }

        .route {
          display: grid;
          grid-template-columns: 1fr 48px 1fr;
          gap: 14px;
          align-items: center;
        }

        .code {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.07em;
          color: #062b67;
          white-space: nowrap;
        }

        .date {
          margin-top: 4px;
          font-size: 11px;
          font-weight: 800;
        }

        .airport {
          margin-top: 4px;
          font-size: 12px;
          color: #475569;
        }

        .plane {
          text-align: center;
          color: #062b67;
          font-size: 20px;
        }

        .duration {
          text-align: center;
          font-size: 10px;
          color: #64748b;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 9px 0;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
        }

        .summary-row strong {
          text-align: right;
          word-break: break-word;
        }

        .total {
          margin-top: 18px;
          font-size: 24px;
          font-weight: 900;
          color: #062b67;
        }

        .confirm-button {
          margin-top: 20px;
          display: flex;
          width: 100%;
          height: 46px;
          border: none;
          background: #062b67;
          color: white;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .confirm-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 12px;
          color: #b91c1c;
          font-size: 12px;
          line-height: 1.4;
        }

        @media (max-width: 1100px) {
          .simple-flight-summary,
          .grid {
            grid-template-columns: 1fr;
          }

          .route {
            grid-template-columns: 1fr;
          }

          .plane,
          .duration {
            text-align: left;
          }
        }
      `}</style>

      <main className="page">
        <Navbar />
        <BookingSteps currentStep="confirm" />

        <section className="summary-banner">
          <div className="summary-inner">
            <div className="trip-title-row">
              {outboundFlight.origin} - {outboundFlight.destination}
              {returnFlight
                ? ` ⇄ ${returnFlight.origin} - ${returnFlight.destination}`
                : ""}{" "}
              · {passengers} {passengers === 1 ? "Adult" : "Adults"}
            </div>
          </div>

          <div className="simple-flight-summary">
            <SummaryFlight
              label="Departing"
              flight={outboundFlight}
              fromName={outboundFrom.name}
              toName={outboundTo.name}
            />

            {returnFlight && returnFrom && returnTo && (
              <SummaryFlight
                label="Returning"
                flight={returnFlight}
                fromName={returnFrom.name}
                toName={returnTo.name}
              />
            )}

            <div className="simple-fare-box">
              <p className="simple-fare-label">Total fare</p>
              <p className="simple-passenger">
                {passengers} {passengers === 1 ? "Adult" : "Adults"}
              </p>
              <p className="simple-price">NZD {totalFare}</p>
              <p className="simple-note">
                Total fare includes selected flights and passenger fare.
              </p>
            </div>
          </div>
        </section>

        <section className="container">
          <Link
            href={
              `/passenger?flightNumber=${flightNumber}` +
              `&returnFlightNumber=${returnFlightNumber}` +
              `&passengers=${passengers}` +
              `&email=${encodeURIComponent(email)}` +
              `&phone=${encodeURIComponent(phone)}` +
              `&phoneCountryCode=${encodeURIComponent(phoneCountryCode)}` +
              `&phoneNumber=${encodeURIComponent(phoneNumber)}` +
              `&title=${encodeURIComponent(title)}` +
              `&firstName=${encodeURIComponent(firstName)}` +
              `&lastName=${encodeURIComponent(lastName)}` +
              `&isChangingFlight=${isChangingFlight ? "true" : "false"}` +
              `&bookingReference=${encodeURIComponent(bookingReference)}` +
              `&familyName=${encodeURIComponent(familyName)}`
            }
            className="back"
          >
            ← Back
          </Link>

          <p className="label">Confirm Booking</p>
          <h1 className="title">Review Your Booking</h1>
          <p className="subtitle">
            Please confirm the flight and passenger details before creating the
            booking.
          </p>

          <div className="grid">
            <section className="card">
              <h2 className="section-title">Selected flights</h2>
              <ConfirmFlight label="Depart" flight={outboundFlight} />
              {returnFlight && (
                <ConfirmFlight label="Return" flight={returnFlight} />
              )}
            </section>

            <aside className="card">
              <h2 className="section-title">Booking summary</h2>

              <div className="summary-row">
                <span>Passenger</span>
                <strong>
                  {title} {firstName} {lastName}
                </strong>
              </div>

              <div className="summary-row">
                <span>Email</span>
                <strong>{email || "Not entered"}</strong>
              </div>

              <div className="summary-row">
                <span>Passengers</span>
                <strong>{passengers}</strong>
              </div>

              <div className="summary-row">
                <span>Cabin</span>
                <strong>Luxury Cabin</strong>
              </div>

              <div className="summary-row">
                <span>Booking reference</span>
                <strong>{bookingReference}</strong>
              </div>

              <div className="total">NZD {totalFare}</div>

              <button
                type="button"
                className="confirm-button"
                onClick={handleConfirmBooking}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Confirm Booking"}
              </button>

              {saveError && <p className="error-message">{saveError}</p>}
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

function SummaryFlight({
  label,
  flight,
  fromName,
  toName,
}: {
  label: string;
  flight: Flight;
  fromName: string;
  toName: string;
}) {
  return (
    <div className="simple-flight-box">
      <p className="simple-label">{label}</p>

      <div className="simple-route">
        <div>
          <p className="simple-date">{formatDate(flight.departureDate)}</p>
          <div className="simple-airport-code">
            {flight.origin} {flight.departureTime}
          </div>
          <div className="simple-airport-name">{fromName}</div>
        </div>

        <div>
          <div className="simple-plane">✈</div>
          <div className="simple-duration">{flight.duration}</div>
        </div>

        <div>
          <p className="simple-date">{formatDate(flight.arrivalDate)}</p>
          <div className="simple-airport-code">
            {flight.destination} {flight.arrivalTime}
          </div>
          <div className="simple-airport-name">{toName}</div>
        </div>
      </div>
    </div>
  );
}

function ConfirmFlight({ label, flight }: { label: string; flight: Flight }) {
  return (
    <div className="flight-card">
      <div className="flight-heading">
        <span>
          {label} · {flight.flightNumber}
        </span>
        <span>Luxury Cabin</span>
      </div>

      <div className="route">
        <div>
          <div className="code">
            {flight.origin} {flight.departureTime}
          </div>
          <div className="date">{formatDate(flight.departureDate)}</div>
          <div className="airport">{getAirport(flight.origin).airport}</div>
        </div>

        <div>
          <div className="plane">✈</div>
          <div className="duration">{flight.duration}</div>
        </div>

        <div>
          <div className="code">
            {flight.destination} {flight.arrivalTime}
          </div>
          <div className="date">{formatDate(flight.arrivalDate)}</div>
          <div className="airport">
            {getAirport(flight.destination).airport}
          </div>
        </div>
      </div>
    </div>
  );
}


export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            background: "#f3f6fb",
            padding: "80px 24px",
            color: "#071733",
          }}
        >
          Loading confirmation page...
        </main>
      }
    >
      <ConfirmPageContent />
    </Suspense>
  );
}
