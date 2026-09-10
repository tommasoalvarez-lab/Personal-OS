import { NextResponse } from "next/server";
import { updateState } from "@/lib/store";
import { extractFinance } from "@/lib/finance";

export const dynamic = "force-dynamic";

// L'unica chiamata che aggiorna il patrimonio: parte solo da qui, mai al
// caricamento della pagina. Ogni estrazione produce un'istantanea con la
// sua data; le istantanee non si buttano, accumulandosi diventano lo storico.
export async function POST() {
  const filePath = process.env.FINANCE_FILE_PATH;
  if (!filePath) {
    return NextResponse.json(
      { error: "FINANCE_FILE_PATH non impostata" },
      { status: 400 }
    );
  }

  let estrazione;
  try {
    estrazione = await extractFinance(filePath);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  const snapshot = {
    timestamp: new Date().toISOString(),
    ...estrazione,
  };

  const state = updateState((current) => ({
    ...current,
    financeSnapshots: [...current.financeSnapshots, snapshot],
  }));

  return NextResponse.json({ snapshot, financeSnapshots: state.financeSnapshots });
}
