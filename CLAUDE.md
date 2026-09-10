@AGENTS.md

# PersonalOS — regole di casa

- Percorso Locale: JavaScript (non TypeScript), Next.js App Router, senza Tailwind.
- Tutti i dati passano da `lib/store.js`. Nessuna rotta o componente tocca `data/personalos.json` direttamente.
- `data/seed.json` non si modifica mai: è lo stato di partenza. `data/personalos.json` è la copia di lavoro, in `.gitignore`.
- Nessuna scheda o pagina chiama il modello al caricamento. Il modello parte solo da: una cattura, una domanda, o un pulsante di aggiornamento premuto dall'utente.
- "Che giorno è oggi" si calcola in un'unica funzione che usa `USER_TIMEZONE`, mai `new Date()` sparso nel codice o l'ora del server.
- Gli Obiettivi (settimana/mese) si salvano su una riga con data fissa convenzionale `2000-01-01`, che non scade mai — non è un bug, non "correggerla".
- Le sette destinazioni di cattura sono: task, persone, finanze, nutrizione, salute, obiettivi, memoria. L'elenco vive in un solo punto del codice (`lib/classify.js`).
