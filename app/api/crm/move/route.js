import { NextResponse } from "next/server";
import { updateState } from "@/lib/store";

export const dynamic = "force-dynamic";

// Un solo endpoint per il drag&drop: cambio fascia e riordino sono la stessa
// operazione, riscrivere le posizioni della fascia toccata con l'ordine dato.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const id = body?.id;
  const toFascia = body?.toFascia;
  const orderedIds = Array.isArray(body?.orderedIds) ? body.orderedIds : null;

  if (!id || !toFascia || !orderedIds) {
    return NextResponse.json({ error: "corpo non valido" }, { status: 400 });
  }

  updateState((current) => {
    const posById = new Map(orderedIds.map((tid, i) => [tid, i]));
    return {
      ...current,
      task: current.task.map((t) => {
        if (t.id === id) {
          return { ...t, fascia: toFascia, posizione: posById.get(id) ?? t.posizione };
        }
        if (posById.has(t.id)) {
          return { ...t, posizione: posById.get(t.id) };
        }
        return t;
      }),
    };
  });

  return NextResponse.json({ ok: true });
}
