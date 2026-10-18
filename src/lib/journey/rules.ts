/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'vorhaben' | 'beobachtungen' | 'erkenntnisse' | 'belege' | 'regeln' | 'regelanwendungen' | 'pilotbewertungen';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "vorhaben": "titel" | "intention" | "kontext" | "beteiligte_rollen" | "verwendete_systeme" | "informationsquellen" | "arbeit" | "entscheidung" | "entscheidung_durch" | "ergebnis" | "wirkung" | "erfahrung";
  "beobachtungen": "beschreibung" | "quelle" | "betroffene_objekte" | "beobachtet_von";
  "erkenntnisse": "titel" | "hypothese" | "alternativerklaerungen" | "pruefung" | "schlussfolgerung" | "gueltigkeitsbereich" | "unsicherheiten" | "freigegeben_von" | "widerspruch_notiz";
  "belege": "begruendung" | "geprueft_von";
  "regeln": "regeltitel" | "regeltext" | "version" | "gueltigkeitsbereich" | "ausnahmeregelung" | "verantwortlicher" | "freigegeben_von" | "aenderungsgrund" | "ruecknahmegrund";
  "regelanwendungen": "ergebnis" | "nebenwirkungen" | "wirkungsbewertung" | "bewertet_von";
  "pilotbewertungen": "problem_reduziert" | "qualitaetsveraenderung" | "zusatzaufwand" | "akzeptanz" | "wiederverwendbar" | "voraussetzungen" | "entscheidungsbegruendung";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "vorhaben": never;
  "beobachtungen": "vorhaben";
  "erkenntnisse": "widersprechende_erkenntnis";
  "belege": "beobachtung" | "erkenntnis";
  "regeln": "erkenntnis";
  "regelanwendungen": "regel" | "vorhaben";
  "pilotbewertungen": "regel" | "vorhaben";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "vorhaben": {
    "key": "vorhaben",
    "appId": "6ad4f3e3d6bf8d2cea389935",
    "label": "Vorhaben",
    "pascal": "Vorhaben",
    "single": "VorhabenEntry"
  },
  "beobachtungen": {
    "key": "beobachtungen",
    "appId": "6ad4f3e977c3d7325d7b9804",
    "label": "Beobachtungen",
    "pascal": "Beobachtungen",
    "single": "BeobachtungenEntry"
  },
  "erkenntnisse": {
    "key": "erkenntnisse",
    "appId": "6ad4f3eaeed0203ec90116f3",
    "label": "Erkenntnisse",
    "pascal": "Erkenntnisse",
    "single": "ErkenntnisseEntry"
  },
  "belege": {
    "key": "belege",
    "appId": "6ad4f3eb5c5e65271ae61ea5",
    "label": "Belege",
    "pascal": "Belege",
    "single": "BelegeEntry"
  },
  "regeln": {
    "key": "regeln",
    "appId": "6ad4f3ec68b0bf1f8adef84c",
    "label": "Regeln",
    "pascal": "Regeln",
    "single": "RegelnEntry"
  },
  "regelanwendungen": {
    "key": "regelanwendungen",
    "appId": "6ad4f3ed00aeb6af9bff3c97",
    "label": "Regelanwendungen",
    "pascal": "Regelanwendungen",
    "single": "RegelanwendungenEntry"
  },
  "pilotbewertungen": {
    "key": "pilotbewertungen",
    "appId": "6ad4f3edb664a5c565f348d1",
    "label": "Pilotbewertungen",
    "pascal": "Pilotbewertungen",
    "single": "PilotbewertungenEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "vorhaben": {
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel des Vorhabens",
      "writable": true,
      "maxLength": 4000
    },
    "intention": {
      "key": "intention",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Intention",
      "writable": true
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "geplant",
        "in_arbeit",
        "abgeschlossen",
        "abgebrochen"
      ]
    },
    "startdatum": {
      "key": "startdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Startdatum",
      "writable": true
    },
    "enddatum": {
      "key": "enddatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Abschlussdatum",
      "writable": true
    },
    "kontext": {
      "key": "kontext",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Kontext",
      "writable": true
    },
    "beteiligte_rollen": {
      "key": "beteiligte_rollen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beteiligte Rollen",
      "writable": true
    },
    "verwendete_systeme": {
      "key": "verwendete_systeme",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Verwendete Systeme",
      "writable": true
    },
    "informationsquellen": {
      "key": "informationsquellen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Informationsquellen",
      "writable": true
    },
    "arbeit": {
      "key": "arbeit",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Durchgeführte Arbeit",
      "writable": true
    },
    "entscheidung": {
      "key": "entscheidung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Getroffene Entscheidung",
      "writable": true
    },
    "entscheidung_durch": {
      "key": "entscheidung_durch",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Entschieden durch",
      "writable": true,
      "maxLength": 4000
    },
    "ergebnis": {
      "key": "ergebnis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Tatsächliches Ergebnis",
      "writable": true
    },
    "wirkung": {
      "key": "wirkung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Wirkung",
      "writable": true
    },
    "erfahrung": {
      "key": "erfahrung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Erfahrung",
      "writable": true
    }
  },
  "beobachtungen": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6ad4f3e3d6bf8d2cea389935",
      "targetEntity": "vorhaben"
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Was ist geschehen?",
      "writable": true
    },
    "beobachtet_am": {
      "key": "beobachtet_am",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": true,
      "label": "Zeitpunkt der Beobachtung",
      "writable": true
    },
    "quelle": {
      "key": "quelle",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Quelle",
      "writable": true,
      "maxLength": 4000
    },
    "betroffene_objekte": {
      "key": "betroffene_objekte",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Betroffene Objekte oder Produktvarianten",
      "writable": true
    },
    "fallart": {
      "key": "fallart",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Art des Falls",
      "writable": true,
      "options": [
        "fehlende_angaben",
        "widerspruechlich",
        "ausnahme",
        "veraltet",
        "nicht_uebertragbar",
        "vollstaendig"
      ]
    },
    "beobachtet_von": {
      "key": "beobachtet_von",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Beobachtet von",
      "writable": true,
      "maxLength": 4000
    }
  },
  "erkenntnisse": {
    "widersprechende_erkenntnis": {
      "key": "widersprechende_erkenntnis",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Widersprechende Erkenntnis",
      "writable": true,
      "targetAppId": "6ad4f3eaeed0203ec90116f3",
      "targetEntity": "erkenntnisse"
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel der Erkenntnis",
      "writable": true,
      "maxLength": 4000
    },
    "stufe": {
      "key": "stufe",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Stufe im Erkenntnisprozess",
      "writable": true,
      "options": [
        "hypothese",
        "in_pruefung",
        "erfahrung",
        "eingeschraenkt",
        "ueberholt",
        "zurueckgenommen"
      ]
    },
    "hypothese": {
      "key": "hypothese",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Hypothese",
      "writable": true
    },
    "alternativerklaerungen": {
      "key": "alternativerklaerungen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Alternativerklärungen",
      "writable": true
    },
    "pruefung": {
      "key": "pruefung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Prüfung",
      "writable": true
    },
    "schlussfolgerung": {
      "key": "schlussfolgerung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Schlussfolgerung",
      "writable": true
    },
    "gueltigkeitsbereich": {
      "key": "gueltigkeitsbereich",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Gültigkeitsbereich",
      "writable": true
    },
    "unsicherheit_grad": {
      "key": "unsicherheit_grad",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Grad der Unsicherheit",
      "writable": true,
      "options": [
        "gering",
        "mittel",
        "hoch"
      ]
    },
    "unsicherheiten": {
      "key": "unsicherheiten",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Verbleibende Unsicherheiten",
      "writable": true
    },
    "freigabestatus": {
      "key": "freigabestatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Freigabestatus",
      "writable": true,
      "options": [
        "entwurf",
        "zur_freigabe",
        "freigegeben",
        "abgelehnt"
      ]
    },
    "freigegeben_von": {
      "key": "freigegeben_von",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Freigegeben von",
      "writable": true,
      "maxLength": 4000
    },
    "letzte_pruefung": {
      "key": "letzte_pruefung",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Zuletzt überprüft am",
      "writable": true
    },
    "naechste_pruefung": {
      "key": "naechste_pruefung",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Nächste Überprüfung am",
      "writable": true
    },
    "widerspruch_notiz": {
      "key": "widerspruch_notiz",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Dokumentation des Widerspruchs",
      "writable": true
    }
  },
  "belege": {
    "beobachtung": {
      "key": "beobachtung",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Beobachtung",
      "writable": true,
      "targetAppId": "6ad4f3e977c3d7325d7b9804",
      "targetEntity": "beobachtungen"
    },
    "wirkung_auf_erkenntnis": {
      "key": "wirkung_auf_erkenntnis",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Wirkung auf die Erkenntnis",
      "writable": true,
      "options": [
        "bestaetigend",
        "widersprechend",
        "neutral"
      ]
    },
    "begruendung": {
      "key": "begruendung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Begründung",
      "writable": true
    },
    "gewichtung": {
      "key": "gewichtung",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Gewichtung",
      "writable": true,
      "options": [
        "niedrig",
        "mittel",
        "hoch"
      ]
    },
    "geprueft_von": {
      "key": "geprueft_von",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Geprüft von",
      "writable": true,
      "maxLength": 4000
    },
    "geprueft_am": {
      "key": "geprueft_am",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Geprüft am",
      "writable": true
    },
    "erkenntnis": {
      "key": "erkenntnis",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Erkenntnis",
      "writable": true,
      "targetAppId": "6ad4f3eaeed0203ec90116f3",
      "targetEntity": "erkenntnisse"
    }
  },
  "regeln": {
    "regeltitel": {
      "key": "regeltitel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel der Regel",
      "writable": true,
      "maxLength": 4000
    },
    "regeltext": {
      "key": "regeltext",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Regeltext",
      "writable": true
    },
    "version": {
      "key": "version",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Version",
      "writable": true,
      "maxLength": 4000
    },
    "gueltigkeitsbereich": {
      "key": "gueltigkeitsbereich",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Gültigkeitsbereich",
      "writable": true
    },
    "ausnahmeregelung": {
      "key": "ausnahmeregelung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Autorisierte Ausnahme",
      "writable": true
    },
    "verantwortlicher": {
      "key": "verantwortlicher",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Verantwortlich",
      "writable": true,
      "maxLength": 4000
    },
    "freigabestatus": {
      "key": "freigabestatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Freigabestatus",
      "writable": true,
      "options": [
        "entwurf",
        "zur_freigabe",
        "freigegeben",
        "eingeschraenkt",
        "ueberholt",
        "zurueckgenommen"
      ]
    },
    "freigegeben_von": {
      "key": "freigegeben_von",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Freigegeben von",
      "writable": true,
      "maxLength": 4000
    },
    "gueltig_ab": {
      "key": "gueltig_ab",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Gültig ab",
      "writable": true
    },
    "aenderungsgrund": {
      "key": "aenderungsgrund",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Änderungsgrund",
      "writable": true
    },
    "ruecknahmegrund": {
      "key": "ruecknahmegrund",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Rücknahmegrund",
      "writable": true
    },
    "letzte_pruefung": {
      "key": "letzte_pruefung",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Zuletzt überprüft am",
      "writable": true
    },
    "naechste_pruefung": {
      "key": "naechste_pruefung",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Nächste Überprüfung am",
      "writable": true
    },
    "erkenntnis": {
      "key": "erkenntnis",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Zugrunde liegende Erkenntnis",
      "writable": true,
      "targetAppId": "6ad4f3eaeed0203ec90116f3",
      "targetEntity": "erkenntnisse"
    }
  },
  "regelanwendungen": {
    "regel": {
      "key": "regel",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Regel",
      "writable": true,
      "targetAppId": "6ad4f3ec68b0bf1f8adef84c",
      "targetEntity": "regeln"
    },
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6ad4f3e3d6bf8d2cea389935",
      "targetEntity": "vorhaben"
    },
    "angewendet_am": {
      "key": "angewendet_am",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Angewendet am",
      "writable": true
    },
    "art_der_anwendung": {
      "key": "art_der_anwendung",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Art der Anwendung",
      "writable": true,
      "options": [
        "regulaer",
        "ausnahme",
        "nicht_anwendbar",
        "nicht_angewendet"
      ]
    },
    "ergebnis": {
      "key": "ergebnis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Ergebnis",
      "writable": true
    },
    "fehler_reduziert": {
      "key": "fehler_reduziert",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Fehler oder Verzögerungen reduziert?",
      "writable": true,
      "options": [
        "ja",
        "teilweise",
        "nein",
        "nicht_beurteilbar"
      ]
    },
    "nebenwirkungen": {
      "key": "nebenwirkungen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Unerwünschte Nebenwirkungen",
      "writable": true
    },
    "wirkungsbewertung": {
      "key": "wirkungsbewertung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bewertung der Wirkung",
      "writable": true
    },
    "bewertet_von": {
      "key": "bewertet_von",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Bewertet von",
      "writable": true,
      "maxLength": 4000
    }
  },
  "pilotbewertungen": {
    "regel": {
      "key": "regel",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Betroffene Regel",
      "writable": true,
      "targetAppId": "6ad4f3ec68b0bf1f8adef84c",
      "targetEntity": "regeln"
    },
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6ad4f3e3d6bf8d2cea389935",
      "targetEntity": "vorhaben"
    },
    "bewertet_am": {
      "key": "bewertet_am",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Bewertet am",
      "writable": true
    },
    "problem_reduziert": {
      "key": "problem_reduziert",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Wurde das Problem tatsächlich reduziert?",
      "writable": true
    },
    "qualitaetsveraenderung": {
      "key": "qualitaetsveraenderung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Qualitätsveränderungen",
      "writable": true
    },
    "zusatzaufwand": {
      "key": "zusatzaufwand",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Zusätzlicher Aufwand",
      "writable": true
    },
    "akzeptanz": {
      "key": "akzeptanz",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Annahme durch die Mitarbeitenden",
      "writable": true
    },
    "wiederverwendbar": {
      "key": "wiederverwendbar",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Wiederverwendbare Teile",
      "writable": true
    },
    "voraussetzungen": {
      "key": "voraussetzungen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Voraussetzungen für weitere Anwendungsfälle",
      "writable": true
    },
    "entscheidung": {
      "key": "entscheidung",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Entscheidung",
      "writable": true,
      "options": [
        "ausbauen",
        "anpassen",
        "beenden"
      ]
    },
    "entscheidungsbegruendung": {
      "key": "entscheidungsbegruendung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Begründung der Entscheidung",
      "writable": true
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "vorhaben": [
    {
      "kind": "range",
      "from": "startdatum",
      "to": "enddatum"
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    }
  ],
  "beobachtungen": [
    {
      "kind": "choice",
      "field": "fallart",
      "count": 6
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    }
  ],
  "erkenntnisse": [
    {
      "kind": "choice",
      "field": "stufe",
      "count": 6
    },
    {
      "kind": "choice",
      "field": "unsicherheit_grad",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "freigabestatus",
      "count": 4
    },
    {
      "kind": "record",
      "field": "widersprechende_erkenntnis",
      "targetEntity": "erkenntnisse"
    }
  ],
  "belege": [
    {
      "kind": "choice",
      "field": "wirkung_auf_erkenntnis",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "gewichtung",
      "count": 3
    },
    {
      "kind": "record",
      "field": "beobachtung",
      "targetEntity": "beobachtungen"
    },
    {
      "kind": "record",
      "field": "erkenntnis",
      "targetEntity": "erkenntnisse"
    }
  ],
  "regeln": [
    {
      "kind": "choice",
      "field": "freigabestatus",
      "count": 6
    },
    {
      "kind": "record",
      "field": "erkenntnis",
      "targetEntity": "erkenntnisse"
    }
  ],
  "regelanwendungen": [
    {
      "kind": "choice",
      "field": "art_der_anwendung",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "fehler_reduziert",
      "count": 4
    },
    {
      "kind": "record",
      "field": "regel",
      "targetEntity": "regeln"
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    }
  ],
  "pilotbewertungen": [
    {
      "kind": "choice",
      "field": "entscheidung",
      "count": 3
    },
    {
      "kind": "record",
      "field": "regel",
      "targetEntity": "regeln"
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "vorhaben": [
    "titel"
  ],
  "beobachtungen": [
    "quelle"
  ],
  "erkenntnisse": [
    "titel"
  ],
  "belege": [
    "begruendung"
  ],
  "regeln": [
    "regeltitel"
  ],
  "regelanwendungen": [
    "ergebnis"
  ],
  "pilotbewertungen": [
    "problem_reduziert"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
