"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Grid";
import { completionPercent } from "@/lib/habits";

export default function Abitudini({ abitudini, log, today }) {
  const router = useRouter();
  const [localLog, setLocalLog] = useState(log || { abitudini: {} });

  // Il giorno cambia, o il server ha riletto lo stato dopo un refresh: risincronizza.
  useEffect(() => {
    setLocalLog(log || { abitudini: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(log), today]);

  const percent = completionPercent(localLog, abitudini);

  async function toggle(habit) {
    setLocalLog((prev) => {
      const next = { ...prev, abitudini: { ...prev.abitudini } };
      if (habit.tipo === "contatore") {
        const v = next.abitudini[habit.id] || 0;
        next.abitudini[habit.id] = v >= habit.obiettivo ? 0 : v + 1;
      } else {
        next.abitudini[habit.id] = !next.abitudini[habit.id];
      }
      return next;
    });

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId: habit.id }),
      });
      if (!res.ok) throw new Error("scrittura fallita");
    } catch {
      // la scrittura non è andata: rileggi lo stato vero dal server, non restare a raccontare una cosa mai salvata
    } finally {
      router.refresh();
    }
  }

  return (
    <Card id="id-abitudini" title="Abitudini" question="A che punto sono oggi" span={4}>
      <div
        className="habit-ring"
        style={{
          background: `conic-gradient(var(--accent) 0% ${percent}%, var(--border) ${percent}% 100%)`,
        }}
      >
        <span>{percent}%</span>
      </div>
      {abitudini.map((h) => {
        const value = localLog.abitudini?.[h.id];
        const done = h.tipo === "contatore" ? (value || 0) >= h.obiettivo : value === true;
        const count = h.tipo === "contatore" ? `${value || 0}/${h.obiettivo}` : done ? "fatto" : "";
        return (
          <div className="habit-row" key={h.id}>
            <button className={`habit-check ${done ? "done" : ""}`} onClick={() => toggle(h)}>
              ✓
            </button>
            {h.nome}
            <span className="habit-count">{count}</span>
          </div>
        );
      })}
    </Card>
  );
}
