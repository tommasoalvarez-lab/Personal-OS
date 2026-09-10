"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Grid";
import { formatCurrency } from "@/lib/format";

function closestSnapshotAtLeastDaysAgo(snapshots, days) {
  if (snapshots.length < 2) return null;
  const target = Date.now() - days * 86400000;
  let best = null;
  for (const s of snapshots) {
    const t = new Date(s.timestamp).getTime();
    if (t <= target && (!best || t > new Date(best.timestamp).getTime())) {
      best = s;
    }
  }
  return best;
}

export default function Polso({ financeSnapshots, timezone }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const last = financeSnapshots.length ? financeSnapshots[financeSnapshots.length - 1] : null;
  const prev30 = last ? closestSnapshotAtLeastDaysAgo(financeSnapshots, 30) : null;

  async function refresh() {
    setLoading(true);
    try {
      await fetch("/api/finance/refresh", { method: "POST" });
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  if (!last || last.patrimonioNetto === null) {
    return (
      <Card id="id-polso" title="Polso finanziario" question="Sto salendo o scendendo" span={4}>
        <p className="fin-empty">Nessuna estrazione ancora.</p>
        {last?.note && <div className="polso-note">{last.note}</div>}
        <button className="polso-refresh" onClick={refresh} disabled={loading}>
          {loading ? "estraggo..." : "Aggiorna"}
        </button>
      </Card>
    );
  }

  const delta = prev30 ? last.patrimonioNetto - prev30.patrimonioNetto : null;
  const oraAggiornamento = new Intl.DateTimeFormat("it-IT", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(last.timestamp));

  return (
    <Card id="id-polso" title="Polso finanziario" question="Sto salendo o scendendo" span={4}>
      <div className="polso-amount">{formatCurrency(last.patrimonioNetto)}</div>
      {delta !== null && (
        <div className={`polso-delta ${delta >= 0 ? "up" : "down"}`}>
          {delta >= 0 ? "▲" : "▼"} {formatCurrency(Math.abs(delta))} negli ultimi 30 giorni
        </div>
      )}
      <div className="polso-cats">
        {last.categorie.map((c) => (
          <div className="polso-cat" key={c.nome}>
            <span>{c.nome}</span>
            <span>{formatCurrency(c.valore)}</span>
          </div>
        ))}
      </div>
      {last.note && <div className="polso-note">{last.note}</div>}
      <button className="polso-refresh" onClick={refresh} disabled={loading}>
        {loading ? "estraggo..." : `Aggiornato alle ${oraAggiornamento}`}
      </button>
    </Card>
  );
}
