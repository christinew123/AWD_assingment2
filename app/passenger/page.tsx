"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
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

type PassengerForm = {
  title: string;
  firstName: string;
  lastName: string;
  noGivenName: boolean;
  under18: boolean;
  guardianName: string;
  guardianCountryCode: string;
  guardianPhone: string;
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

function createPassenger(): PassengerForm {
  return {
    title: "Miss",
    firstName: "",
    lastName: "",
    noGivenName: false,
    under18: false,
    guardianName: "",
    guardianCountryCode: "+64",
    guardianPhone: "",
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function cleanPhoneNumber(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

function isValidPhoneNumber(phone: string) {
  const cleanedPhone = cleanPhoneNumber(phone);
  return /^[0-9]{7,11}$/.test(cleanedPhone);
}

function PassengerPageContent() {
  const searchParams = useSearchParams();

  const flightNumber = searchParams.get("flightNumber") || "";
  const returnFlightNumber = searchParams.get("returnFlightNumber") || "";
  const passengerCount = Number(searchParams.get("passengers") || "1");
  const isChangingFlight = searchParams.get("isChangingFlight") === "true";
  const bookingReference = searchParams.get("bookingReference") || "";
  const familyName = searchParams.get("familyName") || "";

  const outboundFlight = findFlight(flightNumber);
  const returnFlight = findFlight(returnFlightNumber);

  const [passengers, setPassengers] = useState<PassengerForm[]>(
    Array.from({ length: passengerCount }, () => createPassenger())
  );

  const [email, setEmail] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+64");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadExistingPassengerDetails() {
      if (!isChangingFlight || !bookingReference || !familyName) {
        return;
      }

      try {
        const response = await fetch(
          `/api/bookings/manage?bookingReference=${encodeURIComponent(
            bookingReference
          )}&familyName=${encodeURIComponent(familyName)}`
        );

        const result = await response.json();

        if (!response.ok || !result.booking) {
          return;
        }

        const existingPassenger = result.booking.passenger;

        setPassengers((currentPassengers) =>
          currentPassengers.map((passenger, index) => {
            if (index !== 0) return passenger;

            return {
              ...passenger,
              title: existingPassenger?.title || "Miss",
              firstName:
                existingPassenger?.firstName === "N/A"
                  ? ""
                  : existingPassenger?.firstName || "",
              lastName: existingPassenger?.lastName || "",
              noGivenName: existingPassenger?.firstName === "N/A",
            };
          })
        );

        setEmail(existingPassenger?.email || "");
        setPhoneCountryCode(existingPassenger?.phoneCountryCode || "+64");
        setPhoneNumber(existingPassenger?.phoneNumber || "");
      } catch (error) {
        console.error("Unable to load existing passenger details:", error);
      }
    }

    loadExistingPassengerDetails();
  }, [isChangingFlight, bookingReference, familyName]);

  const totalFare = useMemo(() => {
    return (
      ((outboundFlight?.price || 0) + (returnFlight?.price || 0)) *
      passengerCount
    );
  }, [outboundFlight, returnFlight, passengerCount]);

  function updatePassenger(
    index: number,
    field: keyof PassengerForm,
    value: string | boolean
  ) {
    setPassengers((currentPassengers) =>
      currentPassengers.map((passenger, passengerIndex) => {
        if (passengerIndex !== index) return passenger;

        if (field === "noGivenName") {
          return {
            ...passenger,
            noGivenName: Boolean(value),
            firstName: Boolean(value) ? "" : passenger.firstName,
          };
        }

        return {
          ...passenger,
          [field]: value,
        };
      })
    );
  }

  function validatePassengerDetails() {
    for (let index = 0; index < passengers.length; index++) {
      const passenger = passengers[index];
      const passengerNumber = index + 1;

      if (!passenger.title.trim()) {
        return `Please select a title for Passenger ${passengerNumber}.`;
      }

      if (!passenger.noGivenName && !passenger.firstName.trim()) {
        return `Please enter the first/given name for Passenger ${passengerNumber}, or tick the no first/given name checkbox.`;
      }

      if (!passenger.lastName.trim()) {
        return `Please enter the last/family name for Passenger ${passengerNumber}.`;
      }

      if (passenger.under18) {
        if (!passenger.guardianName.trim()) {
          return `Please enter the parent/guardian full name for Passenger ${passengerNumber}.`;
        }

        if (!passenger.guardianCountryCode.trim()) {
          return `Please select the parent/guardian country code for Passenger ${passengerNumber}.`;
        }

        if (!passenger.guardianPhone.trim()) {
          return `Please enter the parent/guardian phone number for Passenger ${passengerNumber}.`;
        }

        if (!isValidPhoneNumber(passenger.guardianPhone)) {
          return `Please enter a valid parent/guardian phone number for Passenger ${passengerNumber}. Use 7 to 11 digits, for example 21 123 4567.`;
        }
      }
    }

    if (!email.trim()) return "Please enter your email address.";
    if (!isValidEmail(email)) {
      return "Please enter a valid email address, for example passenger@example.com.";
    }
    if (!phoneCountryCode.trim()) return "Please select a phone country code.";
    if (!phoneNumber.trim()) return "Please enter your phone number.";
    if (!isValidPhoneNumber(phoneNumber)) {
      return "Please enter a valid phone number. Use 7 to 11 digits, for example 21 123 4567.";
    }

    return "";
  }

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
        `}</style>

        <div className="error-card">
          <Link href="/search" className="back-link">
            ← Back to Search
          </Link>
          <h1>Flight Not Found</h1>
        </div>
      </main>
    );
  }

  const outboundFrom = getAirport(outboundFlight.origin);
  const outboundTo = getAirport(outboundFlight.destination);
  const returnFrom = returnFlight ? getAirport(returnFlight.origin) : null;
  const returnTo = returnFlight ? getAirport(returnFlight.destination) : null;

  const firstPassenger = passengers[0];

  const firstNameForConfirm = firstPassenger?.noGivenName
    ? "N/A"
    : firstPassenger?.firstName || "";

  const fullPhoneNumber = `${phoneCountryCode} ${phoneNumber}`.trim();

  const guardianFullPhoneNumber = `${
    firstPassenger?.guardianCountryCode || ""
  } ${firstPassenger?.guardianPhone || ""}`.trim();

  const confirmUrl =
    `/confirm?flightNumber=${flightNumber}` +
    `&returnFlightNumber=${returnFlightNumber}` +
    `&passengers=${passengerCount}` +
    `&email=${encodeURIComponent(email)}` +
    `&phone=${encodeURIComponent(fullPhoneNumber)}` +
    `&phoneCountryCode=${encodeURIComponent(phoneCountryCode)}` +
    `&phoneNumber=${encodeURIComponent(phoneNumber)}` +
    `&title=${encodeURIComponent(firstPassenger?.title || "")}` +
    `&firstName=${encodeURIComponent(firstNameForConfirm)}` +
    `&lastName=${encodeURIComponent(firstPassenger?.lastName || "")}` +
    `&noGivenName=${firstPassenger?.noGivenName ? "true" : "false"}` +
    `&under18=${firstPassenger?.under18 ? "true" : "false"}` +
    `&guardianName=${encodeURIComponent(firstPassenger?.guardianName || "")}` +
    `&guardianPhone=${encodeURIComponent(guardianFullPhoneNumber)}` +
    `&isChangingFlight=${isChangingFlight ? "true" : "false"}` +
    `&bookingReference=${encodeURIComponent(bookingReference)}` +
    `&familyName=${encodeURIComponent(familyName)}`;

  const bookUrl =
    `/book?flightNumber=${flightNumber}` +
    `&returnFlightNumber=${returnFlightNumber}` +
    `&passengers=${passengerCount}` +
    `&isChangingFlight=${isChangingFlight ? "true" : "false"}` +
    `&bookingReference=${encodeURIComponent(bookingReference)}` +
    `&familyName=${encodeURIComponent(familyName)}`;

  function handleContinue() {
    const validationError = validatePassengerDetails();

    if (validationError) {
      setErrorMessage(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrorMessage("");
    window.location.href = confirmUrl;
  }

  return (
    <>
      <style>{pageStyles}</style>

      <main className="page">
        <Navbar />
        <BookingSteps currentStep="passengers" />

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
          <Link href={bookUrl} className="back">
            ← Back
          </Link>

          <h2 className="title">Passenger details</h2>

          <p className="description">
            Each passenger must hold a valid passport and visa, if required, to
            be allowed entry into each destination on the flight itinerary.
            Dairy Flat Airways cannot be held responsible if a passenger is
            denied entry by any local authority.
          </p>

          <p className="required-note">
            All fields are required unless marked optional.
          </p>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          {passengers.map((passenger, index) => (
            <article className="passenger-card" key={index}>
              <div className="passenger-card-header">
                <div className="avatar">👤</div>
                Passenger {index + 1} - Adult
              </div>

              <div className="passenger-form">
                <p className="section-label">Personal details</p>

                <div className="form-row">
                  <div className="input-wrap">
                    <label>Title</label>
                    <select
                      value={passenger.title}
                      onChange={(event) =>
                        updatePassenger(index, "title", event.target.value)
                      }
                    >
                      <option>Miss</option>
                      <option>Mrs</option>
                      <option>Mr</option>
                      <option>Ms</option>
                      <option>Dr</option>
                    </select>
                  </div>

                  <div
                    className={`input-wrap ${
                      passenger.noGivenName ? "disabled" : ""
                    }`}
                  >
                    <label>First/Given name as in passport</label>
                    <input
                      value={passenger.noGivenName ? "N/A" : passenger.firstName}
                      onChange={(event) =>
                        updatePassenger(index, "firstName", event.target.value)
                      }
                      disabled={passenger.noGivenName}
                      placeholder="e.g. CHRISTINE"
                    />
                  </div>

                  <div className="input-wrap">
                    <label>Last/Family name as in passport</label>
                    <input
                      value={passenger.lastName}
                      onChange={(event) =>
                        updatePassenger(index, "lastName", event.target.value)
                      }
                      placeholder="e.g. WONG"
                    />
                  </div>
                </div>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={passenger.noGivenName}
                    onChange={(event) =>
                      updatePassenger(index, "noGivenName", event.target.checked)
                    }
                  />
                  <span>I do not have a first/given name in my passport</span>
                </label>

                {passenger.noGivenName && (
                  <div className="info-box">
                    First/Given name has been marked as not applicable. The
                    booking will record the first name as N/A.
                  </div>
                )}

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={passenger.under18}
                    onChange={(event) =>
                      updatePassenger(index, "under18", event.target.checked)
                    }
                  />
                  <span>I am under 18 years old</span>
                </label>

                {passenger.under18 && (
                  <div className="guardian-box">
                    <h3 className="guardian-title">Parent / Guardian details</h3>
                    <p className="guardian-description">
                      Since this passenger is under 18, parent or guardian
                      contact details are required for travel support.
                    </p>

                    <div className="guardian-grid">
                      <div className="input-wrap">
                        <label>Parent / Guardian full name</label>
                        <input
                          value={passenger.guardianName}
                          onChange={(event) =>
                            updatePassenger(index, "guardianName", event.target.value)
                          }
                          placeholder="e.g. TAN MEI LING"
                        />
                      </div>

                      <div className="input-wrap">
                        <label>Country code</label>
                        <select
                          value={passenger.guardianCountryCode}
                          onChange={(event) =>
                            updatePassenger(
                              index,
                              "guardianCountryCode",
                              event.target.value
                            )
                          }
                        >
                          <option value="+64">+64 New Zealand</option>
                          <option value="+61">+61 Australia</option>
                        </select>
                      </div>

                      <div className="input-wrap">
                        <label>Parent / Guardian phone number</label>
                        <input
                          value={passenger.guardianPhone}
                          onChange={(event) =>
                            updatePassenger(index, "guardianPhone", event.target.value)
                          }
                          placeholder="e.g. 21 123 4567"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}

          <article className="contact-card">
            <p className="section-label">Contact details</p>

            <div className="contact-grid">
              <div className="input-wrap">
                <label>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="e.g. passenger@example.com"
                />
              </div>

              <div className="input-wrap">
                <label>Country code</label>
                <select
                  value={phoneCountryCode}
                  onChange={(event) => setPhoneCountryCode(event.target.value)}
                >
                  <option value="+64">+64 New Zealand</option>
                  <option value="+61">+61 Australia</option>
                </select>
              </div>

              <div className="input-wrap">
                <label>Phone number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="e.g. 21 123 4567"
                />
              </div>
            </div>
          </article>

          <div className="actions">
            <Link href={bookUrl} className="secondary-button">
              Back
            </Link>

            <button
              type="button"
              className="primary-button"
              onClick={handleContinue}
            >
              Continue
            </button>
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

const pageStyles = `
  * { box-sizing: border-box; }

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
    min-height: 42px;
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
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 320px;
    border-bottom: 1px solid #cbd5e1;
  }

  .simple-flight-box,
  .simple-fare-box {
    min-height: 96px;
    padding: 18px 28px;
    border-right: 1px solid #cbd5e1;
  }

  .simple-label,
  .simple-fare-label {
    margin: 0 0 6px;
    font-size: 11px;
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
    grid-template-columns: minmax(0, 1fr) 54px minmax(0, 1fr);
    align-items: center;
    gap: 16px;
  }

  .simple-airport-code {
    font-size: 21px;
    font-weight: 500;
    letter-spacing: 0.05em;
    color: #062b67;
    white-space: nowrap;
  }

  .simple-airport-name {
    margin-top: 4px;
    font-size: 11px;
    font-weight: 700;
  }

  .simple-plane {
    text-align: center;
    font-size: 21px;
    color: #062b67;
  }

  .simple-duration {
    margin-top: 4px;
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
    margin: 6px 0 4px;
    font-size: 22px;
    font-weight: 500;
    color: #062b67;
  }

  .simple-note {
    margin: 0;
    font-size: 10px;
    font-style: italic;
    color: #334155;
    line-height: 1.4;
  }

  .content {
    max-width: 1180px;
    margin: 0 auto;
    padding: 38px 32px 90px;
  }

  .back {
    display: inline-block;
    margin-bottom: 26px;
    color: #0070a8;
    font-weight: 900;
    text-decoration: none;
  }

  .title {
    margin: 0 0 16px;
    font-size: 30px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: #001b4f;
  }

  .description {
    max-width: 960px;
    margin: 0 0 14px;
    font-size: 15px;
    line-height: 1.7;
    color: #111827;
  }

  .required-note {
    margin: 0 0 22px;
    color: #64748b;
    font-size: 13px;
  }

  .error-message {
    margin: 0 0 24px;
    padding: 16px 18px;
    background: #fee2e2;
    border: 1px solid #fca5a5;
    color: #991b1b;
    font-size: 14px;
    font-weight: 800;
    line-height: 1.5;
  }

  .passenger-card,
  .contact-card {
    background: white;
    border: 1px solid #d7dde8;
    margin-bottom: 26px;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  }

  .passenger-card-header {
    min-height: 72px;
    padding: 0 30px;
    border-bottom: 1px solid #d7dde8;
    display: flex;
    align-items: center;
    gap: 16px;
    color: #062b67;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #eef2f7;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .passenger-form,
  .contact-card {
    padding: 30px;
  }

  .section-label {
    margin: 0 0 18px;
    font-size: 17px;
    font-weight: 900;
    color: #071733;
  }

  .form-row {
    display: grid;
    grid-template-columns: 130px minmax(0, 1fr) minmax(0, 1fr);
    gap: 20px;
    margin-bottom: 20px;
  }

  .contact-grid,
  .guardian-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) 270px minmax(0, 1fr);
    gap: 20px;
    margin-top: 18px;
  }

  .input-wrap {
    background: #f7f8fa;
    border-bottom: 2px solid #c7d2fe;
    padding: 10px 14px 12px;
    min-height: 64px;
  }

  .input-wrap.disabled {
    background: #eef2f7;
    border-bottom-color: #cbd5e1;
    opacity: 0.8;
  }

  .input-wrap label {
    display: block;
    margin-bottom: 6px;
    font-size: 11px;
    color: #64748b;
  }

  .input-wrap input,
  .input-wrap select {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: #111827;
    font-size: 15px;
    font-weight: 800;
  }

  .input-wrap select {
    min-width: 0;
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    padding-right: 8px;
  }

  .input-wrap input:disabled {
    color: #64748b;
    cursor: not-allowed;
  }

  .checkbox-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin: 14px 0;
    font-size: 14px;
    line-height: 1.4;
    color: #111827;
  }

  .checkbox-row input {
    width: 16px;
    height: 16px;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .info-box {
    margin-top: 16px;
    padding: 14px 16px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e3a8a;
    font-size: 13px;
    line-height: 1.5;
  }

  .guardian-box {
    margin-top: 22px;
    padding: 22px;
    background: #f8fafc;
    border: 1px solid #d7dde8;
  }

  .guardian-title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 900;
    color: #071733;
  }

  .guardian-description {
    margin: 0 0 16px;
    color: #475569;
    font-size: 13px;
    line-height: 1.5;
  }

  .actions {
    margin-top: 34px;
    display: flex;
    justify-content: flex-end;
    gap: 14px;
  }

  .secondary-button,
  .primary-button {
    height: 50px;
    border: none;
    padding: 0 30px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .secondary-button {
    background: #e2e8f0;
    color: #111827;
  }

  .primary-button {
    background: #062b67;
    color: white;
  }

  @media (max-width: 1100px) {
    .simple-flight-summary,
    .contact-grid,
    .guardian-grid {
      grid-template-columns: 1fr;
    }

    .simple-flight-box,
    .simple-fare-box {
      border-right: none;
    }
  }

  @media (max-width: 900px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .content {
      padding: 30px 18px 70px;
    }

    .summary-inner,
    .passenger-card-header,
    .passenger-form,
    .contact-card {
      padding-left: 20px;
      padding-right: 20px;
    }

    .title {
      font-size: 26px;
    }

    .actions {
      flex-direction: column;
    }

    .secondary-button,
    .primary-button {
      width: 100%;
    }
  }
`;


export default function PassengerPage() {
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
          Loading passenger page...
        </main>
      }
    >
      <PassengerPageContent />
    </Suspense>
  );
}
