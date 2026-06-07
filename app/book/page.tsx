"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
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

function BookPageContent() {
  const searchParams = useSearchParams();

  const flightNumber = searchParams.get("flightNumber") || "";

  const tripType =
    searchParams.get("tripType") === "oneway" ? "oneway" : "return";

  const returnFlightNumber =
    tripType === "return" ? searchParams.get("returnFlightNumber") || "" : "";

  const passengerCount = Number(searchParams.get("passengers") || "1");

  const isChangingFlight = searchParams.get("isChangingFlight") || "";
  const bookingReference = searchParams.get("bookingReference") || "";
  const familyName = searchParams.get("familyName") || "";

  const outboundFlight = findFlight(flightNumber);
  const returnFlight = findFlight(returnFlightNumber);

  const totalFare = useMemo(() => {
    return (
      ((outboundFlight?.price || 0) + (returnFlight?.price || 0)) *
      passengerCount
    );
  }, [outboundFlight, returnFlight, passengerCount]);

  if (!outboundFlight) {
    return (
      <main className="error-page">
        <style>{`
          .error-page {
            min-height: 100vh;
            background: #f3f6fb;
            padding: 80px 24px;
            color: #071733;
          }

          .error-card {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 18px;
            padding: 42px;
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
          }

          .back-link {
            color: #0070a8;
            text-decoration: none;
            font-weight: 800;
          }

          .primary-link {
            display: inline-flex;
            margin-top: 20px;
            background: #062b67;
            color: white;
            min-height: 48px;
            padding: 0 28px;
            align-items: center;
            text-decoration: none;
            font-weight: 900;
          }
        `}</style>

        <div className="error-card">
          <Link href="/search" className="back-link">
            ← Back to Search
          </Link>

          <h1>Flight Not Found</h1>

          <p>
            The selected flight could not be found. Please return to the search
            page and choose again.
          </p>

          <Link href="/search" className="primary-link">
            Search Flights
          </Link>
        </div>
      </main>
    );
  }

  const outboundFrom = getAirport(outboundFlight.origin);
  const outboundTo = getAirport(outboundFlight.destination);
  const returnFrom = returnFlight ? getAirport(returnFlight.origin) : null;
  const returnTo = returnFlight ? getAirport(returnFlight.destination) : null;

  const passengerUrl =
    `/passenger?tripType=${tripType}` +
    `&flightNumber=${outboundFlight.flightNumber}` +
    `${returnFlight ? `&returnFlightNumber=${returnFlight.flightNumber}` : ""}` +
    `&passengers=${passengerCount}` +
    `&isChangingFlight=${encodeURIComponent(isChangingFlight)}` +
    `&bookingReference=${encodeURIComponent(bookingReference)}` +
    `&familyName=${encodeURIComponent(familyName)}`;

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
          min-height: 40px;
          display: flex;
          align-items: center;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .simple-flight-summary {
          background: #f3f6fb;
          color: #071733;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 320px;
          border-bottom: 1px solid #cbd5e1;
        }

        .simple-flight-box,
        .simple-fare-box {
          min-height: 100px;
          padding: 18px 28px;
          border-right: 1px solid #cbd5e1;
        }

        .simple-label,
        .simple-fare-label {
          margin: 0 0 8px;
          font-size: 12px;
          color: #334155;
        }

        .simple-date {
          margin: 0 0 6px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .simple-route {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 64px minmax(0, 1fr);
          align-items: center;
          gap: 18px;
        }

        .simple-airport-code {
          font-size: 22px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #062b67;
          white-space: nowrap;
        }

        .simple-airport-name {
          margin-top: 4px;
          font-size: 12px;
          font-weight: 700;
        }

        .simple-plane {
          text-align: center;
          font-size: 22px;
          color: #062b67;
        }

        .simple-duration {
          margin-top: 4px;
          text-align: center;
          font-size: 11px;
          color: #475569;
          white-space: nowrap;
        }

        .simple-passenger {
          margin: 0;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .simple-price {
          margin: 8px 0 4px;
          font-size: 24px;
          font-weight: 500;
          color: #062b67;
        }

        .simple-note {
          margin: 0;
          font-size: 11px;
          font-style: italic;
          color: #334155;
          line-height: 1.45;
        }

        .content {
          max-width: 1260px;
          margin: 0 auto;
          padding: 42px 28px 80px;
        }

        .back {
          display: inline-block;
          margin-bottom: 30px;
          color: #0070a8;
          font-weight: 900;
          text-decoration: none;
        }

        .page-title {
          margin: 0 0 16px;
          font-size: 34px;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: #071733;
        }

        .page-subtitle {
          margin: 0 0 34px;
          color: #334155;
          font-size: 15px;
          line-height: 1.6;
        }

        .review-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          border: 1px solid #d7dde8;
          background: white;
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }

        .review-main {
          padding: 30px 34px;
          border-right: 1px solid #d7dde8;
        }

        .review-side {
          min-width: 0;
          background: white;
        }

        .side-heading {
          margin: 0;
          background: #004225;
          color: white;
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .side-content {
          padding: 26px;
        }

        .side-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 22px;
          padding: 14px 0;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
          color: #334155;
        }

        .side-row strong {
          color: #071733;
          text-align: right;
          word-break: break-word;
        }

        .side-total {
          margin: 30px 0 10px;
          font-size: 28px;
          font-weight: 900;
          color: #071733;
          letter-spacing: 0.08em;
        }

        .side-note {
          margin: 0 0 24px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }

        .continue-button {
          width: 100%;
          min-height: 50px;
          border: none;
          background: #062b67;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
          margin-bottom: 28px;
        }

        .review-title {
          margin: 0;
          font-size: 20px;
          font-weight: 900;
        }

        .available {
          color: #087f23;
          font-weight: 900;
          font-size: 14px;
        }

        .flight-section {
          padding: 24px 0;
          border-top: 1px solid #e2e8f0;
        }

        .flight-label {
          margin: 0 0 18px;
          color: #062b67;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .flight-title {
          margin: 0 0 26px;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .route-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 120px minmax(0, 1fr) 180px;
          gap: 24px;
          align-items: center;
        }

        .route-code {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #062b67;
          white-space: nowrap;
        }

        .route-date {
          margin-top: 8px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .route-airport {
          margin-top: 8px;
          color: #475569;
          font-size: 13px;
        }

        .route-middle {
          text-align: center;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }

        .airline {
          font-weight: 900;
          font-size: 14px;
        }

        .aircraft {
          margin-top: 8px;
          color: #64748b;
          font-size: 13px;
        }

        @media (max-width: 1100px) {
          .simple-flight-summary,
          .review-grid {
            grid-template-columns: 1fr;
          }

          .simple-flight-box,
          .simple-fare-box,
          .review-main {
            border-right: none;
          }

          .route-row {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .route-middle {
            text-align: left;
          }
        }

        @media (max-width: 700px) {
          .content {
            padding: 30px 18px 60px;
          }

          .summary-inner {
            padding: 0 18px;
          }

          .simple-flight-box,
          .simple-fare-box,
          .review-main,
          .side-content {
            padding: 22px;
          }

          .page-title {
            font-size: 28px;
          }

          .route-code {
            font-size: 22px;
            letter-spacing: 0.1em;
          }
        }
      `}</style>

      <main className="page">
        <Navbar />
        <BookingSteps currentStep="flights" />

        <section className="summary-banner">
          <div className="summary-inner">
            <div className="trip-title-row">
              {outboundFlight.origin} - {outboundFlight.destination}
              {returnFlight
                ? ` ⇄ ${returnFlight.origin} - ${returnFlight.destination}`
                : ""}{" "}
              · {passengerCount} {passengerCount === 1 ? "Adult" : "Adults"}
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
                {passengerCount} {passengerCount === 1 ? "Adult" : "Adults"}
              </p>

              <p className="simple-price">NZD {totalFare}</p>

              <p className="simple-note">
                Total fare includes selected flights and passenger fare.
              </p>
            </div>
          </div>
        </section>

        <section className="content">
          <Link href="/search" className="back">
            ← Back to Search
          </Link>

          <h2 className="page-title">Review Selected Flights</h2>

          <p className="page-subtitle">
            Please check your selected Dairy Flat Airways scheduled service
            {returnFlight ? "s" : ""} before continuing.
          </p>

          <div className="review-grid">
            <section className="review-main">
              <div className="status-row">
                <h3 className="review-title">
                  {outboundFrom.name} to {outboundTo.name}
                </h3>

                <span className="available">Available</span>
              </div>

              <FlightReview
                title="Depart"
                flight={outboundFlight}
                from={outboundFrom}
                to={outboundTo}
              />

              {returnFlight && returnFrom && returnTo && (
                <FlightReview
                  title="Return"
                  flight={returnFlight}
                  from={returnFrom}
                  to={returnTo}
                />
              )}
            </section>

            <aside className="review-side">
              <h3 className="side-heading">Luxury Cabin</h3>

              <div className="side-content">
                <div className="side-row">
                  <span>Aircraft</span>
                  <strong>{outboundFlight.aircraft}</strong>
                </div>

                <div className="side-row">
                  <span>Passengers</span>
                  <strong>
                    {passengerCount}{" "}
                    {passengerCount === 1 ? "Passenger" : "Passengers"}
                  </strong>
                </div>

                <div className="side-row">
                  <span>Flights selected</span>
                  <strong>{returnFlight ? "2" : "1"}</strong>
                </div>

                <div className="side-row">
                  <span>Departure fare</span>
                  <strong>NZD {outboundFlight.price}</strong>
                </div>

                {returnFlight && (
                  <div className="side-row">
                    <span>Return fare</span>
                    <strong>NZD {returnFlight.price}</strong>
                  </div>
                )}

                <div className="side-total">NZD {totalFare}</div>

                <p className="side-note">
                  Total fare is calculated based on the selected flight service
                  and number of passengers.
                </p>

                <Link href={passengerUrl} className="continue-button">
                  Continue
                </Link>
              </div>
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

function FlightReview({
  title,
  flight,
  from,
  to,
}: {
  title: string;
  flight: Flight;
  from: { name: string; airport: string };
  to: { name: string; airport: string };
}) {
  return (
    <article className="flight-section">
      <p className="flight-label">
        ✈ {title} · {formatDate(flight.departureDate)}
      </p>

      <h4 className="flight-title">
        {from.name} to {to.name} · {flight.flightNumber}
      </h4>

      <div className="route-row">
        <div>
          <div className="route-code">
            {flight.origin} {flight.departureTime}
          </div>

          <div className="route-date">{formatDate(flight.departureDate)}</div>

          <div className="route-airport">{from.airport}</div>
        </div>

        <div className="route-middle">
          <div>✈</div>
          <div>{flight.duration}</div>
        </div>

        <div>
          <div className="route-code">
            {flight.destination} {flight.arrivalTime}
          </div>

          <div className="route-date">{formatDate(flight.arrivalDate)}</div>

          <div className="route-airport">{to.airport}</div>
        </div>

        <div>
          <div className="airline">Dairy Flat Airways</div>
          <div className="aircraft">{flight.aircraft}</div>
        </div>
      </div>
    </article>
  );
}

export default function BookPage() {
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
          Loading selected flights...
        </main>
      }
    >
      <BookPageContent />
    </Suspense>
  );
}