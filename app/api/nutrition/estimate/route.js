import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { updateDailyLog } from "@/lib/store";
import { todayISO } from "@/lib/date";
import { estimateMeal } from "@/lib/nutrition";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const descrizione = typeof body?.descrizione === "string" ? body.descrizione.trim() : "";
  if (!descrizione) {
    return NextResponse.json({ error: "descrizione mancante" }, { status: 400 });
  }

  const stima = await estimateMeal(descrizione);
  const today = todayISO();
  const orario = new Intl.DateTimeFormat("it-IT", {
    timeZone: process.env.USER_TIMEZONE || "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const log = updateDailyLog(today, (current) => ({
    ...current,
    pasti: [
      ...current.pasti,
      {
        id: crypto.randomUUID(),
        orario,
        nome: stima.nome,
        calorie: stima.calorie,
        proteine: stima.proteine,
        carboidrati: stima.carboidrati,
        grassi: stima.grassi,
        stimato: stima.stimato,
      },
    ],
  }));

  return NextResponse.json({ log });
}
