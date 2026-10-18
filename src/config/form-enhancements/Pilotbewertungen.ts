// Auto-generated. Per-entity form-enhancements config for "Pilotbewertungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["vorhaben", "regel", {"row": ["bewertet_am", "entscheidung"], "cols": "1fr 1fr"}, "entscheidungsbegruendung", "problem_reduziert", "qualitaetsveraenderung", "zusatzaufwand", "akzeptanz", "wiederverwendbar", "voraussetzungen"],
  defaults: {
    'bewertet_am': { kind: 'today' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
