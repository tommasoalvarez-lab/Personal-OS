import Link from "next/link";
import { Card } from "@/components/Grid";
import { compareISO, todayISO } from "@/lib/date";

function daysSince(iso) {
  const created = iso.slice(0, 10);
  const today = todayISO();
  const ms = new Date(today).getTime() - new Date(created).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

// Un filtro sul CRM, niente dato nuovo: gli elementi in ritardo, ordinati
// per anzianità. La domanda a cui risponde è "cosa è fermo, e per colpa di chi".
export default function Blocchi({ tasks }) {
  const bloccati = tasks
    .filter((t) => t.fascia === "ritardo" && !t.dataCompletamento)
    .sort((a, b) => compareISO(a.dataCreazione, b.dataCreazione));

  return (
    <Card id="id-blocchi" title="Blocchi" question="Cosa è fermo, e da quanto" span={4}>
      {bloccati.length === 0 && <p className="card-question" style={{ marginBottom: 0 }}>Niente fermo</p>}
      {bloccati.map((t) => (
        <Link href={`/crm?open=${t.id}`} className="blocco-row" key={t.id}>
          {t.titolo}
          {t.persona && <span style={{ color: "var(--text-faint)", fontSize: 11 }}>{t.persona}</span>}
          <span className="blocco-age">{daysSince(t.dataCreazione)}g</span>
        </Link>
      ))}
    </Card>
  );
}
