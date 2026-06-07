"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

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

const destinations = [
  {
    name: "Sydney",
    code: "YSSY",
    subtitle: "Prestige weekend service",
    price: "From NZD 1,850",
    image: "/sydney.jpg",
  },
  {
    name: "Rotorua",
    code: "NZRO",
    subtitle: "Weekday shuttle flights",
    price: "From NZD 320",
    image: "/rotorua.jpg",
  },
  {
    name: "Chatham Islands",
    code: "NZCI",
    subtitle: "Exclusive regional route",
    price: "From NZD 980",
    image: "/chatham.jpg",
  },
  {
    name: "Lake Tekapo",
    code: "NZTL",
    subtitle: "Scenic South Island travel",
    price: "From NZD 620",
    image: "/tekapo.jpg",
  },
];

function getAirportLabel(code: string) {
  const airport = airports.find((item) => item.code === code);
  return airport ? `${airport.name} (${airport.code})` : code;
}

const juneDateOptions = Array.from({ length: 30 }, (_, index) => {
  const day = String(index + 1).padStart(2, "0");

  return {
    value: `2026-06-${day}`,
    label: `${day}/06/2026`,
  };
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<"book" | "manage">("book");

  const [origin, setOrigin] = useState("NZNE");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [latestDate, setLatestDate] = useState("");
  const [tripType, setTripType] = useState<"oneway" | "return">("return");

  const [showPassengerBox, setShowPassengerBox] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const [manageReference, setManageReference] = useState("");
  const [manageFamilyName, setManageFamilyName] = useState("");
  const [manageMessage, setManageMessage] = useState("");
  const [isManageLoading, setIsManageLoading] = useState(false);

  const totalPassengers = adults + children + infants;

  const destinationOptions = useMemo(() => {
    return validRoutes[origin] || [];
  }, [origin]);

  function scrollToBooking(tab: "book" | "manage") {
    setActiveTab(tab);

    setTimeout(() => {
      const bookingSection = document.getElementById("book");

      if (!bookingSection) {
        return;
      }

      const targetPosition =
        bookingSection.getBoundingClientRect().top +
        window.scrollY -
        window.innerHeight * 0.22;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }, 50);
  }

  function handleOriginChange(value: string) {
    setOrigin(value);
    setDestination("");
  }

  function handleBookingSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!destination) {
      alert("Please choose a destination.");
      return;
    }

    if (!departDate) {
      alert("Please select your departure date.");
      return;
    }

    if (tripType === "return" && !latestDate) {
      alert("Please select your return date.");
      return;
    }

    if (tripType === "return" && latestDate < departDate) {
      alert("Return date cannot be earlier than departure date.");
      return;
    }

    const query = new URLSearchParams({
      tripType,
      orig: origin,
      dest: destination,
      date1: departDate,
      date2: tripType === "return" ? latestDate : "",
      passengers: String(totalPassengers),
      adults: String(adults),
      children: String(children),
      infants: String(infants),
    });

    window.location.href = `/search?${query.toString()}`;
  }

  function decreaseAdults() {
    if (adults > 1) {
      setAdults(adults - 1);
    }
  }

  function increaseAdults() {
    if (totalPassengers < 6) {
      setAdults(adults + 1);
    }
  }

  function decreaseChildren() {
    if (children > 0) {
      setChildren(children - 1);
    }
  }

  function increaseChildren() {
    if (totalPassengers < 6) {
      setChildren(children + 1);
    }
  }

  function decreaseInfants() {
    if (infants > 0) {
      setInfants(infants - 1);
    }
  }

  function increaseInfants() {
    if (totalPassengers < 6) {
      setInfants(infants + 1);
    }
  }

  async function handleManageBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const reference = manageReference.trim();
    const familyName = manageFamilyName.trim();

    setManageMessage("");

    if (!reference || !familyName) {
      setManageMessage(
        "Please enter both booking reference and last / family name."
      );
      return;
    }

    setIsManageLoading(true);

    try {
      const response = await fetch(
        `/api/bookings/manage?bookingReference=${encodeURIComponent(
          reference
        )}&familyName=${encodeURIComponent(familyName)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setManageMessage(data.error || "Booking details do not match.");
        return;
      }

      window.location.href = `/cancel?bookingReference=${encodeURIComponent(
        reference
      )}&familyName=${encodeURIComponent(familyName)}`;
    } catch {
      setManageMessage("Unable to check booking details. Please try again.");
    } finally {
      setIsManageLoading(false);
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
          overflow-x: hidden;
        }

        body {
          background: #f3f6fb;
          color: #071733;
        }

        .page {
          min-height: 100vh;
          background: #f3f6fb;
          color: #071733;
          overflow-x: hidden;
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
          min-width: 0;
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

        .nav-button {
          border: none;
          background: transparent;
          padding: 0;
          margin: 0;
          color: #062b67;
          cursor: pointer;
          font: inherit;
          text-transform: uppercase;
          letter-spacing: inherit;
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
          min-height: 430px;
          background-image:
            linear-gradient(90deg, rgba(0,0,0,0.78), rgba(0,0,0,0.42), rgba(0,0,0,0.12)),
            url('/sydney-cover.jpg');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          color: white;
          display: flex;
          align-items: center;
        }

        .hero-inner {
          width: 100%;
          max-width: 1360px;
          margin: 0 auto;
          padding: 0 42px;
        }

        .hero-content {
          max-width: 590px;
        }

        .hero-kicker {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #f0b323;
          margin: 0 0 12px;
        }

        .hero-title {
          font-size: clamp(34px, 3vw, 50px);
          line-height: 1.04;
          font-weight: 500;
          margin: 0;
        }

        .hero-text {
          margin-top: 16px;
          font-size: 14px;
          line-height: 1.55;
          max-width: 590px;
          color: rgba(255,255,255,0.92);
        }

        .hero-actions {
          margin-top: 22px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .outline-button {
          border: 1px solid white;
          padding: 11px 23px;
          color: white;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 900;
          font-size: 10px;
          background: transparent;
          cursor: pointer;
        }

        .gold-button {
          background: #f0b323;
          border: none;
          padding: 11px 23px;
          color: #111827;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 900;
          font-size: 10px;
          cursor: pointer;
        }

        .booking-section {
          margin-top: 34px;
          position: relative;
          z-index: 10;
        }

        .content-wrap {
          margin: 0 auto;
          max-width: 1280px;
          padding: 0 38px;
        }

        .booking-card {
          background: white;
          border-radius: 20px;
          overflow: visible;
          box-shadow: 0 14px 36px rgba(15,23,42,0.14);
          max-width: 1120px;
          margin: 0 auto;
        }

        .tabs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          background: black;
          color: white;
          border-radius: 20px 20px 0 0;
          overflow: hidden;
        }

        .active-tab {
          background: white;
          color: #062b67;
          padding: 13px 12px;
          text-align: center;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 10px;
        }

        .tab-link {
          padding: 13px 12px;
          text-align: center;
          color: white;
          text-decoration: none;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 10px;
          background: black;
        }

        .tab-button {
          border: none;
          cursor: pointer;
          font-family: inherit;
        }

        .booking-body {
          padding: 24px 30px 30px;
          position: relative;
          overflow: visible;
        }

        .booking-title {
          font-size: clamp(24px, 2vw, 34px);
          font-weight: 500;
          color: #163a78;
          margin: 0;
        }

        .booking-subtitle {
          margin-top: 7px;
          font-size: 14px;
          color: #475569;
        }

        .booking-form {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          align-items: stretch;
        }

        .field-box {
          border: 1px solid #cbd5e1;
          border-radius: 13px;
          padding: 11px 14px;
          background: white;
          min-width: 0;
          position: relative;
          min-height: 68px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: visible;
        }

        .field-label {
          display: block;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #64748b;
        }

        .field-input {
          margin-top: 7px;
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .search-button {
          background: #062b67;
          color: white;
          border: none;
          border-radius: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 11px;
          cursor: pointer;
          min-height: 68px;
        }

        .passenger-row-wrap {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: 1.35fr 1.1fr 0.8fr;
          gap: 14px;
          align-items: stretch;
        }

        .passenger-field {
          min-height: 68px;
          position: relative;
          z-index: 80;
        }

        .passenger-trigger {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          text-align: left;
          margin-top: 7px;
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .passenger-panel {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          width: 360px;
          background: white;
          border: 1px solid #dbe3ef;
          border-radius: 16px;
          box-shadow: 0 22px 52px rgba(15, 23, 42, 0.22);
          padding: 20px;
          z-index: 999;
        }

        .passenger-panel-title {
          margin: 0;
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
        }

        .passenger-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 15px 0;
        }

        .passenger-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 15px;
        }

        .passenger-type {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .passenger-age {
          margin-top: 3px;
          font-size: 12px;
          color: #64748b;
        }

        .passenger-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .count-button {
          width: 36px;
          height: 36px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: white;
          font-size: 20px;
          color: #334155;
          cursor: pointer;
        }

        .count-button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .count-number {
          min-width: 20px;
          text-align: center;
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
        }

        .passenger-done {
          margin-top: 16px;
          width: 100%;
          border: none;
          border-radius: 12px;
          background: #062b67;
          color: white;
          padding: 11px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          cursor: pointer;
        }

        .passenger-summary-box {
          border: 1px dashed #cbd5e1;
          border-radius: 13px;
          padding: 11px 14px;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 68px;
        }

        .passenger-summary-title {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #64748b;
        }

        .passenger-summary-value {
          margin-top: 5px;
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }

        .manage-form {
          margin-top: 20px;
        }

        .manage-divider {
          margin: 20px 0 18px;
          border: none;
          border-top: 1px solid #d6dde8;
        }

        .manage-radio-row {
          display: flex;
          align-items: center;
          gap: 32px;
          margin-bottom: 16px;
        }

        .manage-radio-option {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #0f172a;
        }

        .manage-radio-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid #cbd5e1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .manage-radio-dot.active::after {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f5a000;
        }

        .manage-input-row {
          display: grid;
          grid-template-columns: 1fr 1fr 0.65fr;
          gap: 14px;
        }

        .manage-input {
          width: 100%;
          min-height: 52px;
          border: 1px solid #cfd7e3;
          border-radius: 0;
          padding: 0 16px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
        }

        .manage-button {
          border: none;
          background: #062b67;
          color: white;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .manage-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .manage-message {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 8px;
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          font-size: 13px;
          font-weight: 700;
        }

        .section {
          max-width: 1280px;
          margin: 48px auto 0;
          padding: 0 38px;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .gold-bar {
          width: 4px;
          height: 28px;
          background: #f0b323;
        }

        .section-title {
          margin: 0;
          font-size: clamp(24px, 2.2vw, 34px);
          font-weight: 500;
          color: #163a78;
        }

        .destination-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
        }

        .destination-card {
          position: relative;
          min-height: 220px;
          border-radius: 18px;
          overflow: hidden;
          text-decoration: none;
          color: white;
          display: flex;
          align-items: flex-end;
          padding: 20px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
        }

        .destination-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.05) 0%,
            rgba(0, 0, 0, 0.28) 40%,
            rgba(0, 0, 0, 0.76) 100%
          );
        }

        .destination-content {
          position: relative;
          z-index: 1;
        }

        .destination-subtitle {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.9);
        }

        .destination-title {
          margin: 8px 0 0;
          font-size: 22px;
          line-height: 1.12;
          font-weight: 800;
          color: white;
        }

        .destination-price {
          margin-top: 10px;
          font-size: 13px;
          font-weight: 900;
          color: #ffe29a;
        }

        .info-section {
          max-width: 1280px;
          margin: 46px auto 0;
          padding: 0 38px 60px;
        }

        .info-card {
          background: white;
          border-radius: 8px;
          padding: 26px 34px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1);
        }

        .info-title {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          color: #1e293b;
        }

        .info-underline {
          width: 76px;
          height: 4px;
          background: #d62828;
          margin: 14px 0 20px;
        }

        .info-subtitle {
          margin: 0 0 9px;
          font-size: 16px;
          font-weight: 800;
          color: #1e293b;
        }

        .info-text {
          margin: 0 0 18px;
          font-size: 14px;
          line-height: 1.65;
          color: #334155;
        }

        @media (max-width: 900px) {
          .booking-form {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .passenger-row-wrap,
          .manage-input-row {
            grid-template-columns: 1fr;
          }

          .destination-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .page {
            padding-top: 190px;
          }

          .navbar-inner {
            min-height: 190px;
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

          .navbar-right {
            width: 100%;
            justify-content: space-between;
          }

          .hero {
            min-height: 420px;
          }

          .hero-inner,
          .content-wrap,
          .section,
          .info-section {
            padding-left: 18px;
            padding-right: 18px;
          }

          .tabs,
          .booking-form,
          .destination-grid {
            grid-template-columns: 1fr;
          }

          .booking-body {
            padding: 22px;
          }

          .booking-title {
            font-size: 28px;
          }

          .passenger-panel {
            width: 100%;
          }

          .manage-radio-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .destination-card {
            min-height: 260px;
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
                <button
                  type="button"
                  className="nav-button"
                  onClick={() => scrollToBooking("book")}
                >
                  Search
                </button>

                <button
                  type="button"
                  className="nav-button"
                  onClick={() => scrollToBooking("manage")}
                >
                  Manage Booking
                </button>
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
            <div className="hero-content">
              <p className="hero-kicker">Premium Regional Travel</p>

              <h2 className="hero-title">
                Expand Your Comfort Zone,
                <br />
                Expand Your Horizons.
              </h2>

              <p className="hero-text">
                Book elegant point-to-point travel from Dairy Flat Airport to
                Sydney, Rotorua, Great Barrier Island, the Chatham Islands, and
                Lake Tekapo.
              </p>

              <div className="hero-actions">
                <button
                  type="button"
                  className="gold-button"
                  onClick={() => scrollToBooking("book")}
                >
                  Search Flights
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="book" className="booking-section">
          <div className="content-wrap">
            <div className="booking-card">
              <div className="tabs">
                <button
                  type="button"
                  className={
                    activeTab === "book"
                      ? "active-tab tab-button"
                      : "tab-link tab-button"
                  }
                  onClick={() => setActiveTab("book")}
                >
                  Book Trip
                </button>

                <button
                  type="button"
                  className={
                    activeTab === "manage"
                      ? "active-tab tab-button"
                      : "tab-link tab-button"
                  }
                  onClick={() => setActiveTab("manage")}
                >
                  Manage Booking
                </button>
              </div>

              <div className="booking-body">
                {activeTab === "book" ? (
                  <>
                    <h3 className="booking-title">
                      Hi, where would you like to go?
                    </h3>

                    <p className="booking-subtitle">
                      Search point-to-point services using valid Dairy Flat
                      Airways routes only.
                    </p>

                    <form action="/search" onSubmit={handleBookingSearch} className="booking-form">
                      <div className="field-box">
                        <label className="field-label">From</label>
                        <select
                          name="orig"
                          value={origin}
                          onChange={(event) =>
                            handleOriginChange(event.target.value)
                          }
                          className="field-input"
                        >
                          {airports.map((airport) => (
                            <option key={airport.code} value={airport.code}>
                              {airport.name} ({airport.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="field-box">
                        <label className="field-label">To</label>
                        <select
                          name="dest"
                          value={destination}
                          onChange={(event) =>
                            setDestination(event.target.value)
                          }
                          className="field-input"
                        >
                          <option value="">Choose destination</option>
                          {destinationOptions.map((airportCode) => (
                            <option key={airportCode} value={airportCode}>
                              {getAirportLabel(airportCode)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="field-box">
                        <label className="field-label">Trip Type</label>
                        <select
                          name="tripType"
                          value={tripType}
                          onChange={(event) => {
                            const selectedTripType = event.target.value as
                              | "oneway"
                              | "return";

                            setTripType(selectedTripType);

                            if (selectedTripType === "oneway") {
                              setLatestDate("");
                            }
                          }}
                          className="field-input"
                        >
                          <option value="oneway">One-way</option>
                          <option value="return">Return trip</option>
                        </select>
                      </div>

                      <div className="field-box">
                        <label className="field-label">Depart Date</label>
                        <input
                          type="date"
                          name="date1"
                          value={departDate}
                          onChange={(event) =>
                            setDepartDate(event.target.value)
                          }
                          min="2026-06-01"
                          max="2026-06-30"
                          className="field-input"
                        />
                      </div>

                      {tripType === "return" && (
                        <div className="field-box">
                          <label className="field-label">Return Date</label>
                          <input
                            type="date"
                            name="date2"
                            value={latestDate}
                            onChange={(event) =>
                              setLatestDate(event.target.value)
                            }
                            min={departDate || "2026-06-01"}
                            max="2026-06-30"
                            className="field-input"
                          />
                        </div>
                      )}

                      <div className="passenger-row-wrap">
                        <div className="field-box passenger-field">
                          <label className="field-label">
                            Passengers / Class
                          </label>

                          <button
                            type="button"
                            className="passenger-trigger"
                            onClick={() =>
                              setShowPassengerBox((previous) => !previous)
                            }
                          >
                            <span>
                              {totalPassengers}{" "}
                              {totalPassengers === 1
                                ? "Passenger"
                                : "Passengers"}{" "}
                              Luxury Cabin
                            </span>
                            <span>⌄</span>
                          </button>

                          {showPassengerBox && (
                            <div className="passenger-panel">
                              <h4 className="passenger-panel-title">
                                Passengers
                              </h4>

                              <div className="passenger-divider" />

                              <div className="passenger-row">
                                <div>
                                  <div className="passenger-type">Adults</div>
                                  <div className="passenger-age">12+ years</div>
                                </div>

                                <div className="passenger-controls">
                                  <button
                                    type="button"
                                    className="count-button"
                                    onClick={decreaseAdults}
                                    disabled={adults <= 1}
                                  >
                                    −
                                  </button>

                                  <span className="count-number">{adults}</span>

                                  <button
                                    type="button"
                                    className="count-button"
                                    onClick={increaseAdults}
                                    disabled={totalPassengers >= 6}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="passenger-row">
                                <div>
                                  <div className="passenger-type">Child</div>
                                  <div className="passenger-age">2-11 years</div>
                                </div>

                                <div className="passenger-controls">
                                  <button
                                    type="button"
                                    className="count-button"
                                    onClick={decreaseChildren}
                                    disabled={children <= 0}
                                  >
                                    −
                                  </button>

                                  <span className="count-number">
                                    {children}
                                  </span>

                                  <button
                                    type="button"
                                    className="count-button"
                                    onClick={increaseChildren}
                                    disabled={totalPassengers >= 6}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="passenger-row">
                                <div>
                                  <div className="passenger-type">Infant</div>
                                  <div className="passenger-age">
                                    Under 2 years
                                  </div>
                                </div>

                                <div className="passenger-controls">
                                  <button
                                    type="button"
                                    className="count-button"
                                    onClick={decreaseInfants}
                                    disabled={infants <= 0}
                                  >
                                    −
                                  </button>

                                  <span className="count-number">
                                    {infants}
                                  </span>

                                  <button
                                    type="button"
                                    className="count-button"
                                    onClick={increaseInfants}
                                    disabled={totalPassengers >= 6}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <button
                                type="button"
                                className="passenger-done"
                                onClick={() => setShowPassengerBox(false)}
                              >
                                Done
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="passenger-summary-box">
                          <div>
                            <div className="passenger-summary-title">
                              Current Selection
                            </div>

                            <div className="passenger-summary-value">
                              {adults} Adult{adults !== 1 ? "s" : ""}
                              {children > 0 &&
                                ` · ${children} Child${
                                  children !== 1 ? "ren" : ""
                                }`}
                              {infants > 0 &&
                                ` · ${infants} Infant${
                                  infants !== 1 ? "s" : ""
                                }`}
                            </div>
                          </div>
                        </div>

                        <button type="submit" className="search-button">
                          Search
                        </button>
                      </div>

                      <input
                        type="hidden"
                        name="passengers"
                        value={totalPassengers}
                      />
                      <input type="hidden" name="adults" value={adults} />
                      <input type="hidden" name="children" value={children} />
                      <input type="hidden" name="infants" value={infants} />
                    </form>
                  </>
                ) : (
                  <>
                    <h3 className="booking-title">
                      Enter your booking details to manage your itinerary
                    </h3>

                    <p className="booking-subtitle">
                      Use your booking reference and last / family name to
                      continue to the booking management page.
                    </p>

                    <form
                      onSubmit={handleManageBooking}
                      className="manage-form"
                    >
                      <hr className="manage-divider" />

                      <div className="manage-radio-row">
                        <div className="manage-radio-option">
                          <span className="manage-radio-dot active" />
                          <span>Booking reference</span>
                        </div>
                      </div>

                      <div className="manage-input-row">
                        <input
                          className="manage-input"
                          type="text"
                          value={manageReference}
                          onChange={(event) =>
                            setManageReference(event.target.value)
                          }
                          placeholder="Booking reference (e.g. DFA-241808)"
                        />

                        <input
                          className="manage-input"
                          type="text"
                          value={manageFamilyName}
                          onChange={(event) =>
                            setManageFamilyName(event.target.value)
                          }
                          placeholder="Last / Family name (As in passport)"
                        />

                        <button
                          className="manage-button"
                          type="submit"
                          disabled={isManageLoading}
                        >
                          {isManageLoading ? "Checking..." : "Manage Booking"}
                        </button>
                      </div>

                      {manageMessage && (
                        <div className="manage-message">{manageMessage}</div>
                      )}
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="destinations" className="section">
          <div className="section-title-row">
            <div className="gold-bar" />
            <h3 className="section-title">Trending with Dairy Flat Airways</h3>
          </div>

          <div className="destination-grid">
            {destinations.map((destination) => (
              <Link
                key={destination.code}
                href={`/destination/${destination.code}`}
                className="destination-card"
                style={{
                  backgroundImage: `url('${destination.image}')`,
                }}
              >
                <div className="destination-content">
                  <p className="destination-subtitle">
                    {destination.subtitle}
                  </p>

                  <h4 className="destination-title">{destination.name}</h4>

                  <p className="destination-price">{destination.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="info-section">
          <div className="info-card">
            <h3 className="info-title">
              How to book a flight ticket with Dairy Flat Airways
            </h3>

            <div className="info-underline" />

            <h4 className="info-subtitle">Book a flight ticket online</h4>

            <p className="info-text">
              To find the right air ticket for your trip, enter the location you
              are flying from and your flight destination. The system only shows
              destinations that match valid Dairy Flat Airways scheduled routes.
              Then choose your travel dates within June 2026, number of
              passengers, and click the search button to continue with the
              online booking process.
            </p>

            <h4 className="info-subtitle">Manage an existing booking</h4>

            <p className="info-text">
              Use the Manage Booking tab to enter a booking reference and last /
              family name. The system checks the booking details first. If the
              booking reference or family name is incorrect, an error message is
              shown and the user will not be redirected.
            </p>

            <h4 className="info-subtitle">View passenger flights after login</h4>

            <p className="info-text">
              Passenger flight details should only be displayed after a
              passenger logs in. This protects the passenger’s booking
              information and avoids showing private flight details openly.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}