import ReviewScreen from "@/components/screens/Review";
import { readState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Page() {
  const state = readState();
  return <ReviewScreen tasks={state.task} />;
}
