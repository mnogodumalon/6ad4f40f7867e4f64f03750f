// Auto-generated. Per-entity form-enhancements config for "Belege".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [{"row": ["erkenntnis", "beobachtung"], "cols": "1fr 1fr"}, {"row": ["wirkung_auf_erkenntnis", "gewichtung"], "cols": "1fr 1fr"}, {"row": ["geprueft_von", "geprueft_am"], "cols": "1fr 1fr"}, "begruendung"],
  defaults: {
    'geprueft_am': { kind: 'today' },
    'wirkung_auf_erkenntnis': { kind: 'lookup', key: 'neutral', label: 'Neutral' },
    'gewichtung': { kind: 'lookup', key: 'mittel', label: 'Mittel' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
