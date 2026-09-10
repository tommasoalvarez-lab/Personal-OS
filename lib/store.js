import fs from "node:fs";
import path from "node:path";
import { compareISO } from "@/lib/date";

const DATA_DIR = path.join(process.cwd(), "data");
const STATE_PATH = path.join(DATA_DIR, "personalos.json");
const SEED_PATH = path.join(DATA_DIR, "seed.json");

function ensureStateFile() {
  if (!fs.existsSync(STATE_PATH)) {
    fs.copyFileSync(SEED_PATH, STATE_PATH);
  }
}

export function readState() {
  ensureStateFile();
  const raw = fs.readFileSync(STATE_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
  return state;
}

// Legge lo stato, applica la funzione, scrive il risultato. Restituisce lo stato nuovo.
export function updateState(updater) {
  const state = readState();
  const next = updater(state) ?? state;
  return writeState(next);
}

// Cancella la copia di lavoro e riparte dal seed intatto — il tasto di annullamento.
export function resetState() {
  fs.copyFileSync(SEED_PATH, STATE_PATH);
  return readState();
}

function emptyDailyLog(date) {
  return { data: date, abitudini: {}, pasti: [], finanze: null };
}

export function getDailyLog(date, state = readState()) {
  return state.logGiornalieri[date] || emptyDailyLog(date);
}

// Legge/aggiorna il log di una data, creando la riga se non esiste.
export function updateDailyLog(date, updater) {
  const state = updateState((current) => {
    const log = current.logGiornalieri[date] || emptyDailyLog(date);
    const nextLog = { ...(updater(log) ?? log), data: date };
    return {
      ...current,
      logGiornalieri: { ...current.logGiornalieri, [date]: nextLog },
    };
  });
  return state.logGiornalieri[date];
}

// Log giornalieri in un intervallo di date [fromDate, toDate], ordinati.
export function readDailyLogs(fromDate, toDate) {
  const state = readState();
  return Object.values(state.logGiornalieri)
    .filter(
      (log) => compareISO(log.data, fromDate) >= 0 && compareISO(log.data, toDate) <= 0
    )
    .sort((a, b) => compareISO(a.data, b.data));
}
