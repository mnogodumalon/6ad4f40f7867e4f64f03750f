import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Vorhaben {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    intention?: string;
    status?: LookupValue;
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    enddatum?: string; // Format: YYYY-MM-DD oder ISO String
    kontext?: string;
    beteiligte_rollen?: string;
    verwendete_systeme?: string;
    informationsquellen?: string;
    arbeit?: string;
    entscheidung?: string;
    entscheidung_durch?: string;
    ergebnis?: string;
    wirkung?: string;
    erfahrung?: string;
  };
}

export interface Beobachtungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    beschreibung?: string;
    beobachtet_am?: string; // Format: YYYY-MM-DD oder ISO String
    quelle?: string;
    betroffene_objekte?: string;
    fallart?: LookupValue;
    beobachtet_von?: string;
  };
}

export interface Erkenntnisse {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    widersprechende_erkenntnis?: RecordUrl; // applookup -> URL zu 'Erkenntnisse' Record
    titel?: string;
    stufe?: LookupValue;
    hypothese?: string;
    alternativerklaerungen?: string;
    pruefung?: string;
    schlussfolgerung?: string;
    gueltigkeitsbereich?: string;
    unsicherheit_grad?: LookupValue;
    unsicherheiten?: string;
    freigabestatus?: LookupValue;
    freigegeben_von?: string;
    letzte_pruefung?: string; // Format: YYYY-MM-DD oder ISO String
    naechste_pruefung?: string; // Format: YYYY-MM-DD oder ISO String
    widerspruch_notiz?: string;
  };
}

export interface Belege {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    beobachtung?: RecordUrl; // applookup -> URL zu 'Beobachtungen' Record
    wirkung_auf_erkenntnis?: LookupValue;
    begruendung?: string;
    gewichtung?: LookupValue;
    geprueft_von?: string;
    geprueft_am?: string; // Format: YYYY-MM-DD oder ISO String
    erkenntnis?: RecordUrl; // applookup -> URL zu 'Erkenntnisse' Record
  };
}

export interface Regeln {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    regeltitel?: string;
    regeltext?: string;
    version?: string;
    gueltigkeitsbereich?: string;
    ausnahmeregelung?: string;
    verantwortlicher?: string;
    freigabestatus?: LookupValue;
    freigegeben_von?: string;
    gueltig_ab?: string; // Format: YYYY-MM-DD oder ISO String
    aenderungsgrund?: string;
    ruecknahmegrund?: string;
    letzte_pruefung?: string; // Format: YYYY-MM-DD oder ISO String
    naechste_pruefung?: string; // Format: YYYY-MM-DD oder ISO String
    erkenntnis?: RecordUrl; // applookup -> URL zu 'Erkenntnisse' Record
  };
}

export interface Regelanwendungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    regel?: RecordUrl; // applookup -> URL zu 'Regeln' Record
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    angewendet_am?: string; // Format: YYYY-MM-DD oder ISO String
    art_der_anwendung?: LookupValue;
    ergebnis?: string;
    fehler_reduziert?: LookupValue;
    nebenwirkungen?: string;
    wirkungsbewertung?: string;
    bewertet_von?: string;
  };
}

export interface Pilotbewertungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    regel?: RecordUrl; // applookup -> URL zu 'Regeln' Record
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    bewertet_am?: string; // Format: YYYY-MM-DD oder ISO String
    problem_reduziert?: string;
    qualitaetsveraenderung?: string;
    zusatzaufwand?: string;
    akzeptanz?: string;
    wiederverwendbar?: string;
    voraussetzungen?: string;
    entscheidung?: LookupValue;
    entscheidungsbegruendung?: string;
  };
}

