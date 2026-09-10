import CrmScreen from "@/components/screens/Crm";
import { readState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  const state = readState();
  const sp = await searchParams;
  const openId = typeof sp?.open === "string" ? sp.open : null;

  return <CrmScreen tasks={state.task} initialOpenId={openId} />;
}
