import { Card } from "@/components/Grid";

const BLOCKS = [
  { title: "Preventivo Marco", age: "5g" },
  { title: "Risposta commercialista", age: "3g" },
  { title: "Rinnovo assicurazione", age: "2g" },
];

export default function Blocchi() {
  return (
    <Card id="id-blocchi" title="Blocchi" question="Cosa è fermo, e da quanto" span={4}>
      {BLOCKS.map((b) => (
        <div className="blocco-row" key={b.title}>
          {b.title}
          <span className="blocco-age">{b.age}</span>
        </div>
      ))}
    </Card>
  );
}
