"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Grid";

function Section({ label, list, items, onToggle, onRemove, onAdd }) {
  const [draft, setDraft] = useState("");

  function submit() {
    const testo = draft.trim();
    if (!testo) return;
    onAdd(list, testo);
    setDraft("");
  }

  return (
    <div>
      <div className="goal-section-title">{label}</div>
      {items.map((g) => (
        <div className={`goal-row ${g.fatto ? "done" : ""}`} key={g.id}>
          <button className={`habit-check ${g.fatto ? "done" : ""}`} onClick={() => onToggle(list, g.id)}>
            ✓
          </button>
          <span className="goal-name">{g.nome}</span>
          {g.progresso && <span className="goal-progress">{g.progresso}</span>}
          <button className="goal-remove" onClick={() => onRemove(list, g.id)} aria-label="Rimuovi">
            ×
          </button>
        </div>
      ))}
      <input
        className="goal-add"
        placeholder="Aggiungi e premi Invio..."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
    </div>
  );
}

export default function Obiettivi({ obiettivi }) {
  const router = useRouter();
  const [state, setState] = useState(obiettivi);

  useEffect(() => setState(obiettivi), [obiettivi]);

  async function call(body) {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.obiettivi) setState(data.obiettivi);
    router.refresh();
  }

  const toggle = (list, id) => call({ action: "toggle", list, id });
  const remove = (list, id) => call({ action: "remove", list, id });
  const add = (list, nome) => call({ action: "add", list, nome });

  return (
    <Card id="id-obiettivi" title="Obiettivi" question="Cosa mi ero promesso" span={4}>
      <Section label="Questa settimana" list="settimana" items={state.settimana} onToggle={toggle} onRemove={remove} onAdd={add} />
      <Section label="Questo mese" list="mese" items={state.mese} onToggle={toggle} onRemove={remove} onAdd={add} />
    </Card>
  );
}
