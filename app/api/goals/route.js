import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { updateState } from "@/lib/store";

export const dynamic = "force-dynamic";

// Gli obiettivi non si azzerano mai da soli: nessuna logica qui è legata a
// una data o al cambio di settimana/mese. Si chiudono o si rimuovono a mano.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { action, list, id, nome, progresso } = body || {};

  if (!["settimana", "mese"].includes(list)) {
    return NextResponse.json({ error: "lista non valida" }, { status: 400 });
  }

  const state = updateState((current) => {
    const items = current.obiettivi[list];
    let nextItems = items;

    if (action === "add") {
      const testo = (nome || "").trim();
      if (!testo) return current;
      nextItems = [
        ...items,
        { id: crypto.randomUUID(), nome: testo, fatto: false, progresso: progresso || null },
      ];
    } else if (action === "toggle") {
      nextItems = items.map((g) => (g.id === id ? { ...g, fatto: !g.fatto } : g));
    } else if (action === "remove") {
      nextItems = items.filter((g) => g.id !== id);
    } else {
      return current;
    }

    return { ...current, obiettivi: { ...current.obiettivi, [list]: nextItems } };
  });

  return NextResponse.json({ obiettivi: state.obiettivi });
}
