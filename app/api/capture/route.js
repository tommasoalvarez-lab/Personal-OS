import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { classify } from "@/lib/classify";
import { updateState } from "@/lib/store";

// La cattura è l'unico gesto: arriva un testo, il resto lo fa il sistema.
// Non chiamata al caricamento di nessuna pagina — solo da qui, su richiesta.
export const dynamic = "force-dynamic";

function insertCrmItem(state, { titolo, persona, fascia }) {
  const aperti = state.task.filter((t) => t.fascia === fascia && !t.dataCompletamento);
  const minPos = aperti.length ? Math.min(...aperti.map((t) => t.posizione)) : 0;
  const item = {
    id: crypto.randomUUID(),
    titolo,
    nota: "",
    fascia,
    temperatura: "tiepido",
    persona: persona || null,
    tag: [],
    // entra in testa alla fascia, non in fondo
    posizione: minPos - 1,
    dataCreazione: new Date().toISOString(),
    dataCompletamento: null,
  };
  return { ...state, task: [...state.task, item] };
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const testo = typeof body?.testo === "string" ? body.testo.trim() : "";

  if (!testo) {
    return NextResponse.json({ error: "testo mancante" }, { status: 400 });
  }

  const result = await classify(testo);
  const now = new Date().toISOString();

  updateState((state) => {
    let next = {
      ...state,
      catture: [
        {
          id: crypto.randomUUID(),
          testoGrezzo: testo,
          provenienza: "dashboard",
          classificazione: result.destinazione,
          doveSmistata: result.destinazione,
          via: result.via,
          timestamp: now,
        },
        ...state.catture,
      ],
      memoria: [
        { id: crypto.randomUUID(), testo, provenienza: "cattura", timestamp: now },
        ...state.memoria,
      ],
    };

    // Le uniche due destinazioni con una scheda dedicata già pronta a riceverle:
    // task e persone finiscono entrambe nella lavagna del CRM.
    if (result.destinazione === "task" || result.destinazione === "persone") {
      next = insertCrmItem(next, {
        titolo: result.titolo,
        persona: result.persona,
        fascia: result.urgenza,
      });
    }

    return next;
  });

  return NextResponse.json({
    destinazione: result.destinazione,
    titolo: result.titolo,
    via: result.via,
  });
}
