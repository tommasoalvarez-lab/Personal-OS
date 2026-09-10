"use client";

import { Fragment, useMemo, useState } from "react";
import { Card } from "@/components/Grid";
import { shiftISO, compareISO } from "@/lib/date";
import { formatNumber } from "@/lib/format";

function dayTotals(log) {
  return log.pasti.reduce(
    (s, p) => ({
      calorie: s.calorie + p.calorie,
      proteine: s.proteine + p.proteine,
      carboidrati: s.carboidrati + p.carboidrati,
      grassi: s.grassi + p.grassi,
    }),
    { calorie: 0, proteine: 0, carboidrati: 0, grassi: 0 }
  );
}

// Pura lettura e aggregazione di dati che le altre schede hanno già prodotto:
// nessuna chiamata al modello, nessuna scrittura.
export default function Salute({ logGiornalieri, today }) {
  const [expanded, setExpanded] = useState(null);

  const rows = useMemo(() => {
    const from = shiftISO(today, -29);
    return Object.values(logGiornalieri)
      .filter(
        (log) =>
          log.pasti?.length > 0 &&
          compareISO(log.data, from) >= 0 &&
          compareISO(log.data, today) <= 0
      )
      .sort((a, b) => compareISO(b.data, a.data));
  }, [logGiornalieri, today]);

  const medie = useMemo(() => {
    if (rows.length === 0) return null;
    const sum = rows.reduce(
      (acc, r) => {
        const t = dayTotals(r);
        return {
          calorie: acc.calorie + t.calorie,
          proteine: acc.proteine + t.proteine,
          carboidrati: acc.carboidrati + t.carboidrati,
          grassi: acc.grassi + t.grassi,
        };
      },
      { calorie: 0, proteine: 0, carboidrati: 0, grassi: 0 }
    );
    return {
      calorie: Math.round(sum.calorie / rows.length),
      giorni: rows.length,
    };
  }, [rows]);

  return (
    <Card id="id-salute" title="Salute" question="Come sta andando il mese" span={4}>
      <p className="salute-caption">
        {medie
          ? `Media ${formatNumber(medie.calorie)} kcal · ${medie.giorni} ${medie.giorni === 1 ? "giorno registrato" : "giorni registrati"}`
          : "Nessun giorno registrato ancora"}
      </p>
      {rows.length > 0 && (
        <div style={{ maxHeight: 220, overflowY: "auto" }}>
          <table className="salute-table">
            <thead>
              <tr>
                <th>Giorno</th>
                <th>Kcal</th>
                <th>P</th>
                <th>C</th>
                <th>G</th>
                <th>Pasti</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const t = dayTotals(r);
                const isOpen = expanded === r.data;
                return (
                  <Fragment key={r.data}>
                    <tr onClick={() => setExpanded(isOpen ? null : r.data)}>
                      <td>{r.data}</td>
                      <td>{formatNumber(t.calorie)}</td>
                      <td>{formatNumber(t.proteine)}</td>
                      <td>{formatNumber(t.carboidrati)}</td>
                      <td>{formatNumber(t.grassi)}</td>
                      <td>{r.pasti.length}</td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={6} className="salute-meals-detail">
                          {r.pasti.map((p) => `${p.orario} ${p.nome} — ${formatNumber(p.calorie)} kcal`).join(" · ")}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
