// Auto-generated. Per-entity form-enhancements config for "Regeln".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["regeltitel", {"row": ["version", "freigabestatus"], "cols": "1fr 2fr"}, "erkenntnis", "regeltext", {"row": ["verantwortlicher", "freigegeben_von"], "cols": "1fr 1fr"}, "gueltig_ab", {"row": ["letzte_pruefung", "naechste_pruefung"], "cols": "1fr 1fr"}, "gueltigkeitsbereich", "ausnahmeregelung", "aenderungsgrund", "ruecknahmegrund"],
  defaults: {
    'freigabestatus': { kind: 'lookup', key: 'entwurf', label: 'Entwurf' },
    'gueltig_ab': { kind: 'today' },
    'version': { kind: 'literal', value: '1.0' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
