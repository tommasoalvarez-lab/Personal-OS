"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/Grid";
import { FASCE, sortTasks } from "@/lib/tasks";

const FASCIA_LABEL = {
  ritardo: "In ritardo",
  oggi: "Oggi",
  settimana: "Questa settimana",
  "piu-avanti": "Più avanti",
};

const VIEWS = [
  { key: "kanban", label: "Kanban" },
  { key: "persona", label: "Per persona" },
  { key: "ricerca", label: "Ricerca" },
];

function DetailPanel({ task, onClose, onSave, onDelete, onToggleComplete }) {
  const [form, setForm] = useState({
    titolo: task.titolo,
    nota: task.nota || "",
    fascia: task.fascia,
    temperatura: task.temperatura,
    persona: task.persona || "",
    tag: (task.tag || []).join(", "),
  });

  useEffect(() => {
    setForm({
      titolo: task.titolo,
      nota: task.nota || "",
      fascia: task.fascia,
      temperatura: task.temperatura,
      persona: task.persona || "",
      tag: (task.tag || []).join(", "),
    });
  }, [task]);

  function field(key) {
    return {
      value: form[key],
      onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  function save() {
    onSave(task.id, {
      titolo: form.titolo,
      nota: form.nota,
      fascia: form.fascia,
      temperatura: form.temperatura,
      persona: form.persona || null,
      tag: form.tag
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  return (
    <div className="side-panel-overlay" onClick={onClose}>
      <div className="side-panel" onClick={(e) => e.stopPropagation()}>
        <button className="side-panel-close" onClick={onClose} aria-label="Chiudi">
          ×
        </button>
        <h3>Modifica elemento</h3>

        <label>Titolo</label>
        <input {...field("titolo")} />

        <label>Nota</label>
        <textarea {...field("nota")} />

        <label>Fascia</label>
        <select {...field("fascia")}>
          {FASCE.map((f) => (
            <option key={f} value={f}>
              {FASCIA_LABEL[f]}
            </option>
          ))}
        </select>

        <label>Temperatura</label>
        <select {...field("temperatura")}>
          <option value="caldo">Caldo</option>
          <option value="tiepido">Tiepido</option>
          <option value="freddo">Freddo</option>
        </select>

        <label>Persona</label>
        <input {...field("persona")} placeholder="—" />

        <label>Tag (separati da virgola)</label>
        <input {...field("tag")} placeholder="#finanze, #casa" />

        <div className="side-panel-actions">
          <button className="primary" onClick={save}>
            Salva
          </button>
          <button onClick={() => onToggleComplete(task)}>
            {task.dataCompletamento ? "Riapri" : "Completa"}
          </button>
        </div>
        <div className="side-panel-actions">
          <button onClick={() => onDelete(task.id)}>Elimina</button>
        </div>
      </div>
    </div>
  );
}

function KanbanCard({ task, onOpen, onDragStart }) {
  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onOpen(task.id)}
    >
      <div className="kc-title">{task.titolo}</div>
      <div className="kc-meta">
        <span className={`temp-dot temp-${task.temperatura}`} />
        {task.persona || (task.tag && task.tag[0]) || ""}
      </div>
    </div>
  );
}

export default function CrmScreen({ tasks: initialTasks, initialOpenId }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [view, setView] = useState("kanban");
  const [openId, setOpenId] = useState(initialOpenId || null);
  const [dragOverFascia, setDragOverFascia] = useState(null);
  const [query, setQuery] = useState("");
  const [searchIds, setSearchIds] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => setTasks(initialTasks), [initialTasks]);

  useEffect(() => {
    const saved = window.localStorage.getItem("crm-view");
    if (saved && VIEWS.some((v) => v.key === saved)) setView(saved);
  }, []);

  function selectView(v) {
    setView(v);
    window.localStorage.setItem("crm-view", v);
  }

  const aperti = useMemo(() => tasks.filter((t) => !t.dataCompletamento), [tasks]);
  const selected = openId ? tasks.find((t) => t.id === openId) || null : null;

  async function saveTask(id, patch) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    await fetch(`/api/crm/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    router.refresh();
  }

  async function toggleComplete(task) {
    const completato = !task.dataCompletamento;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, dataCompletamento: completato ? new Date().toISOString() : null }
          : t
      )
    );
    setOpenId(null);
    await fetch(`/api/crm/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completato }),
    });
    router.refresh();
  }

  async function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setOpenId(null);
    await fetch(`/api/crm/${id}`, { method: "DELETE" });
    router.refresh();
  }

  function onDragStart(e, task) {
    e.dataTransfer.setData("text/plain", task.id);
  }

  async function onDrop(e, fascia) {
    e.preventDefault();
    setDragOverFascia(null);
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;

    const dropped = tasks.find((t) => t.id === id);
    if (!dropped) return;

    const restInFascia = sortTasks(
      aperti.filter((t) => t.fascia === fascia && t.id !== id)
    );
    const orderedIds = [id, ...restInFascia.map((t) => t.id)];

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) return { ...t, fascia, posizione: 0 };
        const idx = orderedIds.indexOf(t.id);
        return idx > -1 ? { ...t, posizione: idx } : t;
      })
    );

    await fetch("/api/crm/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, toFascia: fascia, orderedIds }),
    });
    router.refresh();
  }

  async function runSearch() {
    const domanda = query.trim();
    if (!domanda) {
      setSearchIds(null);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch("/api/crm/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domanda }),
      });
      const data = await res.json();
      setSearchIds(data.ids || []);
    } catch {
      setSearchIds([]);
    } finally {
      setSearching(false);
    }
  }

  const visibleInKanban =
    view === "ricerca" && searchIds
      ? aperti.filter((t) => searchIds.includes(t.id))
      : aperti;

  const byPersona = useMemo(() => {
    const groups = new Map();
    for (const t of visibleInKanban) {
      const key = t.persona || "__senza__";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(t);
    }
    const entries = [...groups.entries()].sort((a, b) => {
      if (a[0] === "__senza__") return 1;
      if (b[0] === "__senza__") return -1;
      return a[0].localeCompare(b[0]);
    });
    return entries;
  }, [visibleInKanban]);

  return (
    <Screen>
      <div className="crm-header">
        <h2>CRM</h2>
        <div className="crm-views">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              className={view === v.key ? "active" : ""}
              onClick={() => selectView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === "ricerca" && (
        <input
          className="crm-search"
          placeholder="Cosa posso chiudere in dieci minuti mentre aspetto il treno?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
          }}
        />
      )}
      {view === "ricerca" && searching && <p className="card-question">cerco...</p>}

      {view === "persona" ? (
        <div className="crm-persons">
          {byPersona.map(([key, items]) => (
            <div className="crm-person-group" key={key}>
              <h4>{key === "__senza__" ? "Senza persona" : key}</h4>
              {sortTasks(items).map((t) => (
                <KanbanCard key={t.id} task={t} onOpen={setOpenId} onDragStart={onDragStart} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="kanban">
          {FASCE.map((fascia) => {
            const items = sortTasks(visibleInKanban.filter((t) => t.fascia === fascia));
            return (
              <div
                className={`kanban-col ${dragOverFascia === fascia ? "drag-over" : ""}`}
                key={fascia}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverFascia(fascia);
                }}
                onDragLeave={() => setDragOverFascia(null)}
                onDrop={(e) => onDrop(e, fascia)}
              >
                <h4>
                  {FASCIA_LABEL[fascia]} <span>{items.length}</span>
                </h4>
                {items.map((t) => (
                  <KanbanCard key={t.id} task={t} onOpen={setOpenId} onDragStart={onDragStart} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <DetailPanel
          task={selected}
          onClose={() => setOpenId(null)}
          onSave={saveTask}
          onDelete={deleteTask}
          onToggleComplete={toggleComplete}
        />
      )}
    </Screen>
  );
}
