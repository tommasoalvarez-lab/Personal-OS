import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readState } from "@/lib/store";

export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

// La ricerca non si rompe mai: al massimo diventa un filtro testuale più stupido.
function fallbackSearch(items, domanda) {
  const q = domanda.toLowerCase();
  return items
    .filter((i) =>
      [i.titolo, i.persona, ...(i.tag || [])]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    )
    .map((i) => i.id);
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const domanda = typeof body?.domanda === "string" ? body.domanda.trim() : "";
  if (!domanda) {
    return NextResponse.json({ ids: [] });
  }

  const state = readState();
  const aperti = state.task.filter((t) => !t.dataCompletamento);
  const compact = aperti.map((t) => ({
    id: t.id,
    titolo: t.titolo,
    fascia: t.fascia,
    persona: t.persona,
    tag: t.tag,
  }));

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ids: fallbackSearch(aperti, domanda), via: "regole" });
  }

  try {
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
    const response = await client.messages.create({
      model,
      max_tokens: 500,
      system:
        'Ricevi una lista compatta di elementi CRM in JSON e una domanda in linguaggio naturale su quegli elementi. Rispondi SOLO con un oggetto JSON nella forma {"ids": ["...", ...]}, con gli id degli elementi pertinenti alla domanda, in ordine di pertinenza. Se nessuno è pertinente, {"ids": []}. Usa solo id presenti nella lista, non inventarne.',
      messages: [
        { role: "user", content: `Elementi:\n${JSON.stringify(compact)}\n\nDomanda: ${domanda}` },
      ],
    });
    const raw = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("nessun JSON nella risposta");
    const parsed = JSON.parse(match[0]);
    const validIds = new Set(compact.map((c) => c.id));
    const ids = Array.isArray(parsed.ids) ? parsed.ids.filter((id) => validIds.has(id)) : [];
    return NextResponse.json({ ids, via: "modello" });
  } catch (err) {
    console.error("crm/search: fallback su filtro testuale —", err.message);
    return NextResponse.json({ ids: fallbackSearch(aperti, domanda), via: "regole" });
  }
}
