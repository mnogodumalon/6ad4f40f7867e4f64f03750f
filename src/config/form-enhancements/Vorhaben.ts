// Auto-generated. Per-entity form-enhancements config for "Vorhaben".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", "status", "intention", {"row": ["startdatum", "enddatum"]}, "entscheidung_durch", "kontext", "beteiligte_rollen", "verwendete_systeme", "informationsquellen", "arbeit", "entscheidung", "ergebnis", "wirkung", "erfahrung"],
  defaults: {
    'status': { kind: 'lookup', key: 'geplant', label: 'Geplant' },
    'startdatum': { kind: 'today' },
  },
  computed: {
    '_vorhaben_dauer_tage': { kind: 'dateDiff', from: 'startdatum', to: 'enddatum', unit: 'days' },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
