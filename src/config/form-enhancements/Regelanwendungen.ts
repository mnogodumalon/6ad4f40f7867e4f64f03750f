// Auto-generated. Per-entity form-enhancements config for "Regelanwendungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [{"row": ["regel", "vorhaben"], "cols": "1fr 1fr"}, {"row": ["angewendet_am", "art_der_anwendung"], "cols": "1fr 1fr"}, {"row": ["fehler_reduziert", "bewertet_von"], "cols": "1fr 1fr"}, "ergebnis", "nebenwirkungen", "wirkungsbewertung"],
  defaults: {
    'angewendet_am': { kind: 'today' },
    'art_der_anwendung': { kind: 'lookup', key: 'regulaer', label: 'Regulär angewendet' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
