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

export default function HomeScreen() {
  return (
    <Screen>
      <Grid>
        <Operator />
        <Session />
        <Abitudini />
        <Calendario />
        <Blocchi />
        <Polso />
        <Nutrizione />
        <Salute />
        <Obiettivi />
      </Grid>
    </Screen>
  );
}
