"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Grid";

function Meal({ meal, onSaveMacro, onSaveCalorie }) {
  const [open, setOpen] = useState(false);
  const [proteine, setProteine] = useState(meal.proteine);
  const [carboidrati, setCarboidrati] = useState(meal.carboidrati);
  const [grassi, setGrassi] = useState(meal.grassi);
  const [calorie, setCalorie] = useState(meal.calorie);
  const calorieTimer = useRef(null);

  useEffect(() => {
    setProteine(meal.proteine);
    setCarboidrati(meal.carboidrati);
    setGrassi(meal.grassi);
    setCalorie(meal.calorie);
  }, [meal]);

  // Un macro cambia: le calorie si ricalcolano subito con la formula, senza chiamate.
  function commitMacro(next) {
    const p = next.proteine ?? proteine;
    const c = next.carboidrati ?? carboidrati;
    const g = next.grassi ?? grassi;
    setCalorie(Math.round(4 * p + 4 * c + 9 * g));
    onSaveMacro(meal.id, { proteine: p, carboidrati: c, grassi: g });
  }

  // Le calorie cambiano: si aspetta che l'utente finisca di digitare, poi
  // parte la ridistribuzione — altrimenti "550" genera tre chiamate inutili.
  function onCalorieChange(value) {
    setCalorie(value);
    clearTimeout(calorieTimer.current);
    calorieTimer.current = setTimeout(() => {
      onSaveCalorie(meal.id, Number(value));
    }, 700);
  }

  return (
    <div>
      <div className="meal-row" onClick={() => setOpen((o) => !o)}>
        <time>{meal.orario}</time> {meal.nome}
        {meal.stimato && <span className="meal-estimated">stima</span>}
        <span className="meal-kcal">{calorie}</span>
      </div>
      {open && (
        <div style={{ padding: "6px 0 10px 50px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label style={{ fontSize: 11 }}>
            Kcal
            <input
              type="number"
              value={calorie}
              onChange={(e) => onCalorieChange(e.target.value)}
              style={{ width: 60, marginLeft: 4 }}
            />
          </label>
          <label style={{ fontSize: 11 }}>
            P
            <input
              type="number"
              value={proteine}
              onChange={(e) => {
                setProteine(Number(e.target.value));
              }}
              onBlur={() => commitMacro({ proteine: Number(proteine) })}
              style={{ width: 50, marginLeft: 4 }}
            />
          </label>
          <label style={{ fontSize: 11 }}>
            C
            <input
              type="number"
              value={carboidrati}
              onChange={(e) => setCarboidrati(Number(e.target.value))}
              onBlur={() => commitMacro({ carboidrati: Number(carboidrati) })}
              style={{ width: 50, marginLeft: 4 }}
            />
          </label>
          <label style={{ fontSize: 11 }}>
            G
            <input
              type="number"
              value={grassi}
              onChange={(e) => setGrassi(Number(e.target.value))}
              onBlur={() => commitMacro({ grassi: Number(grassi) })}
              style={{ width: 50, marginLeft: 4 }}
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default function Nutrizione({ log, obiettivoCalorico, today }) {
  const router = useRouter();
  const [pasti, setPasti] = useState(log?.pasti || []);
  const [descrizione, setDescrizione] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setPasti(log?.pasti || []), [log, today]);

  const totale = pasti.reduce((s, p) => s + p.calorie, 0);
  const proteineTot = pasti.reduce((s, p) => s + p.proteine, 0);
  const carboTot = pasti.reduce((s, p) => s + p.carboidrati, 0);
  const grassiTot = pasti.reduce((s, p) => s + p.grassi, 0);
  const percent = obiettivoCalorico ? Math.min(100, Math.round((totale / obiettivoCalorico) * 100)) : 0;

  async function addMeal() {
    const testo = descrizione.trim();
    if (!testo || loading) return;
    setLoading(true);
    try {
      await fetch("/api/nutrition/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descrizione: testo }),
      });
      setDescrizione("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function saveMacro(id, macros) {
    await fetch(`/api/nutrition/meal/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(macros),
    });
    router.refresh();
  }

  async function saveCalorie(id, calorie) {
    await fetch(`/api/nutrition/meal/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calorie }),
    });
    router.refresh();
  }

  return (
    <Card id="id-nutrizione" title="Nutrizione" question="Quanto ho mangiato oggi" span={4}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span>
          {totale} / {obiettivoCalorico || "—"} kcal
        </span>
      </div>
      <div className="macro-bar">
        <div style={{ width: `${percent}%` }} />
      </div>
      <div className="macro-row">
        <span>P {proteineTot}g</span>
        <span>C {carboTot}g</span>
        <span>G {grassiTot}g</span>
      </div>
      {pasti.map((m) => (
        <Meal key={m.id} meal={m} onSaveMacro={saveMacro} onSaveCalorie={saveCalorie} />
      ))}
      <input
        className="meal-add"
        placeholder="Descrivi un pasto e premi Invio..."
        value={descrizione}
        disabled={loading}
        onChange={(e) => setDescrizione(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") addMeal();
        }}
      />
    </Card>
  );
}
