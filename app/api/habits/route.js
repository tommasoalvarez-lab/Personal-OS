import { NextResponse } from "next/server";
import { readState, updateDailyLog } from "@/lib/store";
import { todayISO } from "@/lib/date";

export const dynamic = "force-dynamic";

// Il clic spunta, incrementa, o azzera un contatore pieno. La data è sempre
// quella calcolata dal server in USER_TIMEZONE — mai una data mandata dal client.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const habitId = body?.habitId;
  if (!habitId) {
    return NextResponse.json({ error: "habitId mancante" }, { status: 400 });
  }

  const state = readState();
  const habit = state.profilo.abitudini.find((h) => h.id === habitId);
  if (!habit) {
    return NextResponse.json({ error: "abitudine sconosciuta" }, { status: 404 });
  }

  const today = todayISO();
  const log = updateDailyLog(today, (current) => {
    const abitudini = { ...current.abitudini };
    if (habit.tipo === "contatore") {
      const value = abitudini[habitId] || 0;
      abitudini[habitId] = value >= habit.obiettivo ? 0 : value + 1;
    } else {
      abitudini[habitId] = !abitudini[habitId];
    }
    return { ...current, abitudini };
  });

  return NextResponse.json({ log });
}
