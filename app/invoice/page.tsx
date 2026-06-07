"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

function InvoicePageContent() {
  const searchParams = useSearchParams();

  const flightNumber = searchParams.get("flightNumber") || "";
  const returnFlightNumber = searchParams.get("returnFlightNumber") || "";
  const passengers = Number(searchParams.get("passengers") || "1");

  const firstName = searchParams.get("firstName") || "";
  const lastName = searchParams.get("lastName") || "";
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";

  const reference =
    searchParams.get("bookingReference") ||
    searchParams.get("reference") ||
    "DFA-000000";

  const isChangingFlight = searchParams.get("isChangingFlight") === "true";

  const outboundFlight = findFlight(flightNumber);
  const returnFlight = findFlight(returnFlightNumber);

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
            maxWidth: 800,
            margin: "0 auto",
            background: "white",
            padding: 36,
            borderRadius: 14,
          }}
        >
          <Link href="/search">← Back to Search</Link>
          <h1>Invoice Cannot Be Created</h1>
          <p>
            The selected flight could not be found. Please return to the search
            page and try again.
          </p>
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
          color: white;
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
          min-height: 78px;
          padding: 12px 24px;
          border-right: 1px solid #cbd5e1;
        }

        .simple-label,
        .simple-fare-label {
          margin: 0 0 4px;
          font-size: 10px;
          color: #334155;
        }

        .simple-date {
          margin: 0 0 4px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          color: #071733;
        }

        .simple-route {
          display: grid;
          grid-template-columns: 1fr 38px 1fr;
          align-items: center;
          gap: 10px;
        }

        .simple-airport-code {
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #062b67;
          white-space: nowrap;
        }

        .simple-airport-name {
          margin-top: 2px;
          font-size: 10px;
          font-weight: 700;
          color: #111827;
        }

        .simple-plane {
          text-align: center;
          font-size: 18px;
          color: #062b67;
        }

        .simple-duration {
          margin-top: 3px;
          text-align: center;
          font-size: 9px;
          color: #475569;
          white-space: nowrap;
        }

        .simple-passenger {
          margin: 0;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .simple-price {
          margin: 4px 0 2px;
          font-size: 18px;
          font-weight: 500;
          color: #062b67;
        }

        .simple-note {
          margin: 0;
          font-size: 9px;
          font-style: italic;
          color: #334155;
          line-height: 1.35;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 24px 55px;
        }

        .back {
          display: inline-block;
          margin-bottom: 18px;
          color: #0070a8;
          font-weight: 800;
          text-decoration: none;
          font-size: 13px;
        }

        .label {
          margin: 0 0 7px;
          color: #0070a8;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .title {
          margin: 0 0 10px;
          font-size: 26px;
          letter-spacing: 0.07em;
          font-weight: 500;
          color: #071733;
        }

        .subtitle {
          margin: 0 0 20px;
          font-size: 13px;
          color: #475569;
          line-height: 1.45;
        }

        .invoice-card {
          background: white;
          border: 1px solid #d7dde8;
          border-radius: 14px;
          padding: 18px 22px;
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }

        .reference-box {
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 14px;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
        }

        .reference-label {
          margin: 0;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #64748b;
        }

        .reference {
          margin: 6px 0 0;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 0.12em;
          color: #062b67;
        }

        .status {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .change-note {
          margin: 14px 0 0;
          padding: 12px 14px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e3a8a;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.45;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 18px;
        }

        .section-title {
          margin: 0 0 10px;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 0.06em;
        }

        .detail-list {
          display: grid;
          gap: 7px;
          color: #334155;
          font-size: 12px;
        }

        .detail-list p {
          margin: 0;
        }

        .payment-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
        }

        .payment-label {
          margin: 0;
          color: #64748b;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.14em;
        }

        .payment-price {
          margin: 6px 0 0;
          font-size: 22px;
          font-weight: 900;
          color: #062b67;
        }

        .flight-section {
          margin-top: 16px;
          border: 1px solid #dbe3ef;
          border-radius: 12px;
          padding: 14px;
        }

        .flight-number {
          margin: 0;
          color: #0070a8;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .route-title {
          margin: 6px 0 5px;
          font-size: 16px;
          font-weight: 900;
        }

        .aircraft {
          margin: 0;
          color: #475569;
          font-size: 12px;
        }

        .flight-grid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .flight-info {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 12px;
        }

        .flight-info-label {
          margin: 0;
          color: #64748b;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .flight-info-value {
          margin: 5px 0 0;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.35;
        }

        .actions {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .primary-button {
          min-height: 40px;
          padding: 0 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: #062b67;
          color: white;
        }

        .secondary-button {
          min-height: 40px;
          padding: 0 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: #e2e8f0;
          color: #071733;
        }

        @media (max-width: 1100px) {
          .simple-flight-summary,
          .grid,
          .flight-grid,
          .reference-box {
            grid-template-columns: 1fr;
          }

          .reference {
            font-size: 22px;
          }

          .title {
            font-size: 24px;
          }
        }
      `}</style>

      <main className="page">
        <Navbar />
        <BookingSteps currentStep="invoice" />

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
          <Link href="/" className="back">
            ← Back to Home
          </Link>

          <p className="label">Booking Invoice</p>

          <h1 className="title">
            {isChangingFlight ? "Booking Updated" : "Booking Confirmed"}
          </h1>

          <p className="subtitle">
            Your Dairy Flat Airways booking has been{" "}
            {isChangingFlight ? "updated" : "confirmed"}. Please keep your
            booking reference for future booking management.
          </p>

          <div className="invoice-card">
            <div className="reference-box">
              <div>
                <p className="reference-label">Booking Reference</p>
                <p className="reference">{reference}</p>
              </div>

              <div className="status">
                {isChangingFlight ? "Updated" : "Confirmed"}
              </div>
            </div>

            {isChangingFlight && (
              <p className="change-note">
                Your flight details have been updated under the same booking
                reference. No new booking reference was created.
              </p>
            )}

            <div className="grid">
              <section>
                <h2 className="section-title">Passenger Details</h2>

                <div className="detail-list">
                  <p>
                    <strong>Name:</strong> {firstName} {lastName}
                  </p>

                  <p>
                    <strong>Email:</strong> {email || "Not entered"}
                  </p>

                  <p>
                    <strong>Phone:</strong> {phone || "Not entered"}
                  </p>
                </div>
              </section>

              <section>
                <h2 className="section-title">Payment Summary</h2>

                <div className="payment-box">
                  <p className="payment-label">Total Price</p>
                  <p className="payment-price">NZD {totalFare}</p>
                </div>
              </section>
            </div>

            <InvoiceFlight flight={outboundFlight} />
            {returnFlight && <InvoiceFlight flight={returnFlight} />}

            <div className="actions">
              <Link href="/" className="primary-button">
                Return Home
              </Link>

              <Link
                href={`/#manage-booking`}
                className="secondary-button"
              >
                Manage Booking
              </Link>
            </div>
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

function InvoiceFlight({ flight }: { flight: Flight }) {
  return (
    <section className="flight-section">
      <p className="flight-number">{flight.flightNumber}</p>

      <h2 className="route-title">
        {getAirport(flight.origin).name} ({flight.origin}) →{" "}
        {getAirport(flight.destination).name} ({flight.destination})
      </h2>

      <p className="aircraft">Aircraft: {flight.aircraft}</p>

      <div className="flight-grid">
        <div className="flight-info">
          <p className="flight-info-label">Departure</p>
          <p className="flight-info-value">
            {formatDate(flight.departureDate)}, {flight.departureTime}
          </p>
        </div>

        <div className="flight-info">
          <p className="flight-info-label">Arrival</p>
          <p className="flight-info-value">
            {formatDate(flight.arrivalDate)}, {flight.arrivalTime}
          </p>
        </div>

        <div className="flight-info">
          <p className="flight-info-label">Cabin</p>
          <p className="flight-info-value">Luxury Cabin</p>
        </div>
      </div>
    </section>
  );
}


export default function InvoicePage() {
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
          Loading invoice page...
        </main>
      }
    >
      <InvoicePageContent />
    </Suspense>
  );
}
