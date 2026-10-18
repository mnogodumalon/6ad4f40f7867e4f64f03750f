// The orchestrator's plan, as far as the running app needs it
// (docs/orchestrator/SPEC.md). Generated — do not edit; regenerated on every
// build and update from the stored plan. Without a plan every map is empty.
//
//   SYSTEM_ASSIGNED entity → fields a tool fills when a record is CREATED — the
//                   value does not exist before; dialogs hide these on create and
//                   the form-polish sets no default on them. A scheduled or
//                   update-triggered tool owns its field but is NOT in here.
//   PLAN_SENTENCES  slug → the plan in the owner's words (flows' field page)
//
// The runtime write guard (FLOW_WRITES/OWNERSHIP, planGuard.ts) left on
// 23.09.2026: a flow page composes against its generated hook, whose submit
// plan IS the Schreibliste — there is no way to spell a write outside it.

export const SYSTEM_ASSIGNED: Record<string, string[]> = {};

export const PLAN_SENTENCES: Record<string, string[]> = {
  "erkenntnis-aus-beobachtung-ableiten": [
    "Legt an: belege, erkenntnisse",
    "Automatisch: stufe (fester Wert „hypothese“), freigabestatus (fester Wert „entwurf“)"
  ],
  "erkenntnis-pruefen": [
    "Legt an: belege",
    "Ändert: erkenntnisse",
    "Automatisch: geprueft_am (heutiges Datum, automatisch), letzte_pruefung (heutiges Datum, automatisch)"
  ],
  "erkenntnis-freigeben-regel-ableiten": [
    "Legt an: regeln",
    "Ändert: erkenntnisse",
    "Automatisch: freigabestatus (fester Wert „zur_freigabe“), freigabestatus (fester Wert „zur_freigabe“)"
  ],
  "regel-freigeben-aendern": [
    "Ändert: erkenntnisse, regeln",
    "Automatisch: letzte_pruefung (heutiges Datum, automatisch)"
  ],
  "regel-anwenden": [
    "Legt an: regelanwendungen",
    "Automatisch: angewendet_am (heutiges Datum, automatisch)"
  ],
  "pilot-bewerten": [
    "Legt an: pilotbewertungen",
    "Automatisch: bewertet_am (heutiges Datum, automatisch)"
  ]
};

export const PLAN_SUMMARY = "Die Anwendung macht Erfahrungswissen aus Vorhaben nutzbar. Sie verfolgt den Weg von der Beobachtung über Hypothese und Prüfung zur freigegebenen Regel, hält die Ursprungsfälle nachvollziehbar fest und dokumentiert, wie sich eine Regel in späteren Vorhaben bewährt hat. Überprüfung, Einschränkung, Überholung und Rücknahme von Erkenntnissen und Regeln bleiben kontrolliert und sichtbar.";

/** slug → the lists a flow writes (the plan's Schreibliste). The nav leaves a
 *  flow out for a user who may not write one of them (lib/permissions.ts). */
export const FLOW_ENTITIES: Record<string, string[]> = {
  "erkenntnis-aus-beobachtung-ableiten": [
    "belege",
    "erkenntnisse"
  ],
  "erkenntnis-pruefen": [
    "belege",
    "erkenntnisse"
  ],
  "erkenntnis-freigeben-regel-ableiten": [
    "erkenntnisse",
    "regeln"
  ],
  "regel-freigeben-aendern": [
    "erkenntnisse",
    "regeln"
  ],
  "regel-anwenden": [
    "regelanwendungen"
  ],
  "pilot-bewerten": [
    "pilotbewertungen"
  ]
};
