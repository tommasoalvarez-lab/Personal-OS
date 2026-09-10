import { Card } from "@/components/Grid";
import { computeStreak } from "@/lib/habits";

export default function Operator({ profilo, logGiornalieri, today }) {
  const iniziali = profilo.nome
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const streak = computeStreak(logGiornalieri, today, profilo.abitudini);

  return (
    <Card id="id-operator" title="Operator" span={4}>
      <div className="op-row">
        <div className="op-avatar">{iniziali}</div>
        <div>
          <div className="op-name">{profilo.nome}</div>
          <div className="op-meta">
            {profilo.ruolo} · {profilo.citta}
          </div>
        </div>
      </div>
      <div className="op-meta" style={{ marginTop: 12 }}>
        Focus di oggi: <strong>{profilo.focusDelGiorno || "—"}</strong>
      </div>
      {streak > 0 && (
        <div className="op-streak">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2c2 4-2 5-2 9a4 4 0 0 0 8 0c0-1-.5-2-1-3 1 0 3 2 3 6a8 8 0 1 1-16 0c0-5 4-6 4-9 0-1 1-2 4-3z" />
          </svg>
          {streak} {streak === 1 ? "giorno" : "giorni"} di fila con almeno un&apos;abitudine
        </div>
      )}
    </Card>
  );
}
