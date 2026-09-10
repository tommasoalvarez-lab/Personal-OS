import { Screen, Grid, Card } from "@/components/Grid";
import { shiftISO, todayISO, compareISO } from "@/lib/date";
import { sortTasks } from "@/lib/tasks";

// Nessun dato nuovo, nessuna chiamata al modello: solo le altre schede
// rilette insieme. Il riassunto automatico è un'estensione della Parte 9.
export default function ReviewScreen({ tasks }) {
  const settimanaFa = shiftISO(todayISO(), -6);

  const chiusi = tasks
    .filter((t) => t.dataCompletamento && compareISO(t.dataCompletamento.slice(0, 10), settimanaFa) >= 0)
    .sort((a, b) => compareISO(b.dataCompletamento, a.dataCompletamento));

  const slittati = tasks.filter((t) => t.fascia === "ritardo" && !t.dataCompletamento);

  const aperti = tasks.filter((t) => !t.dataCompletamento);
  const priorita = sortTasks(aperti).slice(0, 3);

  return (
    <Screen>
      <Grid>
        <Card title="Chiuso questa settimana" span={6}>
          <div className="review-list">
            {chiusi.length === 0 && <div className="review-empty">Niente chiuso ancora questa settimana</div>}
            {chiusi.map((t) => (
              <div className="review-item" key={t.id}>
                ✓ {t.titolo}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Slittato" span={6}>
          <div className="review-list">
            {slittati.length === 0 && <div className="review-empty">Niente in ritardo</div>}
            {slittati.map((t) => (
              <div className="review-item" key={t.id}>
                {t.titolo} {t.persona ? `— ${t.persona}` : ""}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Le tre priorità della prossima settimana" span={12}>
          {priorita.length === 0 && <div className="review-empty">Niente in sospeso</div>}
          {priorita.map((t, i) => (
            <div className="review-priority" key={t.id}>
              <div className="rp-num">{i + 1}</div> {t.titolo}
            </div>
          ))}
        </Card>
      </Grid>
    </Screen>
  );
}
