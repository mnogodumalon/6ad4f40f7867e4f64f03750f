/**
 * useRegelFreigebenAendernFlow — the plumbing of the flow « Regel freigeben oder ändern », generated from the plan.
 *
 * Changes `regeln`: the record to change is picked (`flow.pick('regeln')`), the form is prefilled with its values; asks `freigabestatus`, `freigegeben_von`, `gueltig_ab`, `aenderungsgrund`, `ruecknahmegrund`, `gueltigkeitsbereich`, `naechste_pruefung`; sets `letzte_pruefung` itself.
Changes `erkenntnisse` (only when the person fills it): the record to change is picked (`flow.pick('erkenntnisse')`), the form is prefilled with its values; asks `freigabestatus`, `freigegeben_von`.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 4)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useRegelFreigebenAendernFlow({
 *     steps: { regeln: 1, erkenntnisse: 2, freigabestatus: 3, freigegeben_von: 3, gueltig_ab: 3, aenderungsgrund: 3, ruecknahmegrund: 3, gueltigkeitsbereich: 3, naechste_pruefung: 3 },
 *     items: { regeln: r => ({ id: r.id, title: fieldText(r, 'regeltitel') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.regeln.select} {...flow.pick('regeln')} />
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.erkenntnisse.select} {...flow.pick('erkenntnisse')} />
 *     <Bound form={flow.forms.regeln} name="freigabestatus" />
 *     <Bound form={flow.forms.regeln} name="freigegeben_von" />
 *     <Bound form={flow.forms.regeln} name="gueltig_ab" />
 *     <Bound form={flow.forms.regeln} name="aenderungsgrund" />
 *     <Bound form={flow.forms.regeln} name="ruecknahmegrund" />
 *     <Bound form={flow.forms.regeln} name="gueltigkeitsbereich" />
 *     <Bound form={flow.forms.regeln} name="naechste_pruefung" />
 *     <Bound form={flow.forms.erkenntnisse} name="freigabestatus" />
 *     <Bound form={flow.forms.erkenntnisse} name="freigegeben_von" />
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
export type RegelFreigebenAendernFieldKey = 'aenderungsgrund' | 'erkenntnisse' | 'freigabestatus' | 'freigegeben_von' | 'gueltig_ab' | 'gueltigkeitsbereich' | 'naechste_pruefung' | 'regeln' | 'ruecknahmegrund';

export interface RegelFreigebenAendernForms {
  regeln: StepForm<'regeln'>;
  erkenntnisse: StepForm<'erkenntnisse'>;
}

// Alias so the option generics stay readable.
type Key = RegelFreigebenAendernFieldKey;

export interface RegelFreigebenAendernFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    regeln?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    erkenntnisse?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"aenderungsgrund": 3, "erkenntnisse": 2, "freigabestatus": 3, "freigegeben_von": 3, "gueltig_ab": 3, "gueltigkeitsbereich": 3, "naechste_pruefung": 3, "regeln": 1, "ruecknahmegrund": 3};
export const REGELFREIGEBENAENDERN_REVIEW_STEP = 4;

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

export function useRegelFreigebenAendernFlow(options: RegelFreigebenAendernFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [regelnTargetId, setRegelnTargetId] = useState<string | null>(null);
  const [erkenntnisseTargetId, setErkenntnisseTargetId] = useState<string | null>(null);
  const regeln = useStepForm('regeln', {
    fields: ["freigabestatus", "freigegeben_von", "gueltig_ab", "aenderungsgrund", "ruecknahmegrund", "gueltigkeitsbereich", "naechste_pruefung"],
    steps: only(steps, ["freigabestatus", "freigegeben_von", "gueltig_ab", "aenderungsgrund", "ruecknahmegrund", "gueltigkeitsbereich", "naechste_pruefung"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["freigabestatus", "freigegeben_von", "gueltig_ab", "aenderungsgrund", "ruecknahmegrund", "gueltigkeitsbereich", "naechste_pruefung"]),
    messages: only(options.messages as Record<string, string> | undefined, ["freigabestatus", "freigegeben_von", "gueltig_ab", "aenderungsgrund", "ruecknahmegrund", "gueltigkeitsbereich", "naechste_pruefung"]),
  });
  const erkenntnisse = useStepForm('erkenntnisse', {
    fields: ["freigabestatus", "freigegeben_von"],
    steps: only(steps, ["freigabestatus", "freigegeben_von"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["freigabestatus", "freigegeben_von"]),
    messages: only(options.messages as Record<string, string> | undefined, ["freigabestatus", "freigegeben_von"]),
  });
  const forms: RegelFreigebenAendernForms = { regeln, erkenntnisse };
  const formList: StepForm[] = [regeln, erkenntnisse];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    regeln: useRecordSearch(servicePort, 'regeln', withPickPolicy('regeln', {
      searchFields: ["regeltitel", "version", "gueltigkeitsbereich"] as never,
      toItem: options.items?.regeln as never,
    })),
    erkenntnisse: useRecordSearch(servicePort, 'erkenntnisse', withPickPolicy('erkenntnisse', {
      searchFields: ["titel"] as never,
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
    `#/verwaltung/anwendung?line=intent:regel-freigeben-aendern:read:${entity}`);
  const picks = {
    regeln: { ...searches.regeln, select: { ...searches.regeln.select, create: false as boolean, hint: hintFor('regeln', 'regeln', null as PickWhere | null) } },
    erkenntnisse: { ...searches.erkenntnisse, select: { ...searches.erkenntnisse.select, create: false as boolean, hint: hintFor('erkenntnisse', 'erkenntnisse', null as PickWhere | null) } },
  };

  const erkenntnisseFilled = hasValues(erkenntnisse);
  const plan: PlanStep[] = [
    {
      key: 'regeln', entity: 'regeln', form: regeln,
      updates: () => regelnTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => regelnTargetId
        ? { key: 'target:regeln', label: entityLabel('regeln'), value: picks.regeln.labelOf(regelnTargetId) ?? regelnTargetId, step: steps.regeln }
        : undefined,
      values: (): FormValues => ({
        letzte_pruefung: policyFixedValue('regeln', 'letzte_pruefung') ?? todayIso(),
      }),
    },
    ...(erkenntnisseFilled ? [{
      key: 'erkenntnisse', entity: 'erkenntnisse', form: erkenntnisse, primary: true,
      updates: () => erkenntnisseTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => erkenntnisseTargetId
        ? { key: 'target:erkenntnisse', label: entityLabel('erkenntnisse'), value: picks.erkenntnisse.labelOf(erkenntnisseTargetId) ?? erkenntnisseTargetId, step: steps.erkenntnisse }
        : undefined,    } as PlanStep] : []),
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'regel-freigeben-aendern' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    regeln: {
      selectedId: regelnTargetId,
      onSelect: (id: string) => {
        setRegelnTargetId(id);
        const rec = picks.regeln.recordOf(id);
        if (rec) regeln.reset({ freigabestatus: fieldLookup(rec, "freigabestatus")?.key, freigegeben_von: fieldText(rec, "freigegeben_von"), gueltig_ab: fieldDate(rec, "gueltig_ab"), aenderungsgrund: fieldText(rec, "aenderungsgrund"), ruecknahmegrund: fieldText(rec, "ruecknahmegrund"), gueltigkeitsbereich: fieldText(rec, "gueltigkeitsbereich"), naechste_pruefung: fieldDate(rec, "naechste_pruefung"), });
      },
      get record(): JourneyRecord | undefined { return regelnTargetId ? picks.regeln.recordOf(regelnTargetId) : undefined; },
    },
    erkenntnisse: {
      selectedId: erkenntnisseTargetId,
      onSelect: (id: string) => {
        setErkenntnisseTargetId(id);
        const rec = picks.erkenntnisse.recordOf(id);
        if (rec) erkenntnisse.reset({ freigabestatus: fieldLookup(rec, "freigabestatus")?.key, freigegeben_von: fieldText(rec, "freigegeben_von"), });
      },
      get record(): JourneyRecord | undefined { return erkenntnisseTargetId ? picks.erkenntnisse.recordOf(erkenntnisseTargetId) : undefined; },
    },
  };
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: RegelFreigebenAendernFieldKey) => {
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
  const pickMany = (field: RegelFreigebenAendernFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setRegelnTargetId(null); setErkenntnisseTargetId(null); };

  return {
    slug: 'regel-freigeben-aendern' as const,
    draftKey: 'regel-freigeben-aendern' as const,
    entity: 'erkenntnisse' as const,
    form: erkenntnisse,
    forms, formList, picks, submit, steps, targets,    reviewStep: REGELFREIGEBENAENDERN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type RegelFreigebenAendernFlow = ReturnType<typeof useRegelFreigebenAendernFlow>;
