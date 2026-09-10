import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readState } from "@/lib/store";
import { shiftISO, todayISO } from "@/lib/date";

export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `Rispondi in italiano a domande sui dati personali dell'utente di PersonalOS,
usando SOLO il contesto JSON fornito. Cita sempre da quale voce del contesto arriva ogni
affermazione (es. "dalla memoria del 3 marzo", "da un task nel CRM"). Se un dato che ti viene
chiesto non è nel contesto, dillo esplicitamente ("non ne ho traccia") invece di inventarlo o
di dedurlo. Rispondi in poche frasi, senza premesse.`;

// Percorso Locale: passa tutto il contesto disponibile al modello — con
// poche centinaia di voci è più semplice ed efficace di dieci frammenti
// scelti da un algoritmo che non sa cosa stai chiedendo davvero.
function buildContext(state) {
  const from = shiftISO(todayISO(), -29);
  const logRecenti = Object.values(state.logGiornalieri).filter((l) => l.data >= from);
  const persone = [...new Set(state.task.map((t) => t.persona).filter(Boolean))];

  return {
    profilo: state.profilo,
    memoria: state.memoria,
    cattureRecenti: state.catture.slice(0, 100),
    obiettivi: state.obiettivi,
    persone,
    saluteUltimi30Giorni: logRecenti,
  };
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const domanda = typeof body?.domanda === "string" ? body.domanda.trim() : "";
  if (!domanda) {
    return NextResponse.json({ error: "domanda mancante" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { risposta: "Non posso rispondere alle domande senza una chiave ANTHROPIC_API_KEY configurata." },
      { status: 200 }
    );
  }

  const state = readState();
  const contesto = buildContext(state);

  try {
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
    const response = await client.messages.create({
      model,
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Contesto:\n${JSON.stringify(contesto)}\n\nDomanda: ${domanda}`,
        },
      ],
    });
    const risposta = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    return NextResponse.json({ risposta: risposta || "Non ho una risposta." });
  } catch (err) {
    console.error("ask: chiamata al modello fallita —", err.message);
    return NextResponse.json(
      { risposta: "Non sono riuscito a rispondere adesso — riprova tra poco." },
      { status: 200 }
    );
  }
}
