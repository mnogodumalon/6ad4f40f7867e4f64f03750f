/**
 * Occupancy semantics — DECIDED BY THE BUILD AGENT, never by a heuristic.
 *
 * The Phase-2 orchestrator writes its decision to `.intents-staging/occupancy.json`
 * (stay pair, booked resource, statuses that do not occupy); the integration
 * step validates it against the app metadata and renders it into the block
 * below. Scaffold updates keep the block. Do not edit outside the markers.
 *
 * Both doors read this and nothing else: `occupancyFor` (internal flows AND
 * public pages) and the owner service (the public grant's occupancy read).
 * No rule for an entity = no availability calendar, no occupancy claim —
 * a plain date field pair is shown instead.
 *
 * Facts from the metadata — candidates, NOT decisions:
 *   - vorhaben: date pairs startdatum+enddatum · lookups status[geplant|in_arbeit|abgeschlossen|abgebrochen]
 *   - beobachtungen: applookups vorhaben→vorhaben · lookups fallart[fehlende_angaben|widerspruechlich|ausnahme|veraltet|nicht_uebertragbar|vollstaendig]
 *   - erkenntnisse: applookups widersprechende_erkenntnis→erkenntnisse · lookups stufe[hypothese|in_pruefung|erfahrung|eingeschraenkt|ueberholt|zurueckgenommen], unsicherheit_grad[gering|mittel|hoch], freigabestatus[entwurf|zur_freigabe|freigegeben|abgelehnt]
 *   - belege: applookups beobachtung→beobachtungen, erkenntnis→erkenntnisse · lookups wirkung_auf_erkenntnis[bestaetigend|widersprechend|neutral], gewichtung[niedrig|mittel|hoch]
 *   - regeln: applookups erkenntnis→erkenntnisse · lookups freigabestatus[entwurf|zur_freigabe|freigegeben|eingeschraenkt|ueberholt|zurueckgenommen]
 *   - regelanwendungen: applookups regel→regeln, vorhaben→vorhaben · lookups art_der_anwendung[regulaer|ausnahme|nicht_anwendbar|nicht_angewendet], fehler_reduziert[ja|teilweise|nein|nicht_beurteilbar]
 *   - pilotbewertungen: applookups regel→regeln, vorhaben→vorhaben · lookups entscheidung[ausbauen|anpassen|beenden]
 */
import type { EntityKey } from '@/lib/journey/rules';

export interface OccupancyRule {
  /** Arrival / departure fields (the departure day is exclusive). */
  from: string;
  to: string;
  /** applookup field naming the booked RESOURCE (room, vehicle, court).
   *  Omit when the entity itself is the one resource (a single holiday flat). */
  resource?: string;
  /** lookup field + the keys that mean "does NOT occupy" (cancelled, no-show). */
  statusField?: string;
  freeKeys?: string[];
}

export const OCCUPANCY: Partial<Record<EntityKey, OccupancyRule>> = {
  // <custom:occupancy>
  // </custom:occupancy>
};

/**
 * A record of the KEY entity is TAKEN while a record of `entity` points at it
 * through `field` — a slot with a booking, a seat with a ticket. Generated
 * from the plan's blocking `unique` check on that reference (05.10.2026:
 * the salon's public page offered booked slots again). Pickers on both
 * doors leave taken records out (useRecordSearch); a public page reads only
 * `field` of `entity` — never who booked. Generator-owned: no markers.
 */
export interface TakenRule {
  entity: EntityKey;
  field: string;
}

export const TAKEN_BY: Partial<Record<EntityKey, TakenRule>> = {
};
