import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

function sheetsToText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".csv") {
    return [{ nome: path.basename(filePath), testo: fs.readFileSync(filePath, "utf-8") }];
  }
  const workbook = XLSX.readFile(filePath);
  return workbook.SheetNames.map((nome) => ({
    nome,
    testo: XLSX.utils.sheet_to_csv(workbook.Sheets[nome]),
  }));
}

function noExtraction(motivo) {
  return { patrimonioNetto: null, valuta: "EUR", dataRiferimento: null, categorie: [], note: motivo };
}

function extractJson(raw) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("nessun JSON nella risposta del modello");
  return JSON.parse(match[0]);
}

const SYSTEM_PROMPT = `Estrai dati finanziari da un foglio di calcolo personale, dato come uno o più fogli in formato CSV.
Rispondi SOLO con un oggetto JSON in questa forma:
{"patrimonioNetto": numero, "valuta": "EUR" (o altra), "dataRiferimento": "YYYY-MM-DD" o null, "categorie": [{"nome": "...", "valore": numero, "tipo": "liquidita" o "investito" o "debito"}], "note": "eventuali ambiguità incontrate, altrimenti null"}

Regole importanti:
- Non contare due volte gli stessi importi: se ci sono un foglio di riepilogo e fogli di dettaglio per lo stesso conto, usa solo uno dei due.
- Da una tabella con più righe/date per lo stesso conto (uno storico), usa solo la riga più recente.
- Se qualcosa è ambiguo o non torna, scrivilo nel campo note invece di indovinare in silenzio.`;

// Legge il file locale (xlsx o csv), lo manda al modello, restituisce
// un'estrazione validata. Non salva nulla: lo fa il chiamante.
export async function extractFinance(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`file non trovato: ${filePath}`);
  }

  const fogli = sheetsToText(filePath);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return noExtraction("Chiave ANTHROPIC_API_KEY assente: nessuna estrazione, imposta la variabile per leggere il foglio.");
  }

  try {
    const client = new Anthropic({ apiKey });
    const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
    const testoFogli = fogli.map((f) => `--- Foglio: ${f.nome} ---\n${f.testo}`).join("\n\n").slice(0, 100_000);

    const response = await client.messages.create({
      model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: testoFogli }],
    });
    const raw = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const parsed = extractJson(raw);

    if (typeof parsed.patrimonioNetto !== "number") {
      throw new Error("il modello non ha restituito un patrimonioNetto numerico");
    }

    return {
      patrimonioNetto: parsed.patrimonioNetto,
      valuta: parsed.valuta || "EUR",
      dataRiferimento: parsed.dataRiferimento || null,
      categorie: Array.isArray(parsed.categorie) ? parsed.categorie : [],
      note: parsed.note || null,
    };
  } catch (err) {
    console.error("finance.extractFinance: estrazione fallita —", err.message);
    return noExtraction(`Estrazione fallita: ${err.message}`);
  }
}
