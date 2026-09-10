import Anthropic from "@anthropic-ai/sdk";

// Le sette destinazioni di cattura. Elenco canonico: vive solo qui.
export const DESTINAZIONI = [
  "task",
  "persone",
  "finanze",
  "nutrizione",
  "salute",
  "obiettivi",
  "memoria",
];

const URGENZE = ["oggi", "settimana", "piu-avanti"];

// Modello per lo smistamento: veloce ed economico, non serve ragionamento esteso.
// Sovrascrivibile con ANTHROPIC_MODEL senza toccare il codice.
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `Sei il classificatore di PersonalOS, un sistema personale per una persona sola.
Ricevi una frase buttata lì e decidi dove va archiviata.

Le destinazioni possibili sono esattamente queste sette, non inventarne altre:
- task: il generico "da fare", per tutto quello che non ha una casa più precisa
- persone: qualcosa che riguarda una persona specifica (chiamare, rispondere, un impegno con qualcuno)
- finanze: spese, fatture, pagamenti, soldi
- nutrizione: cosa è stato mangiato
- salute: allenamento, peso, sintomi, appuntamenti medici
- obiettivi: una promessa fatta a se stessi, un traguardo
- memoria: un pensiero, una riflessione, un'informazione da ricordare senza altra casa

Rispondi SOLO con un oggetto JSON, senza testo prima o dopo, in questa forma esatta:
{"destinazione": "una delle sette sopra", "titolo": "riformulazione breve della frase", "persona": "nome della persona se presente, altrimenti null", "urgenza": "oggi, settimana, o piu-avanti"}

Se l'urgenza non è chiara dal testo, usa "oggi". Non usare mai "in ritardo": non è un valore di ingresso, ci si finisce col tempo.`;

// Rete di sicurezza: se il modello non risponde, la cattura non fallisce mai — smista peggio, non si perde.
function ruleBasedClassify(text) {
  const t = text.toLowerCase();
  let destinazione = "task";

  if (/€|\beuro\b|fattura|bolletta|stipendio|conto corrente|pagare|pagat[oa]|spesa\b/.test(t)) {
    destinazione = "finanze";
  } else if (/mangiat[oa]|pranzo|cena|colazione|kcal|calorie|spuntino/.test(t)) {
    destinazione = "nutrizione";
  } else if (/allenamento|palestra|dottore|medic[oa]|farmaco|dolore|peso\b/.test(t)) {
    destinazione = "salute";
  } else if (/obiettivo|promesso|voglio riuscire|entro (la|il)/.test(t)) {
    destinazione = "obiettivi";
  } else if (/pensiero|riflessione|idea|ricorda(rmi|ti)? che/.test(t)) {
    destinazione = "memoria";
  } else if (/chiamare|richiamare|rispondere a|scrivere a|messaggio a/.test(t)) {
    destinazione = "persone";
  }

  return {
    destinazione,
    titolo: text.length > 80 ? text.slice(0, 77) + "..." : text,
    persona: null,
    urgenza: "oggi",
  };
}

function extractJson(raw) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("nessun JSON nella risposta del modello");
  return JSON.parse(match[0]);
}

// Riceve un testo, restituisce { destinazione, titolo, persona, urgenza, via }.
// "via" dice come è stata classificata: modello, o regole (rete di sicurezza).
export async function classify(text) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return { ...ruleBasedClassify(text), via: "regole" };
  }

  try {
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

    const response = await client.messages.create({
      model,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const raw = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    const parsed = extractJson(raw);

    if (!DESTINAZIONI.includes(parsed.destinazione)) {
      throw new Error(`destinazione non valida dal modello: ${parsed.destinazione}`);
    }

    return {
      destinazione: parsed.destinazione,
      titolo: parsed.titolo || text.slice(0, 80),
      persona: parsed.persona || null,
      urgenza: URGENZE.includes(parsed.urgenza) ? parsed.urgenza : "oggi",
      via: "modello",
    };
  } catch (err) {
    console.error("classify: chiamata al modello fallita, ripiego su regole —", err.message);
    return { ...ruleBasedClassify(text), via: "regole" };
  }
}
