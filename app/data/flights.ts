export type Airport = {
  code: string;
  name: string;
  city: string;
  timezone: string;
};

export type Aircraft = {
  code: string;
  name: string;
  capacity: number;
};

export type ScheduledFlight = {
  flightNumber: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  arrivalDateTime: string;
  aircraftCode: string;
  price: number;
  seatsBooked: number;
};

export const airports: Airport[] = [
  {
    code: "NZNE",
    name: "Dairy Flat Airport",
    city: "Dairy Flat",
    timezone: "GMT+12",
  },
  {
    code: "YSSY",
    name: "Sydney Airport",
    city: "Sydney",
    timezone: "GMT+10",
  },
  {
    code: "NZRO",
    name: "Rotorua Airport",
    city: "Rotorua",
    timezone: "GMT+12",
  },
  {
    code: "NZGB",
    name: "Claris Airport",
    city: "Great Barrier Island",
    timezone: "GMT+12",
  },
  {
    code: "NZCI",
    name: "Tuuta Airport",
    city: "Chatham Islands",
    timezone: "GMT+12:45",
  },
  {
    code: "NZTL",
    name: "Lake Tekapo Airport",
    city: "Lake Tekapo",
    timezone: "GMT+12",
  },
];

export const aircraft: Aircraft[] = [
  {
    code: "SJ30I",
    name: "SyberJet SJ30i",
    capacity: 6,
  },
  {
    code: "SF50-A",
    name: "Cirrus SF50 Jet A",
    capacity: 4,
  },
  {
    code: "SF50-B",
    name: "Cirrus SF50 Jet B",
    capacity: 4,
  },
  {
    code: "HJET-A",
    name: "HondaJet Elite A",
    capacity: 5,
  },
  {
    code: "HJET-B",
    name: "HondaJet Elite B",
    capacity: 5,
  },
];

function makeDate(day: number, time: string, offset: string) {
  const paddedDay = String(day).padStart(2, "0");
  return `2026-06-${paddedDay}T${time}:00${offset}`;
}

function addFlight(
  flights: ScheduledFlight[],
  flightNumber: string,
  origin: string,
  destination: string,
  departureDay: number,
  departureTime: string,
  departureOffset: string,
  arrivalDay: number,
  arrivalTime: string,
  arrivalOffset: string,
  aircraftCode: string,
  price: number
) {
  flights.push({
    flightNumber,
    origin,
    destination,
    departureDateTime: makeDate(departureDay, departureTime, departureOffset),
    arrivalDateTime: makeDate(arrivalDay, arrivalTime, arrivalOffset),
    aircraftCode,
    price,
    seatsBooked: 0,
  });
}

