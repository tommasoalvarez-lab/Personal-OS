"use client";

import { Screen } from "@/components/Grid";
import { useState } from "react";

const COLUMNS = [
  {
    key: "late",
    label: "In ritardo",
    items: [{ title: "Richiamare Marco", persona: "Marco Bianchi", tag: "#preventivo", temp: "caldo" }],
  },
  {
    key: "today",
    label: "Oggi",
    items: [
      { title: "Inviare fattura commercialista", persona: null, tag: "#finanze", temp: "tiepido" },
      { title: "Confermare dentista", persona: null, tag: "#salute", temp: "freddo" },
    ],
  },
  {
    key: "week",
    label: "Questa settimana",
    items: [
      { title: "Rinnovo assicurazione auto", persona: null, tag: "#casa", temp: "tiepido" },
      { title: "Preventivo Elena — sito", persona: "Elena Rossi", tag: null, temp: "freddo" },
    ],
  },
  {
    key: "later",
    label: "Più avanti",
    items: [{ title: "Pianificare vacanza estate", persona: null, tag: "#personale", temp: "freddo" }],
  },
];

export default function CrmScreen() {
  const [view, setView] = useState("kanban");

  return (
    <Screen>
      <div className="crm-header">
        <h2>CRM</h2>
        <div className="crm-views">
          {["kanban", "persona", "ricerca"].map((v) => (
            <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>
              {v === "kanban" ? "Kanban" : v === "persona" ? "Per persona" : "Ricerca"}
            </button>
          ))}
        </div>
      </div>
      <input className="crm-search" placeholder="Cosa posso chiudere in dieci minuti mentre aspetto il treno?" />

      <div className="kanban">
        {COLUMNS.map((col) => (
          <div className="kanban-col" key={col.key}>
            <h4>
              {col.label} <span>{col.items.length}</span>
            </h4>
            {col.items.map((item) => (
              <div className="kanban-card" key={item.title}>
                <div className="kc-title">{item.title}</div>
                <div className="kc-meta">
                  <span className={`temp-dot temp-${item.temp}`} />
                  {item.persona || item.tag || ""}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Screen>
  );
}
