import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { updateState } from "@/lib/store";

export const dynamic = "force-dynamic";

const EDITABLE_FIELDS = ["titolo", "nota", "fascia", "temperatura", "persona", "tag"];

// Modifica un elemento del CRM per id — mai per posizione in lista, che
// mentre il pannello è aperto una cattura può spostare da sotto ai piedi.
export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "corpo mancante" }, { status: 400 });
  }

  let updated = null;
  updateState((current) => {
    const task = current.task.find((t) => t.id === id);
    if (!task) return current;

    const patch = {};
    for (const key of EDITABLE_FIELDS) {
      if (key in body) patch[key] = body[key];
    }
    // Completare non cancella: resta nei dati con la data di completamento.
    if ("completato" in body) {
      patch.dataCompletamento = body.completato ? new Date().toISOString() : null;
    }

    updated = { ...task, ...patch };
    const registro =
      "completato" in body
        ? [
            {
              id: crypto.randomUUID(),
              evento: body.completato ? "task-completato" : "task-riaperto",
              taskId: id,
              titolo: updated.titolo,
              timestamp: new Date().toISOString(),
            },
            ...current.registro,
          ]
        : current.registro;

    return {
      ...current,
      task: current.task.map((t) => (t.id === id ? updated : t)),
      registro,
    };
  });

  if (!updated) {
    return NextResponse.json({ error: "elemento non trovato" }, { status: 404 });
  }
  return NextResponse.json({ task: updated });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  updateState((current) => ({
    ...current,
    task: current.task.filter((t) => t.id !== id),
  }));
  return NextResponse.json({ ok: true });
}
