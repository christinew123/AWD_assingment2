"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Airport = {
  code: string;
  name: string;
  airport: string;
};

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

const airports: Record<string, Airport> = {
  NZNE: { code: "NZNE", name: "Dairy Flat", airport: "Dairy Flat Airport" },
  YSSY: { code: "YSSY", name: "Sydney", airport: "Sydney Airport" },
  NZRO: { code: "NZRO", name: "Rotorua", airport: "Rotorua Airport" },
  NZGB: {
    code: "NZGB",
    name: "Great Barrier Island",
    airport: "Great Barrier Aerodrome",
  },
  NZCI: { code: "NZCI", name: "Chatham Islands", airport: "Tuuta Airport" },
  NZTL: { code: "NZTL", name: "Lake Tekapo", airport: "Lake Tekapo Airport" },
};

const validRoutes: Record<string, string[]> = {
  NZNE: ["YSSY", "NZRO", "NZGB", "NZCI", "NZTL"],
  YSSY: ["NZNE"],
  NZRO: ["NZNE"],
  NZGB: ["NZNE"],
  NZCI: ["NZNE"],
  NZTL: ["NZNE"],
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
      const outboundNumber = `${route.prefix}${String(day).padStart(2, "0")}A`;
      const returnNumber = `${route.prefix}${String(day).padStart(2, "0")}B`;

      generatedFlights.push({
        flightNumber: outboundNumber,
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
        flightNumber: returnNumber,
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

function formatDate(dateString: string) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  return date
    .toLocaleDateString("en-NZ", {
      day: "2-digit",
      month: "short",
      weekday: "short",
    })
    .toUpperCase();
}

function getAirport(code: string) {
  return airports[code] || { code, name: code, airport: code };
}

function getAirportLabel(code: string) {
  const airport = airports[code];
  return airport ? `${airport.name} (${airport.code})` : code;
}


function SearchPageContent() {
  const searchParams = useSearchParams();

  const initialOrigin = searchParams.get("orig") || "";
  const initialDestination = searchParams.get("dest") || "";
  const initialDate1 = searchParams.get("date1") || "";
  const initialDate2 = searchParams.get("date2") || "";
  const initialTripType =
    searchParams.get("tripType") === "oneway" ? "oneway" : "return";
  const passengers = searchParams.get("passengers") || "1";

  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [date1, setDate1] = useState(initialDate1);
  const [date2, setDate2] = useState(initialDate2);
  const [tripType, setTripType] = useState<"oneway" | "return">(
    initialTripType
  );

  const [selectedOutboundFlightNumber, setSelectedOutboundFlightNumber] =
    useState("");
  const [selectedReturnFlightNumber, setSelectedReturnFlightNumber] =
    useState("");

  const [bookedSeats, setBookedSeats] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadBookedSeats() {
      try {
        const response = await fetch("/api/flights/seats");

        if (!response.ok) {
          console.error("Seat API failed:", response.status);
          return;
        }

        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
          console.error("Seat API did not return JSON.");
          return;
        }

        const result = await response.json();

        if (result.success) {
          setBookedSeats(result.bookedSeats);
        }
      } catch (error) {
        console.error("Could not load booked seats:", error);
      }
    }

    loadBookedSeats();
  }, []);

  useEffect(() => {
    setSelectedOutboundFlightNumber("");
    setSelectedReturnFlightNumber("");
  }, [origin, destination, date1, date2, tripType]);

  const destinationOptions = useMemo(() => {
    if (!origin) return Object.keys(airports);
    return validRoutes[origin] || [];
  }, [origin]);

  const outboundFlights = useMemo(() => {
    if (!origin || !destination || !date1) return [];

    return flights.filter(
      (flight) =>
        flight.origin === origin &&
        flight.destination === destination &&
        flight.departureDate === date1
    );
  }, [origin, destination, date1]);

  const returnFlights = useMemo(() => {
    if (tripType === "oneway" || !origin || !destination || !date2) return [];

    return flights.filter(
      (flight) =>
        flight.origin === destination &&
        flight.destination === origin &&
        flight.departureDate === date2
    );
  }, [origin, destination, date2, tripType]);

  const filteredFlights = useMemo(() => {
    if (origin && destination && date1 && (tripType === "oneway" || date2)) {
      return tripType === "oneway"
        ? outboundFlights
        : [...outboundFlights, ...returnFlights];
    }

    return flights.filter((flight) => {
      const matchOrigin = !origin || flight.origin === origin;
      const matchDestination =
        !destination || flight.destination === destination;

      const matchDate =
        date1 && !date2
          ? flight.departureDate === date1
          : !date1 && date2
          ? flight.departureDate === date2
          : true;

      return matchOrigin && matchDestination && matchDate;
    });
  }, [
    origin,
    destination,
    date1,
    date2,
    tripType,
    outboundFlights,
    returnFlights,
  ]);

  function getSeatsLeft(flight: Flight) {
    const alreadyBooked = bookedSeats[flight.flightNumber] || 0;
    return Math.max(flight.seatsAvailable - alreadyBooked, 0);
  }

  const journeyTitle =
    origin && destination
      ? `${getAirport(origin).name} to ${getAirport(destination).name}`
      : "Available Dairy Flat Airways flights";

  function handleOriginChange(value: string) {
    setOrigin(value);

    const routes = validRoutes[value] || [];

    if (destination && !routes.includes(destination)) {
      setDestination("");
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
          padding-top: 68px;
          background: #f3f6fb;
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 5px 18px rgba(15, 23, 42, 0.08);
        }

        .navbar-inner {
          max-width: 1500px;
          min-height: 68px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 34px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          color: #062b67;
        }

        .brand-mark {
          position: relative;
          width: 34px;
          height: 40px;
          flex-shrink: 0;
        }

        .brand-line {
          position: absolute;
          height: 5px;
          background: #f0b323;
          border-radius: 999px;
          transform: rotate(58deg);
        }

        .brand-line-1 {
          left: 10px;
          top: 3px;
          width: 22px;
        }

        .brand-line-2 {
          left: 2px;
          top: 17px;
          width: 29px;
        }

        .brand-line-3 {
          left: 11px;
          top: 30px;
          width: 22px;
        }

        .brand-small {
          margin: 0;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #64748b;
          white-space: nowrap;
        }

        .brand-title {
          margin: 0;
          font-size: 18px;
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: 0.04em;
          color: #062b67;
          white-space: nowrap;
        }

        .main-nav {
          display: flex;
          gap: 25px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          white-space: nowrap;
        }

        .main-nav a {
          color: #062b67;
          text-decoration: none;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          color: #062b67;
          white-space: nowrap;
        }

        .login-button {
          border: 1px solid #062b67;
          border-radius: 999px;
          padding: 8px 19px;
          background: white;
          color: #062b67;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .steps {
          background: white;
          border-bottom: 1px solid #dbe3ef;
        }

        .steps-inner {
          max-width: 1500px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
        }

        .step {
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #062b67;
        }

        .step.active {
          background: #f3f6fb;
        }

        .step-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f5a000;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
        }

        .journey-bar {
          background: #062b67;
          color: white;
        }

        .journey-inner {
          max-width: 1500px;
          margin: 0 auto;
          padding: 14px 34px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: center;
        }

        .journey-summary {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .journey-city {
          font-size: 17px;
          font-weight: 700;
        }

        .journey-date {
          margin-top: 4px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .plane-icon {
          font-size: 22px;
        }

        .passenger-summary {
          text-align: right;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .content {
          max-width: 1320px;
          margin: 62px auto 0;
          padding: 0 34px 90px;
        }

        .search-panel {
          background: white;
          border-radius: 14px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.1);
          padding: 24px;
          margin-bottom: 28px;
        }

        .panel-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .label {
          font-size: 12px;
          font-weight: 900;
          color: #0f172a;
        }

        .input {
          height: 46px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0 14px;
          font-size: 14px;
          color: #111827;
          background: white;
        }

        .panel-actions {
          margin-top: 18px;
          display: flex;
          gap: 12px;
        }

        .primary-button,
        .secondary-button {
          height: 46px;
          border: none;
          border-radius: 8px;
          padding: 0 24px;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .primary-button {
          background: #0070a8;
          color: white;
        }

        .secondary-button {
          background: #e8eef5;
          color: #111827;
        }

        .section-title {
          margin: 0 0 18px;
          font-size: 26px;
          font-weight: 400;
          color: #062b67;
        }

        .flight-card {
          background: white;
          border: 1px solid #d6dde8;
          margin-bottom: 14px;
          display: grid;
          grid-template-columns: 1fr 250px;
          min-height: 130px;
        }

        .flight-main {
          padding: 18px 22px;
        }

        .flight-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }

        .flight-route-title {
          font-size: 15px;
          font-weight: 900;
          color: #0f172a;
        }

        .flight-status {
          color: #007a33;
          font-size: 12px;
          font-weight: 900;
        }

        .flight-status.full {
          color: #b91c1c;
        }

        .flight-detail {
          display: grid;
          grid-template-columns: 1fr 170px 1fr 0.8fr;
          align-items: center;
          gap: 16px;
        }

        .airport-code {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #001b4f;
        }

        .time-date {
          margin-top: 4px;
          font-size: 11px;
          font-weight: 800;
          color: #111827;
        }

        .airport-name {
          margin-top: 4px;
          font-size: 11px;
          color: #475569;
        }

        .timeline {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 11px;
          justify-content: center;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid #f5a000;
        }

        .dot.end {
          border-color: #062b67;
        }

        .line {
          flex: 1;
          border-top: 2px dotted #cbd5e1;
        }

        .airline {
          font-size: 12px;
          font-weight: 900;
          color: #0f172a;
        }

        .aircraft {
          margin-top: 6px;
          font-size: 11px;
          color: #64748b;
        }

        .fare-box {
          border-left: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }

        .fare-header {
          background: #00402a;
          color: white;
          text-align: center;
          padding: 12px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .fare-body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .price {
          font-size: 20px;
          font-weight: 900;
          color: #0f172a;
        }

        .seats {
          margin-top: 6px;
          font-size: 11px;
          color: #64748b;
        }

        .select-button {
          margin-top: 14px;
          width: 100%;
          height: 38px;
          border: none;
          background: #062b67;
          color: white;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .select-button.selected {
          background: #007a33;
        }

        .select-button.disabled {
          background: #cbd5e1;
          color: #64748b;
          cursor: not-allowed;
        }

        .confirm-selection-box {
          position: sticky;
          bottom: 0;
          z-index: 20;
          margin-top: 26px;
          padding: 18px 22px;
          background: white;
          border: 1px solid #d6dde8;
          box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .confirm-selection-box p {
          margin: 6px 0 0;
          color: #475569;
          font-size: 14px;
        }

        .confirm-selection-button {
          min-width: 240px;
          height: 46px;
          border: none;
          background: #062b67;
          color: white;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .confirm-selection-button.disabled {
          background: #cbd5e1;
          color: #64748b;
          cursor: not-allowed;
        }

        .no-results {
          background: white;
          border-radius: 14px;
          padding: 28px;
          color: #475569;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.1);
        }

        @media (max-width: 1000px) {
          .navbar-inner {
            padding: 0 22px;
          }

          .main-nav {
            gap: 16px;
          }

          .steps-inner,
          .journey-inner,
          .panel-grid,
          .flight-card,
          .flight-detail {
            grid-template-columns: 1fr;
          }

          .passenger-summary {
            text-align: left;
          }

          .fare-box {
            border-left: none;
            border-top: 1px solid #e5e7eb;
          }

          .confirm-selection-box {
            flex-direction: column;
            align-items: stretch;
          }

          .confirm-selection-button {
            width: 100%;
          }
        }

        @media (max-width: 700px) {
          .page {
            padding-top: 170px;
          }

          .navbar-inner {
            min-height: 170px;
            padding: 14px 18px;
            flex-direction: column;
            align-items: flex-start;
          }

          .navbar-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }

          .main-nav {
            flex-wrap: wrap;
            gap: 12px 18px;
          }

          .navbar-right {
            width: 100%;
            justify-content: space-between;
          }

          .steps {
            display: none;
          }

          .journey-inner,
          .content {
            padding-left: 18px;
            padding-right: 18px;
          }

          .section-title {
            font-size: 22px;
          }

          .flight-main {
            padding: 18px;
          }

          .panel-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <main className="page">
        <header className="navbar">
          <div className="navbar-inner">
            <div className="navbar-left">
              <Link href="/" className="brand">
                <div className="brand-mark">
                  <span className="brand-line brand-line-1" />
                  <span className="brand-line brand-line-2" />
                  <span className="brand-line brand-line-3" />
                </div>

                <div>
                  <p className="brand-small">Online Booking System</p>
                  <h1 className="brand-title">
                    Dairy Flat
                    <br />
                    Airways
                  </h1>
                </div>
              </Link>

              <nav className="main-nav">
                <Link href="/#book">Search</Link>
                <Link href="/#manage-booking">Manage Booking</Link>
              </nav>
            </div>

            <div className="navbar-right">
              <span>Singapore · English</span>
              <button className="login-button">Log In</button>
            </div>
          </div>
        </header>

        <section className="steps">
          <div className="steps-inner">
            <div className="step active">
              <span className="step-number">1</span>
              Flights
            </div>
            <div className="step">
              <span className="step-number">2</span>
              Passengers
            </div>
            <div className="step">
              <span className="step-number">3</span>
              Seats
            </div>
            <div className="step">
              <span className="step-number">4</span>
              Confirm
            </div>
            <div className="step">
              <span className="step-number">5</span>
              Invoice
            </div>
          </div>
        </section>

        <section className="journey-bar">
          <div className="journey-inner">
            <div className="journey-summary">
              <div>
                <div className="journey-date">Departing</div>
                <div className="journey-city">
                  {origin ? getAirport(origin).name : "Any origin"}
                </div>
                {date1 && <div className="journey-date">{formatDate(date1)}</div>}
              </div>

              <div className="plane-icon">✈</div>

              <div>
                <div className="journey-date">Destination</div>
                <div className="journey-city">
                  {destination
                    ? getAirport(destination).name
                    : "Any destination"}
                </div>
                {date2 && <div className="journey-date">{formatDate(date2)}</div>}
              </div>
            </div>

            <div className="passenger-summary">
              {origin || destination
                ? `${origin || "ANY"} - ${destination || "ANY"} · ${passengers} ${
                    passengers === "1" ? "Passenger" : "Passengers"
                  }`
                : `${passengers} ${
                    passengers === "1" ? "Passenger" : "Passengers"
                  }`}
            </div>
          </div>
        </section>

        <section className="content">
          <form className="search-panel">
            <div className="panel-grid">
              <div className="field">
                <label className="label">Origin</label>
                <select
                  className="input"
                  value={origin}
                  onChange={(event) => handleOriginChange(event.target.value)}
                >
                  <option value="">Any origin</option>
                  {Object.values(airports).map((airport) => (
                    <option key={airport.code} value={airport.code}>
                      {airport.name} ({airport.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Destination</label>
                <select
                  className="input"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                >
                  <option value="">Any destination</option>
                  {destinationOptions.map((airportCode) => (
                    <option key={airportCode} value={airportCode}>
                      {getAirportLabel(airportCode)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Trip type</label>
                <select
                  className="input"
                  value={tripType}
                  onChange={(event) => {
                    const selectedTripType = event.target.value as
                      | "oneway"
                      | "return";

                    setTripType(selectedTripType);

                    if (selectedTripType === "oneway") {
                      setDate2("");
                    }
                  }}
                >
                  <option value="oneway">One-way</option>
                  <option value="return">Return trip</option>
                </select>
              </div>

              <div className="field">
                <label className="label">From date</label>
                <input
                  type="date"
                  className="input"
                  value={date1}
                  onChange={(event) => setDate1(event.target.value)}
                  min="2026-06-01"
                  max="2026-06-30"
                />
              </div>

              {tripType === "return" && (
                <div className="field">
                  <label className="label">Return date</label>
                  <input
                    type="date"
                    className="input"
                    value={date2}
                    onChange={(event) => setDate2(event.target.value)}
                    min={date1 || "2026-06-01"}
                    max="2026-06-30"
                  />
                </div>
              )}
            </div>

            <div className="panel-actions">
              <button type="button" className="primary-button">
                Search Flights
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setOrigin("");
                  setDestination("");
                  setDate1("");
                  setDate2("");
                  setTripType("return");
                }}
              >
                Clear Search
              </button>
            </div>
          </form>

          <h2 className="section-title">{journeyTitle}</h2>

          {filteredFlights.length === 0 ? (
            <div className="no-results">
              No scheduled flights found for the selected search details. Try
              changing the route or choosing another June date.
            </div>
          ) : (
            filteredFlights.map((flight, index) => {
              const fromAirport = getAirport(flight.origin);
              const toAirport = getAirport(flight.destination);
              const seatsLeft = getSeatsLeft(flight);
              const available = seatsLeft > 0;

              const isDeparture =
                origin &&
                destination &&
                flight.origin === origin &&
                flight.destination === destination;

              const isReturn =
                origin &&
                destination &&
                flight.origin === destination &&
                flight.destination === origin;

              return (
                <article key={flight.flightNumber} className="flight-card">
                  <div className="flight-main">
                    <div className="flight-top">
                      <div className="flight-route-title">
                        {index + 1}. {fromAirport.name} to {toAirport.name} ·{" "}
                        {flight.flightNumber}
                      </div>

                      <div
                        className={
                          available ? "flight-status" : "flight-status full"
                        }
                      >
                        {available ? "Available" : "Full"}
                      </div>
                    </div>

                    <div className="flight-detail">
                      <div>
                        <div className="airport-code">
                          {flight.origin} {flight.departureTime}
                        </div>
                        <div className="time-date">
                          {formatDate(flight.departureDate)}
                        </div>
                        <div className="airport-name">{fromAirport.airport}</div>
                      </div>

                      <div className="timeline">
                        <span className="dot" />
                        <span className="line" />
                        <span>{flight.duration}</span>
                        <span className="line" />
                        <span className="dot end" />
                      </div>

                      <div>
                        <div className="airport-code">
                          {flight.destination} {flight.arrivalTime}
                        </div>
                        <div className="time-date">
                          {formatDate(flight.arrivalDate)}
                        </div>
                        <div className="airport-name">{toAirport.airport}</div>
                      </div>

                      <div>
                        <div className="airline">Dairy Flat Airways</div>
                        <div className="aircraft">{flight.aircraft}</div>
                      </div>
                    </div>
                  </div>

                  <div className="fare-box">
                    <div className="fare-header">Luxury Cabin</div>

                    <div className="fare-body">
                      <div className="price">NZD {flight.price}</div>

                      <div className="seats">
                        {available
                          ? `${seatsLeft} seats available`
                          : "Flight full"}
                      </div>

                      {available ? (
                        origin && destination && date1 && (tripType === "oneway" || date2) ? (
                          isDeparture ? (
                            <button
                              type="button"
                              className={
                                selectedOutboundFlightNumber ===
                                flight.flightNumber
                                  ? "select-button selected"
                                  : "select-button"
                              }
                              onClick={() =>
                                setSelectedOutboundFlightNumber(
                                  flight.flightNumber
                                )
                              }
                            >
                              {selectedOutboundFlightNumber ===
                              flight.flightNumber
                                ? "Selected"
                                : "Select Departure"}
                            </button>
                          ) : isReturn ? (
                            <button
                              type="button"
                              className={
                                selectedReturnFlightNumber ===
                                flight.flightNumber
                                  ? "select-button selected"
                                  : "select-button"
                              }
                              onClick={() =>
                                setSelectedReturnFlightNumber(
                                  flight.flightNumber
                                )
                              }
                            >
                              {selectedReturnFlightNumber === flight.flightNumber
                                ? "Selected"
                                : "Select Return"}
                            </button>
                          ) : null
                        ) : (
                          <Link
                            href={`/book?flightNumber=${flight.flightNumber}&passengers=${passengers}`}
                            className="select-button"
                          >
                            Select
                          </Link>
                        )
                      ) : (
                        <span className="select-button disabled">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {origin && destination && date1 && (tripType === "oneway" || date2) && (
            <div className="confirm-selection-box">
              <div>
                <strong>Selected flights</strong>
                <p>
                  Departure:{" "}
                  {selectedOutboundFlightNumber ||
                    "Please select a departure flight"}
                  {tripType === "return" && (
                    <>
                      {" "}· Return:{" "}
                      {selectedReturnFlightNumber ||
                        "Please select a return flight"}
                    </>
                  )}
                </p>
              </div>

              {selectedOutboundFlightNumber &&
              (tripType === "oneway" || selectedReturnFlightNumber) ? (
                <Link
                  href={
                    `/book?tripType=${tripType}&flightNumber=${selectedOutboundFlightNumber}` +
                    `${
                      tripType === "return"
                        ? `&returnFlightNumber=${selectedReturnFlightNumber}`
                        : ""
                    }` +
                    `&passengers=${passengers}`
                  }
                  className="confirm-selection-button"
                >
                  Review Selected Flights
                </Link>
              ) : (
                <button
                  type="button"
                  className="confirm-selection-button disabled"
                >
                  {tripType === "oneway"
                    ? "Select Departure Flight First"
                    : "Select Both Flights First"}
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}


export default function SearchPage() {
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
          Loading search page...
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
