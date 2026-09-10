import HomeScreen from "@/components/screens/Home";
import { readState } from "@/lib/store";
import { todayISO, currentWeekDates } from "@/lib/date";
import { getCalendarWeek } from "@/lib/calendar";

// Legge sempre l'ultimo stato salvato: nessuna cache statica su una pagina
// che cambia ogni volta che arriva una cattura.
export const dynamic = "force-dynamic";

export default async function Page() {
  const state = readState();
  const timezone = process.env.USER_TIMEZONE || "Europe/Rome";
  const today = todayISO();
  const weekDates = currentWeekDates(today);

  let calendar = { connected: false, events: [] };
  try {
    const data = await getCalendarWeek(timezone);
    calendar = {
      connected: data.connected,
      events: data.events.map((e) => ({
        start: e.start.toISOString(),
        end: e.end.toISOString(),
        summary: e.summary,
        allDay: e.allDay,
      })),
    };
  } catch (err) {
    console.error("calendario: lettura fallita —", err.message);
    calendar = { connected: true, events: [] };
  }

  return (
    <HomeScreen state={state} timezone={timezone} today={today} calendar={calendar} weekDates={weekDates} />
  );
}
