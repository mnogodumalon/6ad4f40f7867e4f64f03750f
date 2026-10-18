/**
 * useErkenntnisPruefenFlow — the plumbing of the flow « Erkenntnis prüfen », generated from the plan.
 *
 * Writes `belege` (only when the person fills it): asks `erkenntnis`, `beobachtung`, `wirkung_auf_erkenntnis`, `begruendung`, `gewichtung`, `geprueft_von`; sets `geprueft_am` itself.
Changes `erkenntnisse`: the record to change is picked (`flow.pick('erkenntnisse')`), the form is prefilled with its values; asks `pruefung`, `schlussfolgerung`, `stufe`, `unsicherheit_grad`, `unsicherheiten`, `gueltigkeitsbereich`, `widersprechende_erkenntnis`, `widerspruch_notiz`, `naechste_pruefung`; sets `letzte_pruefung` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 6)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useErkenntnisPruefenFlow({
 *     steps: { erkenntnisse: 1, erkenntnis: 2, beobachtung: 3, widersprechende_erkenntnis: 4, wirkung_auf_erkenntnis: 5, begruendung: 5, gewichtung: 5, geprueft_von: 5, pruefung: 5, schlussfolgerung: 5, stufe: 5, unsicherheit_grad: 5, unsicherheiten: 5, gueltigkeitsbereich: 5, widerspruch_notiz: 5, naechste_pruefung: 5 },
 *     items: { erkenntnis: r => ({ id: r.id, title: fieldText(r, 'titel') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.erkenntnis.select} {...flow.pick('erkenntnis')} />
 *     <EntitySelectStep {...flow.picks.beobachtung.select} {...flow.pick('beobachtung')} />
 *     <EntitySelectStep {...flow.picks.widersprechende_erkenntnis.select} {...flow.pick('widersprechende_erkenntnis')} />
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.erkenntnisse.select} {...flow.pick('erkenntnisse')} />
 *     <Bound form={flow.forms.belege} name="wirkung_auf_erkenntnis" />
 *     <Bound form={flow.forms.belege} name="begruendung" />
 *     <Bound form={flow.forms.belege} name="gewichtung" />
 *     <Bound form={flow.forms.belege} name="geprueft_von" />
 *     <Bound form={flow.forms.erkenntnisse} name="pruefung" />
 *     <Bound form={flow.forms.erkenntnisse} name="schlussfolgerung" />
 *     <Bound form={flow.forms.erkenntnisse} name="stufe" />
 *     <Bound form={flow.forms.erkenntnisse} name="unsicherheit_grad" />
 *     <Bound form={flow.forms.erkenntnisse} name="unsicherheiten" />
 *     <Bound form={flow.forms.erkenntnisse} name="gueltigkeitsbereich" />
 *     <Bound form={flow.forms.erkenntnisse} name="widerspruch_notiz" />
 *     <Bound form={flow.forms.erkenntnisse} name="naechste_pruefung" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import { useState } from 'react';
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
import { entityLabel } from '@/lib/journey/rules';
export type ErkenntnisPruefenFieldKey = 'begruendung' | 'beobachtung' | 'erkenntnis' | 'erkenntnisse' | 'geprueft_von' | 'gewichtung' | 'gueltigkeitsbereich' | 'naechste_pruefung' | 'pruefung' | 'schlussfolgerung' | 'stufe' | 'unsicherheit_grad' | 'unsicherheiten' | 'widersprechende_erkenntnis' | 'widerspruch_notiz' | 'wirkung_auf_erkenntnis';

export interface ErkenntnisPruefenForms {
  belege: StepForm<'belege'>;
  erkenntnisse: StepForm<'erkenntnisse'>;
}

// Alias so the option generics stay readable.
type Key = ErkenntnisPruefenFieldKey;

export interface ErkenntnisPruefenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    erkenntnis?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    beobachtung?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    widersprechende_erkenntnis?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    erkenntnisse?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"begruendung": 5, "beobachtung": 3, "erkenntnis": 2, "erkenntnisse": 1, "geprueft_von": 5, "gewichtung": 5, "gueltigkeitsbereich": 5, "naechste_pruefung": 5, "pruefung": 5, "schlussfolgerung": 5, "stufe": 5, "unsicherheit_grad": 5, "unsicherheiten": 5, "widersprechende_erkenntnis": 4, "widerspruch_notiz": 5, "wirkung_auf_erkenntnis": 5};
export const ERKENNTNISPRUEFEN_REVIEW_STEP = 6;

function fromPick<T>(pick: { recordOf(id: string): JourneyRecord | undefined }, form: StepForm, field: string, read: (r: JourneyRecord) => T): T | undefined {
  const id = form.get(field);
  const rec = typeof id === 'string' && id ? pick.recordOf(id) : undefined;
  return rec ? read(rec) : undefined;
}
function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useErkenntnisPruefenFlow(options: ErkenntnisPruefenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [erkenntnisseTargetId, setErkenntnisseTargetId] = useState<string | null>(null);
  const belege = useStepForm('belege', {
    fields: ["erkenntnis", "beobachtung", "wirkung_auf_erkenntnis", "begruendung", "gewichtung", "geprueft_von"],
    steps: only(steps, ["erkenntnis", "beobachtung", "wirkung_auf_erkenntnis", "begruendung", "gewichtung", "geprueft_von"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["erkenntnis", "beobachtung", "wirkung_auf_erkenntnis", "begruendung", "gewichtung", "geprueft_von"]),
    messages: only(options.messages as Record<string, string> | undefined, ["erkenntnis", "beobachtung", "wirkung_auf_erkenntnis", "begruendung", "gewichtung", "geprueft_von"]),
  });
  const erkenntnisse = useStepForm('erkenntnisse', {
    fields: ["pruefung", "schlussfolgerung", "stufe", "unsicherheit_grad", "unsicherheiten", "gueltigkeitsbereich", "widersprechende_erkenntnis", "widerspruch_notiz", "naechste_pruefung"],
    steps: only(steps, ["pruefung", "schlussfolgerung", "stufe", "unsicherheit_grad", "unsicherheiten", "gueltigkeitsbereich", "widersprechende_erkenntnis", "widerspruch_notiz", "naechste_pruefung"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["pruefung", "schlussfolgerung", "stufe", "unsicherheit_grad", "unsicherheiten", "gueltigkeitsbereich", "widersprechende_erkenntnis", "widerspruch_notiz", "naechste_pruefung"]),
    messages: only(options.messages as Record<string, string> | undefined, ["pruefung", "schlussfolgerung", "stufe", "unsicherheit_grad", "unsicherheiten", "gueltigkeitsbereich", "widersprechende_erkenntnis", "widerspruch_notiz", "naechste_pruefung"]),
  });
  const forms: ErkenntnisPruefenForms = { belege, erkenntnisse };
  const formList: StepForm[] = [belege, erkenntnisse];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    erkenntnis: useRecordSearch(servicePort, 'erkenntnisse', withPickPolicy('erkenntnis', {
      searchFields: ["titel", "hypothese"] as never,
      filter: "r.v_stufe in ['hypothese', 'in_pruefung', 'erfahrung', 'eingeschraenkt']",
      where: (r: JourneyRecord) => ["hypothese", "in_pruefung", "erfahrung", "eingeschraenkt"].includes(fieldLookup(r, "stufe")?.key ?? ''),
      toItem: options.items?.erkenntnis as never,
    })),
    beobachtung: useRecordSearch(servicePort, 'beobachtungen', withPickPolicy('beobachtung', {
      searchFields: ["beschreibung"] as never,
      toItem: options.items?.beobachtung as never,
    })),
    widersprechende_erkenntnis: useRecordSearch(servicePort, 'erkenntnisse', withPickPolicy('widersprechende_erkenntnis', {
      searchFields: ["titel", "hypothese"] as never,
      filter: "r.v_stufe in ['hypothese', 'in_pruefung', 'erfahrung', 'eingeschraenkt']",
      where: (r: JourneyRecord) => ["hypothese", "in_pruefung", "erfahrung", "eingeschraenkt"].includes(fieldLookup(r, "stufe")?.key ?? ''),
      toItem: options.items?.widersprechende_erkenntnis as never,
    })),
    erkenntnisse: useRecordSearch(servicePort, 'erkenntnisse', withPickPolicy('erkenntnisse', {
      searchFields: ["titel", "hypothese"] as never,
      filter: "r.v_stufe in ['hypothese', 'in_pruefung', 'erfahrung', 'eingeschraenkt']",
      where: (r: JourneyRecord) => ["hypothese", "in_pruefung", "erfahrung", "eingeschraenkt"].includes(fieldLookup(r, "stufe")?.key ?? ''),
      toItem: options.items?.erkenntnisse as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:erkenntnis-pruefen:read:${entity}`);
  const picks = {
    erkenntnis: { ...searches.erkenntnis, select: { ...searches.erkenntnis.select, create: false as boolean, hint: hintFor('erkenntnis', 'erkenntnisse', {"conditions": [{"field": "stufe", "op": "in", "value": ["hypothese", "in_pruefung", "erfahrung", "eingeschraenkt"]}], "mode": "all"} as PickWhere | null) } },
    beobachtung: { ...searches.beobachtung, select: { ...searches.beobachtung.select, create: true as boolean, hint: hintFor('beobachtung', 'beobachtungen', null as PickWhere | null) } },
    widersprechende_erkenntnis: { ...searches.widersprechende_erkenntnis, select: { ...searches.widersprechende_erkenntnis.select, create: false as boolean, hint: hintFor('widersprechende_erkenntnis', 'erkenntnisse', {"conditions": [{"field": "stufe", "op": "in", "value": ["hypothese", "in_pruefung", "erfahrung", "eingeschraenkt"]}], "mode": "all"} as PickWhere | null) } },
    erkenntnisse: { ...searches.erkenntnisse, select: { ...searches.erkenntnisse.select, create: false as boolean, hint: hintFor('erkenntnisse', 'erkenntnisse', {"conditions": [{"field": "stufe", "op": "in", "value": ["hypothese", "in_pruefung", "erfahrung", "eingeschraenkt"]}], "mode": "all"} as PickWhere | null) } },
  };

  const belegeFilled = hasValues(belege);
  const plan: PlanStep[] = [
    ...(belegeFilled ? [{
      key: 'belege', entity: 'belege', form: belege,
      values: (): FormValues => ({
        geprueft_am: policyFixedValue('belege', 'geprueft_am') ?? todayIso(),
      }),
    } as PlanStep] : []),
    {
      key: 'erkenntnisse', entity: 'erkenntnisse', form: erkenntnisse, primary: true,
      updates: () => erkenntnisseTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => erkenntnisseTargetId
        ? { key: 'target:erkenntnisse', label: entityLabel('erkenntnisse'), value: picks.erkenntnisse.labelOf(erkenntnisseTargetId) ?? erkenntnisseTargetId, step: steps.erkenntnisse }
        : undefined,
      values: (): FormValues => ({
        letzte_pruefung: policyFixedValue('erkenntnisse', 'letzte_pruefung') ?? todayIso(),
      }),
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'erkenntnis-pruefen' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    erkenntnisse: {
      selectedId: erkenntnisseTargetId,
      onSelect: (id: string) => {
        setErkenntnisseTargetId(id);
        const rec = picks.erkenntnisse.recordOf(id);
        if (rec) erkenntnisse.reset({ pruefung: fieldText(rec, "pruefung"), schlussfolgerung: fieldText(rec, "schlussfolgerung"), stufe: fieldLookup(rec, "stufe")?.key, unsicherheit_grad: fieldLookup(rec, "unsicherheit_grad")?.key, unsicherheiten: fieldText(rec, "unsicherheiten"), gueltigkeitsbereich: fieldText(rec, "gueltigkeitsbereich"), widersprechende_erkenntnis: fieldRef(rec, "widersprechende_erkenntnis"), widerspruch_notiz: fieldText(rec, "widerspruch_notiz"), naechste_pruefung: fieldDate(rec, "naechste_pruefung"), });
      },
      get record(): JourneyRecord | undefined { return erkenntnisseTargetId ? picks.erkenntnisse.recordOf(erkenntnisseTargetId) : undefined; },
    },
  };
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: ErkenntnisPruefenFieldKey) => {
    if (field in targets) {
      const t = targets[field as keyof typeof targets];
      return { selectedId: t.selectedId, onSelect: t.onSelect };
    }
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: ErkenntnisPruefenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setErkenntnisseTargetId(null); };

  return {
    slug: 'erkenntnis-pruefen' as const,
    draftKey: 'erkenntnis-pruefen' as const,
    entity: 'erkenntnisse' as const,
    form: erkenntnisse,
    forms, formList, picks, submit, steps, targets,    reviewStep: ERKENNTNISPRUEFEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type ErkenntnisPruefenFlow = ReturnType<typeof useErkenntnisPruefenFlow>;
