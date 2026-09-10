import { Card } from "@/components/Grid";

const HABITS = [
  { name: "Allenamento", done: true, count: "fatto" },
  { name: "Lettura 20 min", done: true, count: "fatto" },
  { name: "Acqua", done: false, count: "5/8" },
  { name: "Deep work", done: false, count: "1/3" },
];

export default function Abitudini() {
  return (
    <Card id="id-abitudini" title="Abitudini" question="A che punto sono oggi" span={4}>
      <div
        className="habit-ring"
        style={{ background: `conic-gradient(var(--accent) 0% 62%, var(--border) 62% 100%)` }}
      >
        <span>62%</span>
      </div>
      {HABITS.map((h) => (
        <div className="habit-row" key={h.name}>
          <button className={`habit-check ${h.done ? "done" : ""}`}>✓</button>
          {h.name}
          <span className="habit-count">{h.count}</span>
        </div>
      ))}
    </Card>
  );
}
