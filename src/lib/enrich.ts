import type { EnrichedBelege, EnrichedBeobachtungen, EnrichedErkenntnisse, EnrichedPilotbewertungen, EnrichedRegelanwendungen, EnrichedRegeln } from '@/types/enriched';
import type { Belege, Beobachtungen, Erkenntnisse, Pilotbewertungen, Regelanwendungen, Regeln, Vorhaben } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface BeobachtungenMaps {
  vorhabenMap: Map<string, Vorhaben>;
}

export function enrichBeobachtungen(
  beobachtungen: Beobachtungen[],
  maps: BeobachtungenMaps
): EnrichedBeobachtungen[] {
  return beobachtungen.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
  }));
}

interface ErkenntnisseMaps {
  erkenntnisseMap: Map<string, Erkenntnisse>;
}

export function enrichErkenntnisse(
  erkenntnisse: Erkenntnisse[],
  maps: ErkenntnisseMaps
): EnrichedErkenntnisse[] {
  return erkenntnisse.map(r => ({
    ...r,
    widersprechende_erkenntnisName: resolveDisplay(r.fields.widersprechende_erkenntnis, maps.erkenntnisseMap, 'titel'),
  }));
}

interface BelegeMaps {
  beobachtungenMap: Map<string, Beobachtungen>;
  erkenntnisseMap: Map<string, Erkenntnisse>;
}

export function enrichBelege(
  belege: Belege[],
  maps: BelegeMaps
): EnrichedBelege[] {
  return belege.map(r => ({
    ...r,
    beobachtungName: resolveDisplay(r.fields.beobachtung, maps.beobachtungenMap, 'quelle'),
    erkenntnisName: resolveDisplay(r.fields.erkenntnis, maps.erkenntnisseMap, 'titel'),
  }));
}

interface RegelnMaps {
  erkenntnisseMap: Map<string, Erkenntnisse>;
}

export function enrichRegeln(
  regeln: Regeln[],
  maps: RegelnMaps
): EnrichedRegeln[] {
  return regeln.map(r => ({
    ...r,
    erkenntnisName: resolveDisplay(r.fields.erkenntnis, maps.erkenntnisseMap, 'titel'),
  }));
}

interface RegelanwendungenMaps {
  regelnMap: Map<string, Regeln>;
  vorhabenMap: Map<string, Vorhaben>;
}

export function enrichRegelanwendungen(
  regelanwendungen: Regelanwendungen[],
  maps: RegelanwendungenMaps
): EnrichedRegelanwendungen[] {
  return regelanwendungen.map(r => ({
    ...r,
    regelName: resolveDisplay(r.fields.regel, maps.regelnMap, 'regeltitel'),
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
  }));
}

interface PilotbewertungenMaps {
  regelnMap: Map<string, Regeln>;
  vorhabenMap: Map<string, Vorhaben>;
}

export function enrichPilotbewertungen(
  pilotbewertungen: Pilotbewertungen[],
  maps: PilotbewertungenMaps
): EnrichedPilotbewertungen[] {
  return pilotbewertungen.map(r => ({
    ...r,
    regelName: resolveDisplay(r.fields.regel, maps.regelnMap, 'regeltitel'),
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
  }));
}
