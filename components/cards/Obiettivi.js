import { Card } from "@/components/Grid";

const GOALS = [
  { name: "Chiudere pratica IVA", done: true },
  { name: "3 allenamenti", done: false, progress: "2/3" },
  { name: "Leggere 2 capitoli", done: false, progress: "1/2" },
];

export default function Obiettivi() {
  return (
    <Card id="id-obiettivi" title="Obiettivi" question="Cosa mi ero promesso" span={4}>
      {GOALS.map((g) => (
        <div className={`goal-row ${g.done ? "done" : ""}`} key={g.name}>
          <button className={`habit-check ${g.done ? "done" : ""}`}>✓</button>
          <span className="goal-name">{g.name}</span>
          {g.progress && <span className="goal-progress">{g.progress}</span>}
        </div>
      ))}
    </Card>
  );
}
