// Un modulo solo per la formattazione dei numeri: la regola vive qui e vale
// ovunque. L'italiano non raggruppa le migliaia sotto le cinque cifre — 7150
// resta "7150" — ma in colonna, dove i numeri vanno confrontati in verticale,
// serve forzare il raggruppamento anche lì.
const numberFormatter = new Intl.NumberFormat("it-IT", { minimumGroupingDigits: 1 });

export function formatNumber(n) {
  return numberFormatter.format(Math.round(n));
}

export function formatCurrency(n) {
  const sign = n < 0 ? "-" : "";
  return `${sign}€ ${numberFormatter.format(Math.round(Math.abs(n)))}`;
}
