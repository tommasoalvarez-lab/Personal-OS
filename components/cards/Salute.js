import { Card } from "@/components/Grid";

const HEIGHTS = [40, 55, 30, 70, 60, 80, 65];

export default function Salute() {
  return (
    <Card id="id-salute" title="Salute" question="Come sta andando il mese" span={4}>
      <div className="salute-chart">
        {HEIGHTS.map((h, i) => (
          <div className="salute-bar" key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="salute-caption">Media 1.980 kcal · 26 giorni registrati</div>
    </Card>
  );
}
