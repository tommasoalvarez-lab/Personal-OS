import { NextResponse } from "next/server";
import { readState, updateDailyLog } from "@/lib/store";
import { todayISO } from "@/lib/date";
import { redistributeMacros } from "@/lib/nutrition";

export const dynamic = "force-dynamic";

// Cambi un macro -> le calorie si ricalcolano con la formula, all'istante.
// Cambi le calorie -> il modello ridistribuisce i macro. In entrambi i casi
// il pasto smette di essere "stimato": l'ha corretto una mano, non più solo il modello.
export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "corpo mancante" }, { status: 400 });
  }

  const today = todayISO();

  let redistributed = null;
  if ("calorie" in body) {
    const state = readState();
    const pasto = state.logGiornalieri[today]?.pasti.find((p) => p.id === id);
    if (pasto) {
      redistributed = await redistributeMacros(pasto.nome, Number(body.calorie));
    }
  }

  const log = updateDailyLog(today, (current) => ({
    ...current,
    pasti: current.pasti.map((p) => {
      if (p.id !== id) return p;
      if (redistributed) {
        return {
          ...p,
          calorie: Math.round(Number(body.calorie)),
          ...redistributed,
          stimato: false,
        };
      }
      const proteine = Number(body.proteine ?? p.proteine);
      const carboidrati = Number(body.carboidrati ?? p.carboidrati);
      const grassi = Number(body.grassi ?? p.grassi);
      const calorie = Math.round(4 * proteine + 4 * carboidrati + 9 * grassi);
      return { ...p, proteine, carboidrati, grassi, calorie, stimato: false };
    }),
  }));

  return NextResponse.json({ log });
}
