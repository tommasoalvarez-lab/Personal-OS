import { Card } from "@/components/Grid";

const TASKS = [
  { fascia: "late", label: "In ritardo", title: "Richiamare Marco per il preventivo", persona: "Marco Bianchi" },
  { fascia: "today", label: "Oggi", title: "Inviare fattura commercialista", persona: "—" },
  { fascia: "today", label: "Oggi", title: "Confermare appuntamento dentista", persona: "—" },
];

export default function Session() {
  return (
    <Card id="id-session" title="Session" span={8}>
      <div className="session-greeting">Buongiorno, Tommaso</div>
      <div className="session-clock">09:24 · lunedì 8 settembre</div>
      {TASKS.map((t, i) => (
        <div className="session-task" key={i}>
          <span className={`badge badge-${t.fascia}`}>{t.label}</span>
          <span>{t.title}</span>
          <span className="task-person">{t.persona}</span>
        </div>
      ))}
    </Card>
  );
}
