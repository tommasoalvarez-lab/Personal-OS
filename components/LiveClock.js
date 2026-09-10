"use client";

import { useEffect, useState } from "react";

function readNow(timezone) {
  const now = new Date();
  const time = new Intl.DateTimeFormat("it-IT", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
  const date = new Intl.DateTimeFormat("it-IT", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      hour12: false,
    }).format(now)
  );
  const saluto =
    hour < 5 ? "Buonanotte" : hour < 12 ? "Buongiorno" : hour < 18 ? "Buon pomeriggio" : "Buonasera";
  return { time, date, saluto };
}

// Saluto e orologio si disegnano solo lato client: se li calcolasse anche il
// server, le due versioni non coinciderebbero mai e React protesterebbe
// con un errore di hydration. Fino al montaggio si mostra un segnaposto.
export default function LiveClock({ timezone, name }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(readNow(timezone));
    const id = setInterval(() => setNow(readNow(timezone)), 30_000);
    return () => clearInterval(id);
  }, [timezone]);

  return (
    <>
      <div className="session-greeting">{now ? `${now.saluto}, ${name}` : `Ciao, ${name}`}</div>
      <div className="session-clock">{now ? `${now.time} · ${now.date}` : "--:--"}</div>
    </>
  );
}
