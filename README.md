# PersonalOS — Percorso Locale

Una dashboard personale: task, calendario, finanze, abitudini, e una memoria che impara chi sei.
Costruita seguendo la guida *PersonalOS* di Giuseppe Castagna — Percorso Locale.

## Avvio

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Variabili d'ambiente

Crea `.env.local` nella radice del progetto (mai committato — è già in `.gitignore`):

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=
USER_TIMEZONE=Europe/Rome
GOOGLE_CALENDAR_ICAL_URL=
FINANCE_FILE_PATH=
```

- `ANTHROPIC_API_KEY` — obbligatoria per smistamento, domande, stima pasti e polso finanziario.
  Non è l'abbonamento a Claude Code: è una chiave API separata, con il suo credito, da
  [console.anthropic.com](https://console.anthropic.com) → API Keys. **Metti un limite di spesa
  mensile il giorno stesso in cui la generi.**
- `ANTHROPIC_MODEL` — facoltativa, il codice ha un valore predefinito.
- `USER_TIMEZONE` — facoltativa (default `Europe/Rome`). Decide quando "oggi" diventa "ieri".
- `GOOGLE_CALENDAR_ICAL_URL` — facoltativa. L'indirizzo segreto del tuo calendario Google, da
  Impostazioni calendario → "Indirizzo segreto in formato iCal". **Trattalo come una password.**
- `FINANCE_FILE_PATH` — facoltativa. Percorso di un file `.xlsx` o `.csv` sul tuo disco con il
  tuo patrimonio (un export del tuo foglio di calcolo).

Senza chiave Anthropic il sistema continua a funzionare: lo smistamento usa regole per parole
chiave, le domande e le stime rispondono dicendo che manca la chiave, invece di inventare.

## Dove stanno i dati

Un solo file, `data/personalos.json`, creato automaticamente al primo avvio come copia di
`data/seed.json` (che non va mai modificato a mano — è lo stato di partenza).

- **Backup**: fai tu, quando vuoi, una copia di `data/personalos.json` da qualche parte che
  controlli (una cartella cloud, una chiavetta). Non c'è nessun backup automatico sul Percorso
  Locale — è la voce 2 della Parte 9 della guida, per quando/se si passa al Percorso Completo.
- **Reset**: cancella `data/personalos.json` e ricarica la pagina. Il sistema riparte pulito
  dal seed, senza nessun'altra azione.
- **Persistenza**: il file resta sul disco tra un riavvio e l'altro — non c'è nessun server da
  tenere sveglio, i dati sono lì quando riapri.

## Verifica dopo l'installazione (Parte 7 della guida)

- [ ] La dashboard su `localhost:3000` mostra dati vuoti/di partenza (dal seed), non quelli di un mockup
- [ ] Scrivi una frase nella barra di cattura → finisce nella scheda giusta (prova gli esempi
      della guida: "ho pagato 340 euro di commercialista" → Finanze; "ricordati di chiamare
      Marco" → CRM)
- [ ] Chiudi il server, riavvialo, ricarica → i dati sono ancora lì
- [ ] Cancella `data/personalos.json` e ricarica → si rigenera dal seed, pulito
- [ ] Guarda il consumo sul [pannello Anthropic](https://console.anthropic.com) → i numeri hanno
      senso, e non si muovono solo ricaricando una pagina (nessuna scheda chiama il modello al
      caricamento — solo cattura, domande, o un pulsante di aggiornamento premuto da te)

## Note tecniche

- `xlsx` (per leggere il foglio delle finanze) ha due advisory di sicurezza note, senza fix
  pubblicato su npm — vedi `CLAUDE.md` per il ragionamento sul perché è comunque accettabile qui
  (legge solo il file locale che indichi tu, mai input di terzi).
- Il parser del calendario (iCal) e quello del CRM sono scritti a mano in JavaScript puro,
  senza librerie esterne — per i motivi spiegati nella guida (Parte 8).