function generateScheduledFlights() {
  const flights: ScheduledFlight[] = [];

  /*
    Calendar used:
    2026-06-01 is a Monday.
    This schedule covers four full weeks: 1 June 2026 to 28 June 2026.
    The assignment requires real calendar dates and more than one week of flights.
  */

  for (let day = 1; day <= 28; day++) {
    const dayOfWeek = (day - 1) % 7;
    const isMonday = dayOfWeek === 0;
    const isTuesday = dayOfWeek === 1;
    const isWednesday = dayOfWeek === 2;
    const isThursday = dayOfWeek === 3;
    const isFriday = dayOfWeek === 4;
    const isSaturday = dayOfWeek === 5;
    const isSunday = dayOfWeek === 6;
    const isWeekday = dayOfWeek >= 0 && dayOfWeek <= 4;

    /*
      Prestige Sydney service:
      Outbound Friday mid-morning.
      Return Sunday mid-afternoon Sydney time.
      Aircraft: SyberJet SJ30i, 6 passengers.
    */
    if (isFriday) {
      addFlight(
        flights,
        "DFA101",
        "NZNE",
        "YSSY",
        day,
        "10:30",
        "+12:00",
        day,
        "12:30",
        "+10:00",
        "SJ30I",
        1850
      );
    }

    if (isSunday) {
      addFlight(
        flights,
        "DFA102",
        "YSSY",
        "NZNE",
        day,
        "15:30",
        "+10:00",
        day,
        "21:00",
        "+12:00",
        "SJ30I",
        1850
      );
    }

    /*
      Rotorua weekday shuttle:
      Twice every weekday Monday to Friday.
      First return shortly after arrival.
      Second departure late afternoon, return evening.
      Aircraft: Cirrus SF50 Jet A, 4 passengers.
    */
    if (isWeekday) {
      addFlight(
        flights,
        "DFA201",
        "NZNE",
        "NZRO",
        day,
        "07:00",
        "+12:00",
        day,
        "08:00",
        "+12:00",
        "SF50-A",
        320
      );

      addFlight(
        flights,
        "DFA202",
        "NZRO",
        "NZNE",
        day,
        "08:45",
        "+12:00",
        day,
        "09:50",
        "+12:00",
        "SF50-A",
        320
      );

      addFlight(
        flights,
        "DFA203",
        "NZNE",
        "NZRO",
        day,
        "16:30",
        "+12:00",
        day,
        "17:30",
        "+12:00",
        "SF50-A",
        340
      );

      addFlight(
        flights,
        "DFA204",
        "NZRO",
        "NZNE",
        day,
        "18:15",
        "+12:00",
        day,
        "19:20",
        "+12:00",
        "SF50-A",
        340
      );
    }

    /*
      Great Barrier Island / Claris service:
      Outbound Monday, Wednesday, Friday morning.
      Return Tuesday, Thursday, Saturday morning.
      Aircraft: Cirrus SF50 Jet B, 4 passengers.
    */
    if (isMonday || isWednesday || isFriday) {
      addFlight(
        flights,
        "DFA301",
        "NZNE",
        "NZGB",
        day,
        "09:00",
        "+12:00",
        day,
        "09:35",
        "+12:00",
        "SF50-B",
        250
      );
    }

    if (isTuesday || isThursday || isSaturday) {
      addFlight(
        flights,
        "DFA302",
        "NZGB",
        "NZNE",
        day,
        "10:00",
        "+12:00",
        day,
        "10:40",
        "+12:00",
        "SF50-B",
        250
      );
    }

    /*
      Chatham Islands / Tuuta service:
      Outbound Tuesday and Friday.
      Return Wednesday and Saturday.
      Chatham Islands use GMT+12:45.
      Aircraft: HondaJet Elite A, 5 passengers.
    */
    if (isTuesday || isFriday) {
      addFlight(
        flights,
        "DFA401",
        "NZNE",
        "NZCI",
        day,
        "09:30",
        "+12:00",
        day,
        "12:45",
        "+12:45",
        "HJET-A",
        980
      );
    }

    if (isWednesday || isSaturday) {
      addFlight(
        flights,
        "DFA402",
        "NZCI",
        "NZNE",
        day,
        "10:00",
        "+12:45",
        day,
        "12:45",
        "+12:00",
        "HJET-A",
        980
      );
    }

    /*
      Lake Tekapo service:
      Outbound Monday.
      Return Tuesday.
      Aircraft: HondaJet Elite B, 5 passengers.
    */
    if (isMonday) {
      addFlight(
        flights,
        "DFA501",
        "NZNE",
        "NZTL",
        day,
        "10:00",
        "+12:00",
        day,
        "11:30",
        "+12:00",
        "HJET-B",
        620
      );
    }

    if (isTuesday) {
      addFlight(
        flights,
        "DFA502",
        "NZTL",
        "NZNE",
        day,
        "13:00",
        "+12:00",
        day,
        "14:40",
        "+12:00",
        "HJET-B",
        620
      );
    }
  }

  return flights;
}

export const scheduledFlights: ScheduledFlight[] = generateScheduledFlights();