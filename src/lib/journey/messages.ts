/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - vorhaben: titel (Titel des Vorhabens), intention (Intention), status (Status)
 *   - beobachtungen: vorhaben (Vorhaben), beschreibung (Was ist geschehen?), beobachtet_am (Zeitpunkt der Beobachtung)
 *   - erkenntnisse: titel (Titel der Erkenntnis), stufe (Stufe im Erkenntnisprozess), hypothese (Hypothese)
 *   - belege: beobachtung (Beobachtung), wirkung_auf_erkenntnis (Wirkung auf die Erkenntnis), erkenntnis (Erkenntnis)
 *   - regeln: regeltitel (Titel der Regel), regeltext (Regeltext), version (Version), freigabestatus (Freigabestatus), erkenntnis (Zugrunde liegende Erkenntnis)
 *   - regelanwendungen: regel (Regel), vorhaben (Vorhaben), angewendet_am (Angewendet am)
 *   - pilotbewertungen: vorhaben (Vorhaben), bewertet_am (Bewertet am), entscheidung (Entscheidung), entscheidungsbegruendung (Begründung der Entscheidung)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "vorhaben": "titel" | "intention" | "status" | "startdatum" | "enddatum" | "kontext" | "beteiligte_rollen" | "verwendete_systeme" | "informationsquellen" | "arbeit" | "entscheidung" | "entscheidung_durch" | "ergebnis" | "wirkung" | "erfahrung";
  "beobachtungen": "vorhaben" | "beschreibung" | "beobachtet_am" | "quelle" | "betroffene_objekte" | "fallart" | "beobachtet_von";
  "erkenntnisse": "widersprechende_erkenntnis" | "titel" | "stufe" | "hypothese" | "alternativerklaerungen" | "pruefung" | "schlussfolgerung" | "gueltigkeitsbereich" | "unsicherheit_grad" | "unsicherheiten" | "freigabestatus" | "freigegeben_von" | "letzte_pruefung" | "naechste_pruefung" | "widerspruch_notiz";
  "belege": "beobachtung" | "wirkung_auf_erkenntnis" | "begruendung" | "gewichtung" | "geprueft_von" | "geprueft_am" | "erkenntnis";
  "regeln": "regeltitel" | "regeltext" | "version" | "gueltigkeitsbereich" | "ausnahmeregelung" | "verantwortlicher" | "freigabestatus" | "freigegeben_von" | "gueltig_ab" | "aenderungsgrund" | "ruecknahmegrund" | "letzte_pruefung" | "naechste_pruefung" | "erkenntnis";
  "regelanwendungen": "regel" | "vorhaben" | "angewendet_am" | "art_der_anwendung" | "ergebnis" | "fehler_reduziert" | "nebenwirkungen" | "wirkungsbewertung" | "bewertet_von";
  "pilotbewertungen": "regel" | "vorhaben" | "bewertet_am" | "problem_reduziert" | "qualitaetsveraenderung" | "zusatzaufwand" | "akzeptanz" | "wiederverwendbar" | "voraussetzungen" | "entscheidung" | "entscheidungsbegruendung";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
