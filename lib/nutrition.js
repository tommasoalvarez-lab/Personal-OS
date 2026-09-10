import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

// Ripartizione di riserva se il modello non risponde: plausibile, non esatta.
function fallbackMacros(calorie) {
  return {
    proteine: Math.round((calorie * 0.25) / 4),
    carboidrati: Math.round((calorie * 0.45) / 4),
    grassi: Math.round((calorie * 0.3) / 9),
  };
}

function extractJson(raw) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("nessun JSON nella risposta");
  return JSON.parse(match[0]);
}

// Testo -> { calorie, proteine, carboidrati, grassi }. Sempre marcato "stimato".
export async function estimateMeal(descrizione) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { nome: descrizione, calorie: 400, ...fallbackMacros(400), stimato: true };
  }

  try {
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
    const response = await client.messages.create({
      model,
      max_tokens: 300,
      system:
        'Stimi calorie e macronutrienti di un pasto descritto in italiano. Rispondi SOLO con un oggetto JSON: {"calorie": numero, "proteine": grammi, "carboidrati": grammi, "grassi": grammi}. Sii plausibile, niente testo oltre al JSON.',
      messages: [{ role: "user", content: descrizione }],
    });
    const raw = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const parsed = extractJson(raw);
    return {
      nome: descrizione,
      calorie: Math.round(parsed.calorie),
      proteine: Math.round(parsed.proteine),
      carboidrati: Math.round(parsed.carboidrati),
      grassi: Math.round(parsed.grassi),
      stimato: true,
    };
  } catch (err) {
    console.error("nutrition.estimateMeal: fallback —", err.message);
    return { nome: descrizione, calorie: 400, ...fallbackMacros(400), stimato: true };
  }
}

// Nome del pasto + nuove calorie -> macro coerenti con quelle calorie.
export async function redistributeMacros(nome, calorieDestinazione) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return fallbackMacros(calorieDestinazione);
  }

  try {
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
    const response = await client.messages.create({
      model,
      max_tokens: 300,
      system:
        'Ricevi il nome di un pasto e delle nuove calorie totali. Restituisci macronutrienti coerenti con quel tipo di pasto per quelle calorie. Rispondi SOLO con un oggetto JSON: {"proteine": grammi, "carboidrati": grammi, "grassi": grammi}.',
      messages: [{ role: "user", content: `Pasto: ${nome}\nCalorie totali: ${calorieDestinazione}` }],
    });
    const raw = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const parsed = extractJson(raw);
    return {
      proteine: Math.round(parsed.proteine),
      carboidrati: Math.round(parsed.carboidrati),
      grassi: Math.round(parsed.grassi),
    };
  } catch (err) {
    console.error("nutrition.redistributeMacros: fallback —", err.message);
    return fallbackMacros(calorieDestinazione);
  }
}
