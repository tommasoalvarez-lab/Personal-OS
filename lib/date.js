// Unica funzione che risponde a "che giorno è oggi", nel fuso dell'utente.
// Chiamata ovunque serva una data: chiave del log, azzeramenti, istantanee.
// Mai new Date() sparso nel codice, mai l'ora del server: il server è in UTC
// e "oggi" calcolato lì scade a mezzanotte mentre in Italia è ancora ieri sera.

const DEFAULT_TIMEZONE = "Europe/Rome";

function timezone() {
  return process.env.USER_TIMEZONE || DEFAULT_TIMEZONE;
}

// "YYYY-MM-DD" nel fuso dell'utente, per un istante dato (default: adesso).
export function todayISO(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

// Confronto tra due date ISO "YYYY-MM-DD" senza passare da Date (evita fusi).
export function compareISO(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

// N giorni indietro rispetto a un giorno ISO, restituito come ISO.
export function shiftISO(dateISO, days) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

// I sette giorni Lunedì-Domenica della settimana che contiene dateISO.
export function currentWeekDates(dateISO) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Dom..6=Sab
  const isoDow = dow === 0 ? 7 : dow; // 1=Lun..7=Dom
  const monday = shiftISO(dateISO, -(isoDow - 1));
  return Array.from({ length: 7 }, (_, i) => shiftISO(monday, i));
}
