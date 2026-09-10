import { Card } from "@/components/Grid";

const MEALS = [
  { time: "08:10", name: "Yogurt e granola", kcal: 320 },
  { time: "13:05", name: "Pollo, riso, verdure", kcal: 610 },
  { time: "16:40", name: "Mela", kcal: 90 },
];

export default function Nutrizione() {
  return (
    <Card id="id-nutrizione" title="Nutrizione" question="Quanto ho mangiato oggi" span={4}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span>1.420 / 2.200 kcal</span>
      </div>
      <div className="macro-bar"><div style={{ width: "64%" }} /></div>
      <div className="macro-row"><span>P 78g</span><span>C 140g</span><span>G 42g</span></div>
      {MEALS.map((m) => (
        <div className="meal-row" key={m.time}>
          <time>{m.time}</time> {m.name}
          <span className="meal-kcal">{m.kcal}</span>
        </div>
      ))}
    </Card>
  );
}