export const APP_IDS = {
  VORHABEN: '6ad4f3e3d6bf8d2cea389935',
  BEOBACHTUNGEN: '6ad4f3e977c3d7325d7b9804',
  ERKENNTNISSE: '6ad4f3eaeed0203ec90116f3',
  BELEGE: '6ad4f3eb5c5e65271ae61ea5',
  REGELN: '6ad4f3ec68b0bf1f8adef84c',
  REGELANWENDUNGEN: '6ad4f3ed00aeb6af9bff3c97',
  PILOTBEWERTUNGEN: '6ad4f3edb664a5c565f348d1',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'vorhaben': {
    status: [{ key: "geplant", get label() { return lookupLabel('vorhaben', 'status', "geplant") ?? "Geplant"; } }, { key: "in_arbeit", get label() { return lookupLabel('vorhaben', 'status', "in_arbeit") ?? "In Arbeit"; } }, { key: "abgeschlossen", get label() { return lookupLabel('vorhaben', 'status', "abgeschlossen") ?? "Abgeschlossen"; } }, { key: "abgebrochen", get label() { return lookupLabel('vorhaben', 'status', "abgebrochen") ?? "Abgebrochen"; } }],
  },
  'beobachtungen': {
    fallart: [{ key: "fehlende_angaben", get label() { return lookupLabel('beobachtungen', 'fallart', "fehlende_angaben") ?? "Fehlende Angaben"; } }, { key: "widerspruechlich", get label() { return lookupLabel('beobachtungen', 'fallart', "widerspruechlich") ?? "Widersprüchliche Dokumente"; } }, { key: "ausnahme", get label() { return lookupLabel('beobachtungen', 'fallart', "ausnahme") ?? "Ungewöhnliche Ausnahme"; } }, { key: "veraltet", get label() { return lookupLabel('beobachtungen', 'fallart', "veraltet") ?? "Veraltete Informationen"; } }, { key: "nicht_uebertragbar", get label() { return lookupLabel('beobachtungen', 'fallart', "nicht_uebertragbar") ?? "Frühere Lösung nicht übertragbar"; } }, { key: "vollstaendig", get label() { return lookupLabel('beobachtungen', 'fallart', "vollstaendig") ?? "Vollständige Informationen"; } }],
  },
  'erkenntnisse': {
    stufe: [{ key: "hypothese", get label() { return lookupLabel('erkenntnisse', 'stufe', "hypothese") ?? "Hypothese"; } }, { key: "in_pruefung", get label() { return lookupLabel('erkenntnisse', 'stufe', "in_pruefung") ?? "In Prüfung"; } }, { key: "erfahrung", get label() { return lookupLabel('erkenntnisse', 'stufe', "erfahrung") ?? "Erfahrung"; } }, { key: "eingeschraenkt", get label() { return lookupLabel('erkenntnisse', 'stufe', "eingeschraenkt") ?? "Eingeschränkt"; } }, { key: "ueberholt", get label() { return lookupLabel('erkenntnisse', 'stufe', "ueberholt") ?? "Überholt"; } }, { key: "zurueckgenommen", get label() { return lookupLabel('erkenntnisse', 'stufe', "zurueckgenommen") ?? "Zurückgenommen"; } }],
    unsicherheit_grad: [{ key: "gering", get label() { return lookupLabel('erkenntnisse', 'unsicherheit_grad', "gering") ?? "Gering"; } }, { key: "mittel", get label() { return lookupLabel('erkenntnisse', 'unsicherheit_grad', "mittel") ?? "Mittel"; } }, { key: "hoch", get label() { return lookupLabel('erkenntnisse', 'unsicherheit_grad', "hoch") ?? "Hoch"; } }],
    freigabestatus: [{ key: "entwurf", get label() { return lookupLabel('erkenntnisse', 'freigabestatus', "entwurf") ?? "Entwurf"; } }, { key: "zur_freigabe", get label() { return lookupLabel('erkenntnisse', 'freigabestatus', "zur_freigabe") ?? "Zur Freigabe"; } }, { key: "freigegeben", get label() { return lookupLabel('erkenntnisse', 'freigabestatus', "freigegeben") ?? "Freigegeben"; } }, { key: "abgelehnt", get label() { return lookupLabel('erkenntnisse', 'freigabestatus', "abgelehnt") ?? "Abgelehnt"; } }],
  },
  'belege': {
    wirkung_auf_erkenntnis: [{ key: "bestaetigend", get label() { return lookupLabel('belege', 'wirkung_auf_erkenntnis', "bestaetigend") ?? "Bestätigend"; } }, { key: "widersprechend", get label() { return lookupLabel('belege', 'wirkung_auf_erkenntnis', "widersprechend") ?? "Widersprechend"; } }, { key: "neutral", get label() { return lookupLabel('belege', 'wirkung_auf_erkenntnis', "neutral") ?? "Neutral"; } }],
    gewichtung: [{ key: "niedrig", get label() { return lookupLabel('belege', 'gewichtung', "niedrig") ?? "Niedrig"; } }, { key: "mittel", get label() { return lookupLabel('belege', 'gewichtung', "mittel") ?? "Mittel"; } }, { key: "hoch", get label() { return lookupLabel('belege', 'gewichtung', "hoch") ?? "Hoch"; } }],
  },
  'regeln': {
    freigabestatus: [{ key: "entwurf", get label() { return lookupLabel('regeln', 'freigabestatus', "entwurf") ?? "Entwurf"; } }, { key: "zur_freigabe", get label() { return lookupLabel('regeln', 'freigabestatus', "zur_freigabe") ?? "Zur Freigabe"; } }, { key: "freigegeben", get label() { return lookupLabel('regeln', 'freigabestatus', "freigegeben") ?? "Freigegeben"; } }, { key: "eingeschraenkt", get label() { return lookupLabel('regeln', 'freigabestatus', "eingeschraenkt") ?? "Eingeschränkt"; } }, { key: "ueberholt", get label() { return lookupLabel('regeln', 'freigabestatus', "ueberholt") ?? "Überholt"; } }, { key: "zurueckgenommen", get label() { return lookupLabel('regeln', 'freigabestatus', "zurueckgenommen") ?? "Zurückgenommen"; } }],
  },
  'regelanwendungen': {
    art_der_anwendung: [{ key: "regulaer", get label() { return lookupLabel('regelanwendungen', 'art_der_anwendung', "regulaer") ?? "Regulär angewendet"; } }, { key: "ausnahme", get label() { return lookupLabel('regelanwendungen', 'art_der_anwendung', "ausnahme") ?? "Mit autorisierter Ausnahme"; } }, { key: "nicht_anwendbar", get label() { return lookupLabel('regelanwendungen', 'art_der_anwendung', "nicht_anwendbar") ?? "Nicht anwendbar"; } }, { key: "nicht_angewendet", get label() { return lookupLabel('regelanwendungen', 'art_der_anwendung', "nicht_angewendet") ?? "Nicht angewendet"; } }],
    fehler_reduziert: [{ key: "ja", get label() { return lookupLabel('regelanwendungen', 'fehler_reduziert', "ja") ?? "Ja"; } }, { key: "teilweise", get label() { return lookupLabel('regelanwendungen', 'fehler_reduziert', "teilweise") ?? "Teilweise"; } }, { key: "nein", get label() { return lookupLabel('regelanwendungen', 'fehler_reduziert', "nein") ?? "Nein"; } }, { key: "nicht_beurteilbar", get label() { return lookupLabel('regelanwendungen', 'fehler_reduziert', "nicht_beurteilbar") ?? "Nicht beurteilbar"; } }],
  },
  'pilotbewertungen': {
    entscheidung: [{ key: "ausbauen", get label() { return lookupLabel('pilotbewertungen', 'entscheidung', "ausbauen") ?? "Ausbauen"; } }, { key: "anpassen", get label() { return lookupLabel('pilotbewertungen', 'entscheidung', "anpassen") ?? "Anpassen"; } }, { key: "beenden", get label() { return lookupLabel('pilotbewertungen', 'entscheidung', "beenden") ?? "Beenden"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'vorhaben': {
    'titel': 'string/text',
    'intention': 'string/textarea',
    'status': 'lookup/select',
    'startdatum': 'date/date',
    'enddatum': 'date/date',
    'kontext': 'string/textarea',
    'beteiligte_rollen': 'string/textarea',
    'verwendete_systeme': 'string/textarea',
    'informationsquellen': 'string/textarea',
    'arbeit': 'string/textarea',
    'entscheidung': 'string/textarea',
    'entscheidung_durch': 'string/text',
    'ergebnis': 'string/textarea',
    'wirkung': 'string/textarea',
    'erfahrung': 'string/textarea',
  },
  'beobachtungen': {
    'vorhaben': 'applookup/select',
    'beschreibung': 'string/textarea',
    'beobachtet_am': 'date/datetimeminute',
    'quelle': 'string/text',
    'betroffene_objekte': 'string/textarea',
    'fallart': 'lookup/select',
    'beobachtet_von': 'string/text',
  },
  'erkenntnisse': {
    'widersprechende_erkenntnis': 'applookup/select',
    'titel': 'string/text',
    'stufe': 'lookup/select',
    'hypothese': 'string/textarea',
    'alternativerklaerungen': 'string/textarea',
    'pruefung': 'string/textarea',
    'schlussfolgerung': 'string/textarea',
    'gueltigkeitsbereich': 'string/textarea',
    'unsicherheit_grad': 'lookup/radio',
    'unsicherheiten': 'string/textarea',
    'freigabestatus': 'lookup/select',
    'freigegeben_von': 'string/text',
    'letzte_pruefung': 'date/date',
    'naechste_pruefung': 'date/date',
    'widerspruch_notiz': 'string/textarea',
  },
  'belege': {
    'beobachtung': 'applookup/select',
    'wirkung_auf_erkenntnis': 'lookup/radio',
    'begruendung': 'string/textarea',
    'gewichtung': 'lookup/select',
    'geprueft_von': 'string/text',
    'geprueft_am': 'date/date',
    'erkenntnis': 'applookup/select',
  },
  'regeln': {
    'regeltitel': 'string/text',
    'regeltext': 'string/textarea',
    'version': 'string/text',
    'gueltigkeitsbereich': 'string/textarea',
    'ausnahmeregelung': 'string/textarea',
    'verantwortlicher': 'string/text',
    'freigabestatus': 'lookup/select',
    'freigegeben_von': 'string/text',
    'gueltig_ab': 'date/date',
    'aenderungsgrund': 'string/textarea',
    'ruecknahmegrund': 'string/textarea',
    'letzte_pruefung': 'date/date',
    'naechste_pruefung': 'date/date',
    'erkenntnis': 'applookup/select',
  },
  'regelanwendungen': {
    'regel': 'applookup/select',
    'vorhaben': 'applookup/select',
    'angewendet_am': 'date/date',
    'art_der_anwendung': 'lookup/select',
    'ergebnis': 'string/textarea',
    'fehler_reduziert': 'lookup/radio',
    'nebenwirkungen': 'string/textarea',
    'wirkungsbewertung': 'string/textarea',
    'bewertet_von': 'string/text',
  },
  'pilotbewertungen': {
    'regel': 'applookup/select',
    'vorhaben': 'applookup/select',
    'bewertet_am': 'date/date',
    'problem_reduziert': 'string/textarea',
    'qualitaetsveraenderung': 'string/textarea',
    'zusatzaufwand': 'string/textarea',
    'akzeptanz': 'string/textarea',
    'wiederverwendbar': 'string/textarea',
    'voraussetzungen': 'string/textarea',
    'entscheidung': 'lookup/radio',
    'entscheidungsbegruendung': 'string/textarea',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
  'vorhaben': [
    { field: 'vorhaben', entity: 'beobachtungen' },
    { field: 'vorhaben', entity: 'regelanwendungen' },
    { field: 'vorhaben', entity: 'pilotbewertungen' },
  ],
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateVorhaben = StripLookup<Vorhaben['fields']>;
export type CreateBeobachtungen = StripLookup<Beobachtungen['fields']>;
export type CreateErkenntnisse = StripLookup<Erkenntnisse['fields']>;
export type CreateBelege = StripLookup<Belege['fields']>;
export type CreateRegeln = StripLookup<Regeln['fields']>;
export type CreateRegelanwendungen = StripLookup<Regelanwendungen['fields']>;
export type CreatePilotbewertungen = StripLookup<Pilotbewertungen['fields']>;