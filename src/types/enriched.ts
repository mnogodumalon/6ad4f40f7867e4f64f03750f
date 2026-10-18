import type { Belege, Beobachtungen, Erkenntnisse, Pilotbewertungen, Regelanwendungen, Regeln } from './app';

export type EnrichedBeobachtungen = Beobachtungen & {
  vorhabenName: string;
};

export type EnrichedErkenntnisse = Erkenntnisse & {
  widersprechende_erkenntnisName: string;
};

export type EnrichedBelege = Belege & {
  beobachtungName: string;
  erkenntnisName: string;
};

export type EnrichedRegeln = Regeln & {
  erkenntnisName: string;
};

export type EnrichedRegelanwendungen = Regelanwendungen & {
  regelName: string;
  vorhabenName: string;
};

export type EnrichedPilotbewertungen = Pilotbewertungen & {
  regelName: string;
  vorhabenName: string;
};
