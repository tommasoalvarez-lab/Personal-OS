import { Screen, Grid } from "@/components/Grid";
import Operator from "@/components/cards/Operator";
import Session from "@/components/cards/Session";
import Abitudini from "@/components/cards/Abitudini";
import Calendario from "@/components/cards/Calendario";
import Blocchi from "@/components/cards/Blocchi";
import Polso from "@/components/cards/Polso";
import Nutrizione from "@/components/cards/Nutrizione";
import Salute from "@/components/cards/Salute";
import Obiettivi from "@/components/cards/Obiettivi";

export default function HomeScreen({ state, timezone, today, calendar, weekDates }) {
  return (
    <Screen>
      <Grid>
        <Operator profilo={state.profilo} logGiornalieri={state.logGiornalieri} today={today} />
        <Session nome={state.profilo.nome} timezone={timezone} tasks={state.task} />
        <Abitudini
          abitudini={state.profilo.abitudini}
          log={state.logGiornalieri[today]}
          today={today}
        />
        <Calendario
          timezone={timezone}
          today={today}
          weekDates={weekDates}
          events={calendar.events}
          connected={calendar.connected}
        />
        <Blocchi tasks={state.task} />
        <Polso financeSnapshots={state.financeSnapshots} />
        <Nutrizione
          log={state.logGiornalieri[today]}
          obiettivoCalorico={state.profilo.obiettivoCalorico}
          today={today}
        />
        <Salute logGiornalieri={state.logGiornalieri} today={today} />
        <Obiettivi obiettivi={state.obiettivi} />
      </Grid>
    </Screen>
  );
}
