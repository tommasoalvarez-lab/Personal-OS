"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, Grid, Card } from "@/components/Grid";
import { formatCurrency } from "@/lib/format";

const TIPO_COLOR = {
  liquidita: "var(--blue)",
  investito: "var(--accent)",
  debito: "var(--red)",
};

function closestAtLeastDaysAgo(snapshots, days) {
  if (snapshots.length < 2) return null;
  const target = Date.now() - days * 86400000;
  let best = null;
  for (const s of snapshots) {
    const t = new Date(s.timestamp).getTime();
    if (t <= target && (!best || t > new Date(best.timestamp).getTime())) best = s;
  }
  return best;
}

export default function FinanzeScreen({ snapshots, timezone }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const last = snapshots.length ? snapshots[snapshots.length - 1] : null;
  const prev30 = last ? closestAtLeastDaysAgo(snapshots, 30) : null;
  const prevYear = last ? closestAtLeastDaysAgo(snapshots, 365) : null;

  async function refresh() {
    setLoading(true);
    try {
      await fetch("/api/finance/refresh", { method: "POST" });
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  const maxValore = last ? Math.max(1, ...last.categorie.map((c) => Math.abs(c.valore))) : 1;

  return (
    <Screen>
      <Grid>
        <Card title="Patrimonio" span={12}>
          {!last || last.patrimonioNetto === null ? (
            <>
              <p className="fin-empty">Nessuna estrazione ancora.</p>
              {last?.note && <p className="fin-note">{last.note}</p>}
            </>
          ) : (
            <>
              <div className="fin-hero">
                <div className="fin-value">{formatCurrency(last.patrimonioNetto)}</div>
                {prev30 && (
                  <div className={`polso-delta ${last.patrimonioNetto - prev30.patrimonioNetto >= 0 ? "up" : "down"}`}>
                    {last.patrimonioNetto - prev30.patrimonioNetto >= 0 ? "▲" : "▼"}{" "}
                    {formatCurrency(Math.abs(last.patrimonioNetto - prev30.patrimonioNetto))} (30gg)
                  </div>
                )}
              </div>
              <div className="fin-breakdown">
                {last.categorie.map((c) => (
                  <div className="fin-cat-row" key={c.nome}>
                    <span style={{ width: 90 }}>{c.nome}</span>
                    <div className="fin-cat-bar">
                      <div
                        style={{
                          width: `${Math.min(100, (Math.abs(c.valore) / maxValore) * 100)}%`,
                          background: TIPO_COLOR[c.tipo] || "var(--text-faint)",
                        }}
                      />
                    </div>
                    <span>{formatCurrency(c.valore)}</span>
                  </div>
                ))}
              </div>
              {last.note && <p className="fin-note">{last.note}</p>}
            </>
          )}
          <button className="fin-refresh" onClick={refresh} disabled={loading} style={{ marginTop: 16 }}>
            {loading
              ? "estraggo..."
              : last
              ? `Aggiornato alle ${new Intl.DateTimeFormat("it-IT", { timeZone: timezone, hour: "2-digit", minute: "2-digit" }).format(new Date(last.timestamp))}`
              : "Aggiorna"}
          </button>
        </Card>

        <Card title="Storico" span={12}>
          {snapshots.length === 0 && <p className="fin-empty">Ancora nessuna istantanea.</p>}
          {[...snapshots]
            .reverse()
            .slice(0, 20)
            .map((s, i) => (
              <div className="fin-history-row" key={s.timestamp}>
                <span>
                  {i === 0
                    ? "Ultima"
                    : new Intl.DateTimeFormat("it-IT", { timeZone: timezone, day: "2-digit", month: "2-digit", year: "numeric" }).format(
                        new Date(s.timestamp)
                      )}
                </span>
                <span>{s.patrimonioNetto === null ? "—" : formatCurrency(s.patrimonioNetto)}</span>
              </div>
            ))}
          {prevYear && (
            <p className="fin-note" style={{ marginTop: 10 }}>
              Un anno fa: {formatCurrency(prevYear.patrimonioNetto)}
            </p>
          )}
        </Card>
      </Grid>
    </Screen>
  );
}
