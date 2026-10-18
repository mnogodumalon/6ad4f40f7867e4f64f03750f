// Auto-generated. Per-entity form-enhancements config for "Beobachtungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["vorhaben", {"row": ["beobachtet_am", "beobachtet_von"], "cols": "1fr 1fr"}, "fallart", "quelle", "beschreibung", "betroffene_objekte"],
  defaults: {
    'beobachtet_am': { kind: 'today', withTime: true },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
