import { Screen, Grid, Card } from "@/components/Grid";

export default function ReviewScreen() {
  return (
    <Screen>
      <Grid>
        <Card title="Chiuso questa settimana" span={6}>
          <div className="review-list">
            <div className="review-item">✓ Preventivo Studio Bellini inviato</div>
            <div className="review-item">✓ Bolletta luce pagata</div>
            <div className="review-item">✓ Chiamata con commercialista fatta</div>
          </div>
        </Card>
        <Card title="Slittato" span={6}>
          <div className="review-list">
            <div className="review-item">Richiamare Marco — da lunedì</div>
            <div className="review-item">Rinnovo assicurazione — da 2 giorni</div>
          </div>
        </Card>
        <Card title="Le tre priorità della prossima settimana" span={12}>
          <div className="review-priority"><div className="rp-num">1</div> Chiudere la proposta Meridian</div>
          <div className="review-priority"><div className="rp-num">2</div> Richiamare Marco</div>
          <div className="review-priority"><div className="rp-num">3</div> Prenotare visita di controllo</div>
        </Card>
      </Grid>
    </Screen>
  );
}
