import { shiftISO } from "@/lib/date";

function isDayDone(log, abitudini) {
  if (!log) return false;
  return abitudini.some((h) => {
    const v = log.abitudini?.[h.id];
    return h.tipo === "contatore" ? (v || 0) >= (h.obiettivo || 1) : v === true;
  });
}

// Giorni consecutivi con almeno un'abitudine completata, contando all'indietro.
// Oggi non ancora completato non rompe la striscia: potrebbe ancora succedere.
export function computeStreak(logGiornalieri, today, abitudini) {
  let date = today;
  if (!isDayDone(logGiornalieri[date], abitudini)) {
    date = shiftISO(date, -1);
  }
  let streak = 0;
  while (isDayDone(logGiornalieri[date], abitudini)) {
    streak++;
    date = shiftISO(date, -1);
  }
  return streak;
}

// Percentuale di completamento del giorno: spunte piene, contatori in proporzione.
export function completionPercent(log, abitudini) {
  if (!abitudini.length) return 0;
  const values = abitudini.map((h) => {
    const v = log?.abitudini?.[h.id];
    if (h.tipo === "contatore") {
      return Math.min(1, (v || 0) / (h.obiettivo || 1));
    }
    return v === true ? 1 : 0;
  });
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / abitudini.length) * 100);
}
