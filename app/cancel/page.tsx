"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";

type BookingFlight = {
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  arrivalDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  aircraft?: string;
  price?: number;
};

type Booking = {
  bookingReference: string;
  status: string;
  passenger?: {
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneCountryCode?: string;
    phoneNumber?: string;
    phone?: string;
  };
  passengers?: number;
  outboundFlight?: BookingFlight | null;
  returnFlight?: BookingFlight | null;
  totalFare?: number;
};

const airports: Record<string, { name: string; airport: string }> = {
  NZNE: { name: "Dairy Flat", airport: "Dairy Flat Airport" },
  YSSY: { name: "Sydney", airport: "Sydney Airport" },
  NZRO: { name: "Rotorua", airport: "Rotorua Airport" },
  NZGB: { name: "Great Barrier Island", airport: "Great Barrier Aerodrome" },
  NZCI: { name: "Chatham Islands", airport: "Tuuta Airport" },
  NZTL: { name: "Lake Tekapo", airport: "Lake Tekapo Airport" },
};

function getAirportName(code?: string) {
  if (!code) {
    return "Unknown";
  }

  return airports[code]?.name || code;
}

function formatDate(dateString?: string) {
  if (!dateString) {
    return "Not available";
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date
    .toLocaleDateString("en-NZ", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    .toUpperCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhoneNumber(phone: string) {
  const cleanedPhone = phone.replace(/[\s-]/g, "");
  return /^[0-9]{7,11}$/.test(cleanedPhone);
}

function CancelPageContent() {
  const searchParams = useSearchParams();

  const bookingReference = searchParams.get("bookingReference") || "";
  const familyName =
    searchParams.get("familyName") || searchParams.get("lastName") || "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+64");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    async function loadBooking() {
      if (!bookingReference || !familyName) {
        setPageError("Booking reference and family name are required.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/bookings/manage?bookingReference=${encodeURIComponent(
            bookingReference
          )}&familyName=${encodeURIComponent(familyName)}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Booking not found.");
        }

        const loadedBooking = result.booking as Booking;

        setBooking(loadedBooking);
        setTitle(loadedBooking.passenger?.title || "Miss");
        setFirstName(loadedBooking.passenger?.firstName || "");
        setLastName(loadedBooking.passenger?.lastName || "");
        setEmail(loadedBooking.passenger?.email || "");
        setPhoneCountryCode(loadedBooking.passenger?.phoneCountryCode || "+64");
        setPhoneNumber(loadedBooking.passenger?.phoneNumber || "");
      } catch (error) {
        console.error(error);
        setPageError("Booking Not Found");
      } finally {
        setIsLoading(false);
      }
    }

    loadBooking();
  }, [bookingReference, familyName]);

  function validateUpdateForm() {
    if (!title.trim()) {
      return "Please select a title.";
    }

    if (!firstName.trim()) {
      return "Please enter the passenger first/given name.";
    }

    if (!lastName.trim()) {
      return "Please enter the passenger last/family name.";
    }

    if (!email.trim()) {
      return "Please enter the passenger email address.";
    }

    if (!isValidEmail(email)) {
      return "Please enter a valid email address, for example passenger@example.com.";
    }

    if (!phoneCountryCode.trim()) {
      return "Please select a phone country code.";
    }

    if (!phoneNumber.trim()) {
      return "Please enter the passenger phone number.";
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      return "Please enter a valid phone number using 7 to 11 digits, for example 21 123 4567.";
    }

    return "";
  }

  async function handleUpdateDetails() {
    if (!booking || booking.status === "cancelled") {
      return;
    }

    setPageError("");
    setSuccessMessage("");

    const validationError = validateUpdateForm();

    if (validationError) {
      setPageError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/bookings/manage", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update-details",
          bookingReference: booking.bookingReference,
          familyName,
          passenger: {
            title,
            firstName,
            lastName,
            email,
            phoneCountryCode,
            phoneNumber,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Booking details could not be updated.");
      }

      setBooking({
        ...booking,
        passenger: {
          ...booking.passenger,
          title,
          firstName,
          lastName,
          email,
          phoneCountryCode,
          phoneNumber,
          phone: `${phoneCountryCode} ${phoneNumber}`.trim(),
        },
      });

      setSuccessMessage("Booking details updated successfully.");
    } catch (error) {
      console.error(error);

      setPageError(
        error instanceof Error
          ? error.message
          : "Booking details could not be updated."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancelBooking() {
    if (!booking) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    setIsCancelling(true);
    setPageError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/bookings/manage", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "cancel",
          bookingReference: booking.bookingReference,
          familyName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Booking could not be cancelled.");
      }

      setBooking({
        ...booking,
        status: "cancelled",
      });

      setSuccessMessage("Booking cancelled successfully.");
    } catch (error) {
      console.error(error);

      setPageError(
        error instanceof Error
          ? error.message
          : "Booking could not be cancelled. Please try again."
      );
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) {
    return (
      <>
        <style>{pageStyles}</style>

        <main className="page">
          <Navbar />

          <section className="message-card">
            <p>Loading booking...</p>
          </section>
        </main>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <style>{pageStyles}</style>

        <main className="page">
          <Navbar />

          <section className="message-card">
            <Link href="/#manage-booking" className="back-link">
              ← Back to Manage Booking
            </Link>

            <h1>{pageError || "Booking Not Found"}</h1>

            <p>
              Please check that the booking reference and family name match the
              booking invoice.
            </p>
          </section>
        </main>
      </>
    );
  }

  const outboundFlight = booking.outboundFlight || null;
  const returnFlight = booking.returnFlight || null;
  const isCancelled = booking.status === "cancelled";

  const changeFlightUrl = outboundFlight
    ? `/search?isChangingFlight=true` +
      `&bookingReference=${encodeURIComponent(booking.bookingReference)}` +
      `&familyName=${encodeURIComponent(familyName)}` +
      `&tripType=${returnFlight ? "return" : "oneway"}` +
      `&orig=${encodeURIComponent(outboundFlight.origin || "")}` +
      `&dest=${encodeURIComponent(outboundFlight.destination || "")}` +
      `&date1=${encodeURIComponent(outboundFlight.departureDate || "")}` +
      `&date2=${encodeURIComponent(returnFlight?.departureDate || "")}` +
      `&passengers=${encodeURIComponent(String(booking.passengers || 1))}` +
      `&adults=${encodeURIComponent(String(booking.passengers || 1))}` +
      `&children=0` +
      `&infants=0`
    : "/search";

  const passengerPhone =
    booking.passenger?.phone ||
    `${booking.passenger?.phoneCountryCode || ""} ${
      booking.passenger?.phoneNumber || ""
    }`.trim();

  return (
    <>
      <style>{pageStyles}</style>

      <main className="page">
        <Navbar />

        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Manage Booking</p>

            <h1>Manage your Dairy Flat trip</h1>

            <h2>View, update, or cancel your booking</h2>

            <p>
              You can update passenger and contact details, cancel the booking,
              or return to flight search if you need to choose another flight.
            </p>
          </div>

          <div className="reference-card">
            <p className="reference-label">Booking Reference</p>
            <p className="reference-number">{booking.bookingReference}</p>
            <p className="download-link">Booking details and receipt</p>
          </div>
        </section>

        <section className="content-card">
          {pageError && <p className="error-box">{pageError}</p>}
          {successMessage && <p className="success-box">{successMessage}</p>}

          <div className="status-row">
            <div>
              <p className="small-label">Booking Status</p>
              <h2>{booking.status}</h2>
            </div>

            <span
              className={
                isCancelled ? "status-pill cancelled" : "status-pill"
              }
            >
              {booking.status}
            </span>
          </div>

          {isCancelled && (
            <p className="cancelled-note">
              This booking has been cancelled. Passenger details, contact
              details, and flight details can no longer be changed.
            </p>
          )}

          <div className="details-grid">
            <section className="summary-box">
              <h2>Passenger Summary</h2>

              <p>
                <strong>Name:</strong> {booking.passenger?.title}{" "}
                {booking.passenger?.firstName} {booking.passenger?.lastName}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {booking.passenger?.email || "Not entered"}
              </p>

              <p>
                <strong>Phone:</strong> {passengerPhone || "Not entered"}
              </p>

              <p>
                <strong>Passengers:</strong> {booking.passengers || 1}
              </p>
            </section>

            <section className="summary-box">
              <h2>Payment Summary</h2>
              <p className="price">NZD {booking.totalFare || 0}</p>
              <p className="payment-note">
                Total fare includes selected flight and passenger fare.
              </p>
            </section>
          </div>

          <section className="update-card">
            <h2>Update passenger and contact details</h2>

            <p className="update-note">
              These changes update the saved MongoDB booking record. Flight
              changes should be made by returning to flight search so seat
              availability can be checked again.
            </p>

            <div className="form-grid">
              <label className="input-box title-field">
                <span>Title</span>

                <select
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={isCancelled}
                >
                  <option>Miss</option>
                  <option>Mrs</option>
                  <option>Mr</option>
                  <option>Ms</option>
                  <option>Dr</option>
                </select>
              </label>

              <label className="input-box name-field">
                <span>First / Given name</span>

                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="e.g. CHRISTINE"
                  disabled={isCancelled}
                />
              </label>

              <label className="input-box name-field">
                <span>Last / Family name</span>

                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="e.g. WONG"
                  disabled={isCancelled}
                />
              </label>

              <label className="input-box email-field">
                <span>Email address</span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="e.g. passenger@example.com"
                  disabled={isCancelled}
                />
              </label>

              <label className="input-box country-field">
                <span>Country code</span>

                <select
                  value={phoneCountryCode}
                  onChange={(event) => setPhoneCountryCode(event.target.value)}
                  disabled={isCancelled}
                >
                  <option value="+64">+64 New Zealand</option>
                  <option value="+61">+61 Australia</option>
                </select>
              </label>

              <label className="input-box phone-field">
                <span>Phone number</span>

                <input
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="e.g. 21 123 4567"
                  disabled={isCancelled}
                />
              </label>
            </div>

            {!isCancelled && (
              <div className="update-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleUpdateDetails}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Update Details"}
                </button>

                <Link href={changeFlightUrl} className="secondary-link">
                  Change Flight
                </Link>
              </div>
            )}
          </section>

          <h2 className="flights-title">Your flights</h2>

          {outboundFlight && (
            <FlightCard label="Departing Flight" flight={outboundFlight} />
          )}

          {returnFlight && (
            <FlightCard label="Returning Flight" flight={returnFlight} />
          )}

          <div className="actions">
            <Link href="/" className="primary-button">
              Return Home
            </Link>

            {!isCancelled && (
              <button
                type="button"
                className="danger-button"
                onClick={handleCancelBooking}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function FlightCard({
  label,
  flight,
}: {
  label: string;
  flight: BookingFlight;
}) {
  return (
    <section className="flight-card">
      <p className="small-label">{label}</p>

      <h3>
        {getAirportName(flight.origin)} ({flight.origin}) →{" "}
        {getAirportName(flight.destination)} ({flight.destination})
      </h3>

      <p className="flight-number">{flight.flightNumber}</p>

      <div className="flight-grid">
        <div>
          <span>Departure</span>
          <strong>
            {formatDate(flight.departureDate)}, {flight.departureTime}
          </strong>
        </div>

        <div>
          <span>Arrival</span>
          <strong>
            {formatDate(flight.arrivalDate)}, {flight.arrivalTime}
          </strong>
        </div>

        <div>
          <span>Aircraft</span>
          <strong>{flight.aircraft}</strong>
        </div>
      </div>
    </section>
  );
}

const pageStyles = `
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

  .hero {
    min-height: 300px;
    padding: 54px 56px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 30px;
    align-items: center;
    background:
      linear-gradient(rgba(0, 0, 0, 0.56), rgba(0, 0, 0, 0.56)),
      url("/sydney.jpg");
    background-size: cover;
    background-position: center;
    color: white;
  }

  .hero-copy {
    max-width: 820px;
    border-left: 5px solid #f0b323;
    padding-left: 24px;
  }

  .eyebrow,
  .small-label {
    margin: 0 0 10px;
    color: #0070a8;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .hero .eyebrow {
    color: #f0b323;
  }

  .hero h1 {
    margin: 0 0 14px;
    font-size: 31px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }

  .hero h2 {
    margin: 0 0 12px;
    font-size: 17px;
    font-weight: 900;
    letter-spacing: 0.07em;
  }

  .hero p {
    margin: 0;
    max-width: 760px;
    font-size: 15px;
    line-height: 1.5;
  }

  .reference-card {
    background: white;
    color: #071733;
    border-radius: 8px;
    padding: 26px 30px;
    text-align: center;
  }

  .reference-label {
    margin: 0;
    color: #062b67;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .reference-label::after {
    content: "";
    display: block;
    width: 110px;
    height: 2px;
    margin: 14px auto 20px;
    background: #f0b323;
  }

  .reference-number {
    margin: 0;
    color: #071733;
    font-size: 27px;
    font-weight: 900;
    letter-spacing: 0.16em;
  }

  .download-link {
    margin: 20px 0 0;
    color: #0057d9;
    font-size: 14px;
  }

  .content-card {
    max-width: 1240px;
    margin: -42px auto 60px;
    padding: 30px 38px 38px;
    background: white;
    border-radius: 6px;
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
  }

  .error-box,
  .success-box,
  .cancelled-note {
    margin: 0 0 18px;
    padding: 14px 16px;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.5;
  }

  .error-box {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    color: #991b1b;
  }

  .success-box {
    background: #dcfce7;
    border: 1px solid #86efac;
    color: #166534;
  }

  .cancelled-note {
    margin-top: 18px;
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    border: 1px solid #dbe3ef;
    padding: 20px 24px;
  }

  .status-row h2 {
    margin: 0;
    font-size: 19px;
    font-weight: 900;
    text-transform: capitalize;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 120px;
    padding: 9px 18px;
    border-radius: 999px;
    background: #dcfce7;
    border: 1px solid #86efac;
    color: #166534;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .status-pill.cancelled {
    background: #fee2e2;
    border-color: #fecaca;
    color: #991b1b;
  }

  .details-grid {
    margin-top: 24px;
    display: grid;
    grid-template-columns: 1.35fr 0.85fr;
    gap: 22px;
  }

  .summary-box {
    padding: 22px;
    border: 1px solid #dbe3ef;
    background: #f8fafc;
  }

  .details-grid h2,
  .flights-title,
  .update-card h2 {
    margin: 0 0 14px;
    font-size: 21px;
    font-weight: 500;
    color: #062b67;
  }

  .details-grid p {
    margin: 8px 0;
    font-size: 13px;
    color: #334155;
  }

  .price {
    margin: 0 !important;
    font-size: 27px !important;
    color: #062b67 !important;
    font-weight: 900;
  }

  .payment-note {
    margin-top: 10px !important;
    color: #64748b !important;
  }

  .update-card {
    margin-top: 26px;
    padding: 26px;
    border: 1px solid #dbe3ef;
    background: #f8fafc;
  }

  .update-note {
    margin: 0 0 22px;
    color: #475569;
    font-size: 13px;
    line-height: 1.5;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr) minmax(0, 1fr);
    gap: 16px;
    align-items: end;
  }

  .input-box {
    display: block;
    min-width: 0;
    background: white;
    border-bottom: 2px solid #c7d2fe;
    padding: 11px 14px 13px;
    min-height: 70px;
    overflow: hidden;
  }

  .input-box span {
    display: block;
    margin-bottom: 7px;
    color: #64748b;
    font-size: 11px;
    font-weight: 800;
  }

  .input-box input,
  .input-box select {
    width: 100%;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: #071733;
    font-size: 14px;
    font-weight: 800;
  }

  .input-box input {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .input-box select {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }

  .input-box input:disabled,
  .input-box select:disabled {
    color: #94a3b8;
    cursor: not-allowed;
  }

  .email-field {
    grid-column: span 2;
  }

  .country-field {
    min-width: 245px;
  }

  .phone-field {
    min-width: 0;
  }

  .update-actions,
  .actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .flights-title {
    margin-top: 30px;
  }

  .flight-card {
    margin-top: 16px;
    border: 1px solid #dbe3ef;
    border-radius: 8px;
    padding: 20px;
  }

  .flight-card h3 {
    margin: 0 0 8px;
    font-size: 19px;
    font-weight: 900;
  }

  .flight-number {
    margin: 0 0 16px;
    color: #0070a8;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.14em;
  }

  .flight-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 13px;
  }

  .flight-grid div {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 13px;
  }

  .flight-grid span {
    display: block;
    margin-bottom: 6px;
    color: #64748b;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .flight-grid strong {
    font-size: 13px;
  }

  .primary-button,
  .danger-button,
  .secondary-link {
    min-height: 42px;
    padding: 0 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    text-decoration: none;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .primary-button {
    background: #062b67;
    color: white;
  }

  .secondary-link {
    background: #e2e8f0;
    color: #071733;
  }

  .danger-button {
    background: #fee2e2;
    color: #991b1b;
  }

  .primary-button:disabled,
  .danger-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .message-card {
    max-width: 850px;
    margin: 110px auto;
    padding: 42px;
    background: white;
  }

  .message-card h1 {
    margin: 16px 0 10px;
    font-size: 24px;
  }

  .message-card p {
    color: #475569;
  }

  .back-link {
    color: #071733;
    text-decoration: none;
    font-size: 15px;
  }

  @media (max-width: 1000px) {
    .hero,
    .details-grid,
    .flight-grid,
    .form-grid {
      grid-template-columns: 1fr;
    }

    .email-field {
      grid-column: auto;
    }

    .country-field {
      min-width: 0;
    }

    .hero {
      padding: 46px 24px;
    }

    .content-card {
      margin: -30px 16px 50px;
      padding: 26px 22px;
    }
  }
`;


export default function CancelPage() {
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
          Loading booking...
        </main>
      }
    >
      <CancelPageContent />
    </Suspense>
  );
}

