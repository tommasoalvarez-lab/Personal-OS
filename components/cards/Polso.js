import { Card } from "@/components/Grid";

export default function Polso() {
  return (
    <Card id="id-polso" title="Polso finanziario" question="Sto salendo o scendendo" span={4}>
      <div className="polso-amount">€ 42.150</div>
      <div className="polso-delta up">▲ +€ 380 negli ultimi 30 giorni</div>
      <div className="polso-cats">
        <div className="polso-cat"><span>Liquidità</span><span>€ 8.200</span></div>
        <div className="polso-cat"><span>Investito</span><span>€ 35.400</span></div>
        <div className="polso-cat"><span>Debito</span><span>-€ 1.450</span></div>
      </div>
    </Card>
  );
}
