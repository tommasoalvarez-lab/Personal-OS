import Link from "next/link";
import { Card } from "@/components/Grid";
import LiveClock from "@/components/LiveClock";
import { topTasksToday } from "@/lib/tasks";

const FASCIA_BADGE = {
  ritardo: { label: "In ritardo", cls: "badge-late" },
  oggi: { label: "Oggi", cls: "badge-today" },
};

export default function Session({ nome, timezone, tasks }) {
  const top = topTasksToday(tasks);

  return (
    <Card id="id-session" title="Session" span={8}>
      <LiveClock timezone={timezone} name={nome} />
      {top.length === 0 && (
        <div className="session-task" style={{ cursor: "default" }}>
          Niente in scadenza oggi
        </div>
      )}
      {top.map((t) => {
        const badge = FASCIA_BADGE[t.fascia] || FASCIA_BADGE.oggi;
        return (
          <Link href={`/crm?open=${t.id}`} className="session-task" key={t.id}>
            <span className={`badge ${badge.cls}`}>{badge.label}</span>
            <span>{t.titolo}</span>
            <span className="task-person">{t.persona || "—"}</span>
          </Link>
        );
      })}
    </Card>
  );
}
