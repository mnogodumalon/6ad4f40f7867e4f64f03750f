// Auto-generated. Per-entity form-enhancements config for "Erkenntnisse".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", {"row": ["stufe", "freigabestatus"], "cols": "1fr 1fr"}, "hypothese", {"row": ["letzte_pruefung", "naechste_pruefung"], "cols": "1fr 1fr"}, {"row": ["unsicherheit_grad", "freigegeben_von"], "cols": "1fr 1fr"}, "widersprechende_erkenntnis", "alternativerklaerungen", "pruefung", "schlussfolgerung", "gueltigkeitsbereich", "unsicherheiten", "widerspruch_notiz"],
  defaults: {
    'stufe': { kind: 'lookup', key: 'hypothese', label: 'Hypothese' },
    'freigabestatus': { kind: 'lookup', key: 'entwurf', label: 'Entwurf' },
    'letzte_pruefung': { kind: 'today' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
