import HomeScreen from "@/components/screens/Home";
import { readState } from "@/lib/store";
import { todayISO } from "@/lib/date";

// Legge sempre l'ultimo stato salvato: nessuna cache statica su una pagina
// che cambia ogni volta che arriva una cattura.
export const dynamic = "force-dynamic";

export default function Page() {
  const state = readState();
  const timezone = process.env.USER_TIMEZONE || "Europe/Rome";
  const today = todayISO();

  return <HomeScreen state={state} timezone={timezone} today={today} />;
}
