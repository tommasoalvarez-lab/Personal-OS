// Parser iCal in puro JavaScript — niente librerie: alcune si appoggiano a
// funzioni native di Node che il bundler serverless rompe in fase di deploy,
// con errori che non c'entrano niente col calendario (Parte 8).

const WEEKDAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function unfold(text) {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function parseProperty(line) {
  const colon = line.indexOf(":");
  if (colon === -1) return null;
  const left = line.slice(0, colon);
  const value = line.slice(colon + 1);
  const [name, ...paramParts] = left.split(";");
  const params = {};
  for (const p of paramParts) {
    const eq = p.indexOf("=");
    if (eq > -1) params[p.slice(0, eq)] = p.slice(eq + 1);
  }
  return { name, params, value };
}

// Converte un'ora "civile" (i numeri scritti nell'ICS) in un istante UTC,
// interpretandola nel fuso dato — senza un database di fusi, sfruttando
// Intl per scoprire l'offset di quella zona in quell'istante.
function zonedTimeToUtc(y, m, d, hh, mm, ss, timeZone) {
  const guess = new Date(Date.UTC(y, m - 1, d, hh, mm, ss));
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(guess).map((p) => [p.type, p.value]));
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  const diff = asUTC - guess.getTime();
  return new Date(guess.getTime() - diff);
}

function parseDateValue(prop, defaultTimeZone) {
  const value = prop.value.trim();
  const isDateOnly = /^\d{8}$/.test(value);
  if (isDateOnly) {
    const y = Number(value.slice(0, 4));
    const m = Number(value.slice(4, 6));
    const d = Number(value.slice(6, 8));
    return { date: new Date(Date.UTC(y, m - 1, d)), allDay: true };
  }
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!match) return null;
  const [, y, m, d, hh, mm, ss, z] = match;
  if (z) {
    return {
      date: new Date(Date.UTC(+y, +m - 1, +d, +hh, +mm, +ss)),
      allDay: false,
    };
  }
  const tz = prop.params.TZID || defaultTimeZone;
  return { date: zonedTimeToUtc(+y, +m, +d, +hh, +mm, +ss, tz), allDay: false };
}

function parseRRule(value) {
  const rule = {};
  for (const part of value.split(";")) {
    const [k, v] = part.split("=");
    rule[k] = v;
  }
  return rule;
}

export function parseICal(text, defaultTimeZone) {
  const lines = unfold(text).split("\n").filter(Boolean);
  const events = [];
  let current = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = { exdates: [] };
      continue;
    }
    if (line === "END:VEVENT") {
      if (current?.start) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;

    const prop = parseProperty(line);
    if (!prop) continue;

    if (prop.name === "DTSTART") {
      const parsed = parseDateValue(prop, defaultTimeZone);
      if (parsed) {
        current.start = parsed.date;
        current.allDay = parsed.allDay;
      }
    } else if (prop.name === "DTEND") {
      const parsed = parseDateValue(prop, defaultTimeZone);
      if (parsed) current.end = parsed.date;
    } else if (prop.name === "SUMMARY") {
      current.summary = prop.value.replace(/\\,/g, ",").replace(/\\n/gi, " ");
    } else if (prop.name === "RRULE") {
      current.rrule = parseRRule(prop.value);
    } else if (prop.name === "EXDATE") {
      const parsed = parseDateValue(prop, defaultTimeZone);
      if (parsed) current.exdates.push(parsed.date.getTime());
    } else if (prop.name === "UID") {
      current.uid = prop.value;
    }
  }

  return events;
}

// Espande le regole di ripetizione su una finestra limitata: una regola
// "ogni lunedì" senza data di fine genera occorrenze all'infinito.
export function expandRecurring(events, windowStart, windowEnd) {
  const out = [];

  for (const ev of events) {
    if (!ev.rrule) {
      if (ev.start >= windowStart && ev.start <= windowEnd) {
        out.push({ start: ev.start, end: ev.end, summary: ev.summary, allDay: ev.allDay });
      }
      continue;
    }

    const freq = ev.rrule.FREQ;
    const interval = Number(ev.rrule.INTERVAL || 1);
    const count = ev.rrule.COUNT ? Number(ev.rrule.COUNT) : null;
    const until = ev.rrule.UNTIL ? parseDateValue({ value: ev.rrule.UNTIL, params: {} }, "UTC")?.date : null;
    // Senza BYDAY esplicito, il giorno implicito è quello di DTSTART.
    const byday = ev.rrule.BYDAY ? ev.rrule.BYDAY.split(",") : [WEEKDAY_CODES[ev.start.getUTCDay()]];
    const durationMs = ev.end ? ev.end.getTime() - ev.start.getTime() : 0;
    const exdateSet = new Set(ev.exdates || []);

    let occurrences = 0;
    let cursor = new Date(ev.start.getTime());
    let guard = 0;

    // Nota: l'INTERVAL su FREQ=WEEKLY (es. "ogni due settimane") non è
    // rispettato — qui si accetta ogni settimana che tocca un BYDAY. Va bene
    // per un'anteprima del calendario, non per un motore di ricorrenze.
    while (cursor <= windowEnd && guard < 3000) {
      guard++;
      if (count !== null && occurrences >= count) break;
      if (until && cursor > until) break;

      const dayCode = WEEKDAY_CODES[cursor.getUTCDay()];
      const matchesDay = freq !== "WEEKLY" || byday.includes(dayCode);

      if (matchesDay) {
        occurrences++;
        if (cursor >= windowStart && cursor <= windowEnd && !exdateSet.has(cursor.getTime())) {
          out.push({
            start: new Date(cursor),
            end: new Date(cursor.getTime() + durationMs),
            summary: ev.summary,
            allDay: ev.allDay,
          });
        }
      }

      if (freq === "DAILY") {
        cursor = new Date(cursor.getTime() + interval * 86400000);
      } else if (freq === "WEEKLY") {
        cursor = new Date(cursor.getTime() + 86400000);
      } else if (freq === "MONTHLY") {
        const d = new Date(cursor);
        d.setUTCMonth(d.getUTCMonth() + interval);
        cursor = d;
      } else {
        break; // FREQ non supportata (es. YEARLY): meglio ometterla che sbagliarla
      }
    }
  }

  return out.sort((a, b) => a.start - b.start);
}

let cache = { url: null, expiresAt: 0, data: null };

// Cache in memoria per cinque minuti: il feed non cambia da un secondo
// all'altro, e riscaricarlo a ogni occhiata è lavoro sprecato.
export async function getCalendarWeek(timezone) {
  const url = process.env.GOOGLE_CALENDAR_ICAL_URL;
  if (!url) {
    return { connected: false, events: [] };
  }

  const now = Date.now();
  if (cache.url === url && cache.data && now < cache.expiresAt) {
    return cache.data;
  }

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`impossibile leggere il calendario (${res.status})`);
  }
  const text = await res.text();
  const events = parseICal(text, timezone);

  const windowStart = new Date();
  windowStart.setUTCHours(0, 0, 0, 0);
  const windowEnd = new Date(windowStart.getTime() + 14 * 86400000);

  const expanded = expandRecurring(events, windowStart, windowEnd);
  const data = { connected: true, events: expanded };

  cache = { url, expiresAt: now + 5 * 60 * 1000, data };
  return data;
}
