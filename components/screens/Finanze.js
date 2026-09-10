import { Screen, Grid, Card } from "@/components/Grid";

export default function FinanzeScreen() {
  return (
    <Screen>
      <Grid>
        <Card title="Patrimonio" span={12}>
          <div className="fin-hero">
            <div className="fin-value">€ 42.150</div>
            <div className="polso-delta up">▲ +€ 380 (30gg)</div>
          </div>
          <div className="fin-breakdown">
            <div className="fin-cat-row">
              <span style={{ width: 90 }}>Liquidità</span>
              <div className="fin-cat-bar"><div style={{ width: "20%", background: "var(--blue)" }} /></div>
              <span>€ 8.200</span>
            </div>
            <div className="fin-cat-row">
              <span style={{ width: 90 }}>Investito</span>
              <div className="fin-cat-bar"><div style={{ width: "84%", background: "var(--accent)" }} /></div>
              <span>€ 35.400</span>
            </div>
            <div className="fin-cat-row">
              <span style={{ width: 90 }}>Debito</span>
              <div className="fin-cat-bar"><div style={{ width: "4%", background: "var(--red)" }} /></div>
              <span>-€ 1.450</span>
            </div>
          </div>
        </Card>
        <Card title="Storico" span={12}>
          <div className="fin-history-row"><span>Oggi</span><span>€ 42.150</span></div>
          <div className="fin-history-row"><span>30 giorni fa</span><span>€ 41.770</span></div>
          <div className="fin-history-row"><span>1 anno fa</span><span>€ 33.900</span></div>
        </Card>
      </Grid>
    </Screen>
  );
}
