// Ordine di lettura del CRM: prima la fascia, poi la temperatura, poi la
// posizione manuale che l'utente ha dato trascinando le carte.
export const FASCE = ["ritardo", "oggi", "settimana", "piu-avanti"];
const TEMPERATURE = { caldo: 0, tiepido: 1, freddo: 2 };

export function fasciaRank(fascia) {
  const i = FASCE.indexOf(fascia);
  return i === -1 ? FASCE.length : i;
}

export function sortTasks(items) {
  return [...items].sort((a, b) => {
    const f = fasciaRank(a.fascia) - fasciaRank(b.fascia);
    if (f !== 0) return f;
    const t = (TEMPERATURE[a.temperatura] ?? 1) - (TEMPERATURE[b.temperatura] ?? 1);
    if (t !== 0) return t;
    return a.posizione - b.posizione;
  });
}

// I tre task che contano oggi: solo "in ritardo" e "oggi", non completati.
export function topTasksToday(tasks) {
  const aperti = tasks.filter(
    (t) => !t.dataCompletamento && (t.fascia === "ritardo" || t.fascia === "oggi")
  );
  return sortTasks(aperti).slice(0, 3);
}
