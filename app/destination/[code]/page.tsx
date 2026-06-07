"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { FormEvent, use, useMemo, useState } from "react";

type DestinationInfo = {
  code: string;
  name: string;
  airportName: string;
  image: string;
  price: string;
  descriptionTitle: string;
  description: string[];
  attractions: string[];
  activities: string[];
  travelInfo: string[];
  highlights: string[];
};

const airports = [
  { code: "NZNE", name: "Dairy Flat" },
  { code: "YSSY", name: "Sydney" },
  { code: "NZRO", name: "Rotorua" },
  { code: "NZGB", name: "Great Barrier Island" },
  { code: "NZCI", name: "Chatham Islands" },
  { code: "NZTL", name: "Lake Tekapo" },
];

const validRoutes: Record<string, string[]> = {
  NZNE: ["YSSY", "NZRO", "NZGB", "NZCI", "NZTL"],
  YSSY: ["NZNE"],
  NZRO: ["NZNE"],
  NZGB: ["NZNE"],
  NZCI: ["NZNE"],
  NZTL: ["NZNE"],
};

const destinations: Record<string, DestinationInfo> = {
  YSSY: {
    code: "YSSY",
    name: "Sydney",
    airportName: "Sydney Airport",
    image: "/sydney.jpg",
    price: "From NZD 1,850",
    descriptionTitle: "Sydney: Australia’s harbour city",
    description: [
      "Sydney is one of Australia’s most recognisable cities, known for its harbour, coastal views, city attractions, and relaxed travel experience.",
      "Travellers can visit the Sydney Opera House, walk around Circular Quay, explore local food areas, or enjoy a short weekend trip from Dairy Flat Airport.",
      "Dairy Flat Airways offers a luxury point-to-point service between Dairy Flat and Sydney using the SyberJet SJ30i.",
    ],
    attractions: [
      "Sydney Opera House",
      "Sydney Harbour Bridge",
      "Circular Quay",
      "Darling Harbour",
    ],
    activities: [
      "Enjoy a harbour walk",
      "Visit waterfront restaurants",
      "Explore city shopping areas",
      "Take a short weekend break",
    ],
    travelInfo: [
      "Flights to Sydney are available from Dairy Flat Airport.",
      "The service is operated using the SyberJet SJ30i aircraft.",
      "The SyberJet SJ30i can carry up to 6 passengers.",
      "Passengers can choose travel dates and number of passengers before searching for flights.",
    ],
    highlights: [
      "Sydney Harbour",
      "Circular Quay",
      "Opera House",
      "Weekend travel",
    ],
  },

  NZRO: {
    code: "NZRO",
    name: "Rotorua",
    airportName: "Rotorua Airport",
    image: "/rotorua.jpg",
    price: "From NZD 320",
    descriptionTitle: "Rotorua: geothermal and cultural escape",
    description: [
      "Rotorua is known for geothermal landscapes, lakes, forests, and cultural attractions.",
      "It is suitable for short domestic travel, family trips, and passengers looking for a quick regional connection from Dairy Flat Airport.",
      "The route is part of Dairy Flat Airways’ regional scheduled service.",
    ],
    attractions: [
      "Geothermal parks",
      "Rotorua lakes",
      "Redwood forest",
      "Cultural attractions",
    ],
    activities: [
      "Explore geothermal scenery",
      "Visit lake viewpoints",
      "Enjoy a short domestic trip",
      "Take a nature walk",
    ],
    travelInfo: [
      "Flights to Rotorua are available from Dairy Flat Airport.",
      "This route is suitable for short domestic travel.",
      "Passengers can search scheduled flights by departure date.",
      "The SyberJet SJ30i can carry up to 6 passengers.",
    ],
    highlights: [
      "Geothermal parks",
      "Lakes",
      "Short domestic trip",
      "Regional service",
    ],
  },

  NZGB: {
    code: "NZGB",
    name: "Great Barrier Island",
    airportName: "Great Barrier Aerodrome",
    image: "/sydney-cover.jpg",
    price: "From NZD 450",
    descriptionTitle: "Great Barrier Island: quiet island getaway",
    description: [
      "Great Barrier Island is suitable for passengers looking for a peaceful island trip close to Auckland.",
      "The destination offers beaches, walking tracks, natural scenery, and a slower travel experience.",
      "Dairy Flat Airways connects passengers from Dairy Flat Airport to this regional destination.",
    ],
    attractions: [
      "Island beaches",
      "Walking tracks",
      "Natural scenery",
      "Quiet coastal areas",
    ],
    activities: [
      "Relax by the beach",
      "Go on nature walks",
      "Enjoy island views",
      "Take a short regional escape",
    ],
    travelInfo: [
      "Flights to Great Barrier Island are available from Dairy Flat Airport.",
      "This is a short regional destination.",
      "Passengers should check availability because small aircraft seats are limited.",
      "The SyberJet SJ30i can carry up to 6 passengers.",
    ],
    highlights: ["Island escape", "Beaches", "Nature walks", "Short flight"],
  },

  NZCI: {
    code: "NZCI",
    name: "Chatham Islands",
    airportName: "Tuuta Airport",
    image: "/chatham.jpg",
    price: "From NZD 980",
    descriptionTitle: "Chatham Islands: exclusive regional route",
    description: [
      "The Chatham Islands offer a remote and unique travel experience with coastal views, local history, and distinctive landscapes.",
      "This route is suited for passengers who want a more exclusive regional journey.",
      "Dairy Flat Airways provides a premium flight option using its luxury SyberJet SJ30i aircraft.",
    ],
    attractions: [
      "Remote coastal scenery",
      "Local history",
      "Island landscapes",
      "Exclusive regional travel",
    ],
    activities: [
      "Explore coastal areas",
      "Learn about local history",
      "Enjoy a premium regional route",
      "Experience a remote destination",
    ],
    travelInfo: [
      "Flights to the Chatham Islands are available from Dairy Flat Airport.",
      "This is an exclusive regional service.",
      "Passengers should book early due to limited seating.",
      "The SyberJet SJ30i can carry up to 6 passengers.",
    ],
    highlights: [
      "Remote destination",
      "Coastal scenery",
      "Exclusive route",
      "Luxury cabin",
    ],
  },

  NZTL: {
    code: "NZTL",
    name: "Lake Tekapo",
    airportName: "Lake Tekapo Airport",
    image: "/tekapo.jpg",
    price: "From NZD 620",
    descriptionTitle: "Lake Tekapo: scenic South Island travel",
    description: [
      "Lake Tekapo is known for its lake views, mountain scenery, and peaceful South Island atmosphere.",
      "It is suitable for passengers looking for a scenic holiday or relaxing regional escape.",
      "The Dairy Flat Airways service gives passengers a direct luxury travel option from Dairy Flat Airport.",
    ],
    attractions: [
      "Lake Tekapo views",
      "Mountain scenery",
      "Church of the Good Shepherd",
      "Peaceful South Island landscape",
    ],
    activities: [
      "Enjoy lake photography",
      "Visit scenic viewpoints",
      "Take a relaxing regional holiday",
      "Explore the South Island atmosphere",
    ],
    travelInfo: [
      "Flights to Lake Tekapo are available from Dairy Flat Airport.",
      "This route is suitable for leisure passengers.",
      "Passengers can search flights by available June 2026 dates.",
      "The SyberJet SJ30i can carry up to 6 passengers.",
    ],
    highlights: [
      "Lake views",
      "Mountain scenery",
      "Relaxing holiday",
      "Scenic route",
    ],
  },
};

