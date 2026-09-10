import { Card } from "@/components/Grid";

const DAYS = [
  { label: "Lun", num: 8 },
  { label: "Mar", num: 9, today: true },
  { label: "Mer", num: 10 },
  { label: "Gio", num: 11 },
  { label: "Ven", num: 12 },
  { label: "Sab", num: 13 },
  { label: "Dom", num: 14 },
];

const EVENTS = [
  { time: "10:00", title: "Call con Meridian" },
  { time: "13:00", title: "Pranzo con Elena" },
  { time: "18:30", title: "Palestra" },
];

export default function Calendario() {
  return (
    <Card id="id-calendario" title="Calendario" question="Cosa mi aspetta" span={8}>
      <div className="cal-strip">
        {DAYS.map((d) => (
          <button key={d.label} className={`cal-day ${d.today ? "today" : ""}`}>
            {d.label}
            <div className="cal-daynum">{d.num}</div>
          </button>
        ))}
      </div>
      <div className="cal-events">
        {EVENTS.map((e) => (
          <div className="cal-event" key={e.time}>
            <time>{e.time}</time> {e.title}
          </div>
        ))}
      </div>
    </Card>
  );
}
