"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Grid";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function timeOf(iso, timezone) {
  return new Intl.DateTimeFormat("it-IT", { timeZone: timezone, hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso)
  );
}

function dayOf(iso, timezone) {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export default function Calendario({ weekDates, today, events, connected, timezone }) {
  const [selected, setSelected] = useState(today);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      const key = dayOf(ev.start, timezone);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return map;
  }, [events, timezone]);

  const dayEvents = eventsByDay.get(selected) || [];

  if (!connected) {
    return (
      <Card id="id-calendario" title="Calendario" question="Cosa mi aspetta" span={8}>
        <p className="cal-empty">
          Nessun calendario collegato. Imposta GOOGLE_CALENDAR_ICAL_URL per vederlo qui.
        </p>
      </Card>
    );
  }

  return (
    <Card id="id-calendario" title="Calendario" question="Cosa mi aspetta" span={8}>
      <div className="cal-strip">
        {weekDates.map((date, i) => {
          const [, , d] = date.split("-");
          const isToday = date === today;
          return (
            <button
              key={date}
              className={`cal-day ${isToday ? "today" : ""} ${selected === date ? "active" : ""}`}
              onClick={() => setSelected(date)}
            >
              {DAY_LABELS[i]}
              <div className="cal-daynum">{Number(d)}</div>
            </button>
          );
        })}
      </div>
      <div className="cal-events">
        {dayEvents.length === 0 && <p className="cal-empty">Niente in programma</p>}
        {dayEvents.map((ev, i) => (
          <div className="cal-event" key={i}>
            <time>{ev.allDay ? "Tutto il giorno" : timeOf(ev.start, timezone)}</time> {ev.summary}
          </div>
        ))}
      </div>
    </Card>
  );
}