function getAirportLabel(code: string) {
  const airport = airports.find((item) => item.code === code);
  return airport ? `${airport.name} (${airport.code})` : code;
}

function getValidOriginsForDestination(destinationCode: string) {
  return Object.keys(validRoutes).filter((originCode) =>
    validRoutes[originCode].includes(destinationCode)
  );
}

export default function DestinationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const destination = destinations[code];

  if (!destination) {
    notFound();
  }

  const validOrigins = getValidOriginsForDestination(destination.code);

  const [activeTab, setActiveTab] = useState<
    "overview" | "attractions" | "activities" | "travel"
  >("overview");

  const [origin, setOrigin] = useState(validOrigins[0] || "NZNE");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [tripType, setTripType] = useState<"oneway" | "return">("return");
  const [passengers, setPassengers] = useState("1");

  const originOptions = useMemo(() => {
    return validOrigins;
  }, [validOrigins]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!departureDate) {
      alert("Please select your departure date.");
      return;
    }

    if (tripType === "return" && !returnDate) {
      alert("Please select your return date.");
      return;
    }

    if (tripType === "return" && returnDate < departureDate) {
      alert("Return date cannot be earlier than departure date.");
      return;
    }

    const query = new URLSearchParams({
      tripType,
      orig: origin,
      dest: destination.code,
      date1: departureDate,
      date2: tripType === "return" ? returnDate : "",
      passengers,
    });

    window.location.href = `/search?${query.toString()}`;
  }

  function renderTabContent() {
    if (activeTab === "overview") {
      return (
        <>
          <h2 className="place-title">{destination.descriptionTitle}</h2>

          {destination.description.map((paragraph) => (
            <p key={paragraph} className="place-text">
              {paragraph}
            </p>
          ))}

          <div className="highlight-row">
            {destination.highlights.map((highlight) => (
              <div key={highlight} className="highlight-card">
                {highlight}
              </div>
            ))}
          </div>
        </>
      );
    }

    if (activeTab === "attractions") {
      return (
        <>
          <h2 className="place-title">Attractions in {destination.name}</h2>

          <p className="place-text">
            These are some attractions passengers may explore after arriving in{" "}
            {destination.name}.
          </p>

          <div className="list-grid">
            {destination.attractions.map((item) => (
              <div key={item} className="info-box">
                <span className="info-icon">▦</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (activeTab === "activities") {
      return (
        <>
          <h2 className="place-title">Activities in {destination.name}</h2>

          <p className="place-text">
            Passengers can enjoy different leisure activities depending on the
            destination selected.
          </p>

          <div className="list-grid">
            {destination.activities.map((item) => (
              <div key={item} className="info-box">
                <span className="info-icon">◎</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </>
      );
    }

    return (
      <>
        <h2 className="place-title">Travel information</h2>

        <p className="place-text">
          Useful travel details for passengers booking flights to{" "}
          {destination.name}.
        </p>

        <div className="list-grid">
          {destination.travelInfo.map((item) => (
            <div key={item} className="info-box">
              <span className="info-icon">✦</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </>
    );
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
          color: #071733;
          padding-top: 68px;
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
          color: #062b67;
          text-decoration: none;
          flex-shrink: 0;
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
          align-items: center;
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
          flex-shrink: 0;
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

        .hero {
          min-height: 350px;
          background-image:
            linear-gradient(90deg, rgba(0,0,0,0.72), rgba(0,0,0,0.36), rgba(0,0,0,0.08)),
            url('${destination.image}');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          color: white;
        }

        .hero-inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 38px;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 18px;
          color: white;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
        }

        .hero-title {
          margin: 0;
          font-size: clamp(32px, 4vw, 58px);
          font-weight: 400;
          letter-spacing: 0.02em;
        }

        .hero-subtitle {
          margin: 14px 0 0;
          font-size: 17px;
          font-weight: 700;
        }

        .booking-wrap {
          max-width: 1280px;
          margin: -60px auto 0;
          padding: 0 38px;
          position: relative;
          z-index: 2;
        }

        .booking-card {
          background: white;
          border-radius: 18px;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.22);
          overflow: hidden;
        }

        .booking-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #f1f5f9;
        }

        .booking-tab-active {
          background: white;
          color: #9d174d;
          padding: 18px 28px;
          font-size: 16px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .booking-tab {
          background: #f4f6fb;
          padding: 18px 28px;
          font-size: 16px;
          font-weight: 700;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .booking-body {
          padding: 28px 32px 30px;
        }

        .flight-form {
          display: grid;
          grid-template-columns: 1.1fr 1.1fr 0.9fr 0.9fr 0.9fr;
          border: 1px solid #d6dde8;
          border-radius: 10px;
          overflow: hidden;
          align-items: stretch;
        }

        .form-field {
          padding: 13px 18px;
          border-right: 1px solid #d6dde8;
          min-height: 72px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }

        .form-field:last-child {
          border-right: none;
        }

        .field-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 5px;
        }

        .field-input {
          border: none;
          outline: none;
          background: transparent;
          color: #111827;
          font-size: 16px;
          font-weight: 700;
          width: 100%;
          min-width: 0;
        }

        .fixed-field {
          color: #111827;
          font-size: 16px;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .search-row {
          margin-top: 26px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 22px;
          flex-wrap: wrap;
        }

        .price-text {
          color: #374151;
          font-size: 16px;
        }

        .search-button {
          background: #8b145d;
          color: white;
          border: none;
          border-radius: 999px;
          padding: 16px 42px;
          font-size: 16px;
          font-weight: 800;
          text-decoration: none;
          display: inline-block;
          cursor: pointer;
        }

        .content-wrap {
          max-width: 1280px;
          margin: 46px auto 0;
          padding: 0 38px 70px;
        }

        .place-card {
          background: white;
          border-radius: 18px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12);
          overflow: hidden;
        }

        .place-tabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-bottom: 1px solid #e2e8f0;
        }

        .place-tab-active,
        .place-tab {
          border: none;
          background: white;
          text-align: left;
          padding: 20px 26px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        .place-tab-active {
          color: #9d174d;
          border-bottom: 3px solid #9d174d;
        }

        .place-tab {
          color: #64748b;
        }

        .place-body {
          padding: 34px 40px 40px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 42px;
          align-items: start;
        }

        .place-title {
          margin: 0 0 22px;
          font-size: 30px;
          font-weight: 400;
          color: #1e293b;
        }

        .place-text {
          margin: 0 0 18px;
          font-size: 17px;
          line-height: 1.7;
          color: #334155;
        }

        .place-image {
          width: 100%;
          min-height: 330px;
          object-fit: cover;
          border-radius: 14px;
        }

        .highlight-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-top: 24px;
        }

        .highlight-card,
        .info-box {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
          background: #f8fafc;
          font-size: 14px;
          font-weight: 800;
          color: #062b67;
        }

        .highlight-card {
          text-align: center;
        }

        .list-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 22px;
        }

        .info-box {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #0f172a;
          font-size: 15px;
        }

        .info-icon {
          color: #9d174d;
          font-weight: 900;
        }

        @media (max-width: 1000px) {
          .flight-form {
            grid-template-columns: 1fr 1fr;
          }

          .form-field {
            border-bottom: 1px solid #d6dde8;
          }

          .place-body {
            grid-template-columns: 1fr;
          }

          .highlight-row,
          .list-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 760px) {
          .page {
            padding-top: 180px;
          }

          .navbar-inner {
            min-height: 180px;
            padding: 14px 18px;
            flex-direction: column;
            align-items: flex-start;
          }

          .navbar-left {
            flex-direction: column;
            align-items: flex-start;
          }

          .main-nav {
            flex-wrap: wrap;
            gap: 12px 18px;
          }

          .hero-inner,
          .booking-wrap,
          .content-wrap {
            padding-left: 18px;
            padding-right: 18px;
          }

          .booking-tabs,
          .place-tabs,
          .flight-form,
          .highlight-row,
          .list-grid {
            grid-template-columns: 1fr;
          }

          .search-row {
            justify-content: stretch;
          }

          .search-button {
            width: 100%;
            text-align: center;
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
                <Link href="/?tab=book">Search</Link>
                <Link href="/?tab=manage">Manage Booking</Link>
              </nav>
            </div>

            <div className="navbar-right">
              <span>Singapore · English</span>
              <button className="login-button">Log In</button>
            </div>
          </div>
        </header>

        <section className="hero">
          <div className="hero-inner">
            <Link href="/" className="back-link">
              ← Back to Home
            </Link>

            <h2 className="hero-title">Book flights to {destination.name}</h2>

            <p className="hero-subtitle">
              Fly to {destination.airportName}
            </p>
          </div>
        </section>

        <section className="booking-wrap">
          <div className="booking-card">
            <div className="booking-tabs">
              <div className="booking-tab-active">✈ Book a flight</div>
              <div className="booking-tab">✦ Dairy Flat luxury service</div>
            </div>

            <div className="booking-body">
              <form onSubmit={handleSearch}>
                <div className="flight-form">
                  <div className="form-field">
                    <label className="field-label">From</label>

                    <select
                      className="field-input"
                      value={origin}
                      onChange={(event) => setOrigin(event.target.value)}
                    >
                      {originOptions.map((originCode) => (
                        <option key={originCode} value={originCode}>
                          {getAirportLabel(originCode)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="field-label">To</label>
                    <div className="fixed-field">
                      {destination.name} ({destination.code})
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="field-label">Trip Type</label>

                    <select
                      className="field-input"
                      value={tripType}
                      onChange={(event) => {
                        const selectedTripType = event.target.value as
                          | "oneway"
                          | "return";

                        setTripType(selectedTripType);

                        if (selectedTripType === "oneway") {
                          setReturnDate("");
                        }
                      }}
                    >
                      <option value="oneway">One-way</option>
                      <option value="return">Return trip</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="field-label">Departure</label>

                    <input
                      type="date"
                      className="field-input"
                      value={departureDate}
                      onChange={(event) =>
                        setDepartureDate(event.target.value)
                      }
                      min="2026-06-01"
                      max="2026-06-30"
                    />
                  </div>

                  {tripType === "return" && (
                    <div className="form-field">
                      <label className="field-label">Return</label>

                      <input
                        type="date"
                        className="field-input"
                        value={returnDate}
                        onChange={(event) => setReturnDate(event.target.value)}
                        min={departureDate || "2026-06-01"}
                        max="2026-06-30"
                      />
                    </div>
                  )}

                  <div className="form-field">
                    <label className="field-label">Passengers</label>

                    <select
                      className="field-input"
                      value={passengers}
                      onChange={(event) => setPassengers(event.target.value)}
                    >
                      <option value="1">1 Passenger</option>
                      <option value="2">2 Passengers</option>
                      <option value="3">3 Passengers</option>
                      <option value="4">4 Passengers</option>
                      <option value="5">5 Passengers</option>
                      <option value="6">6 Passengers</option>
                    </select>
                  </div>
                </div>

                <div className="search-row">
                  <div className="price-text">{destination.price}</div>

                  <button type="submit" className="search-button">
                    Search flights
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="content-wrap">
          <div className="place-card">
            <div className="place-tabs">
              <button
                type="button"
                className={
                  activeTab === "overview" ? "place-tab-active" : "place-tab"
                }
                onClick={() => setActiveTab("overview")}
              >
                ✈ Overview
              </button>

              <button
                type="button"
                className={
                  activeTab === "attractions" ? "place-tab-active" : "place-tab"
                }
                onClick={() => setActiveTab("attractions")}
              >
                ▦ Attractions
              </button>

              <button
                type="button"
                className={
                  activeTab === "activities" ? "place-tab-active" : "place-tab"
                }
                onClick={() => setActiveTab("activities")}
              >
                ◎ Activities
              </button>

              <button
                type="button"
                className={
                  activeTab === "travel" ? "place-tab-active" : "place-tab"
                }
                onClick={() => setActiveTab("travel")}
              >
                ☕ Travel Info
              </button>
            </div>

            <div className="place-body">
              <div>{renderTabContent()}</div>

              <img
                src={destination.image}
                alt={destination.name}
                className="place-image"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}