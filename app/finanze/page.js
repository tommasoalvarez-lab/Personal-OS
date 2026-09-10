import FinanzeScreen from "@/components/screens/Finanze";
import { readState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Page() {
  const state = readState();
  const timezone = process.env.USER_TIMEZONE || "Europe/Rome";
  return <FinanzeScreen snapshots={state.financeSnapshots} timezone={timezone} />;
}
