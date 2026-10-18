/**
 * useErkenntnisAusBeobachtungAbleitenFlow — the plumbing of the flow « Erkenntnis aus Beobachtung ableiten », generated from the plan.
 *
 * Writes `erkenntnisse`: asks `titel`, `hypothese`, `alternativerklaerungen`, `gueltigkeitsbereich`, `unsicherheit_grad`, `unsicherheiten`; sets `stufe`, `freigabestatus` itself.
Writes `belege`: asks `beobachtung`, `wirkung_auf_erkenntnis`, `begruendung`, `gewichtung`; links `erkenntnis` ← the created `erkenntnisse`.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 3)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useErkenntnisAusBeobachtungAbleitenFlow({
 *     steps: { beobachtung: 1, titel: 2, hypothese: 2, alternativerklaerungen: 2, gueltigkeitsbereich: 2, unsicherheit_grad: 2, unsicherheiten: 2, wirkung_auf_erkenntnis: 2, begruendung: 2, gewichtung: 2 },
 *     items: { beobachtung: r => ({ id: r.id, title: fieldText(r, 'beschreibung') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.beobachtung.select} {...flow.pick('beobachtung')} />
 *     <Bound form={flow.forms.erkenntnisse} name="titel" />
 *     <Bound form={flow.forms.erkenntnisse} name="hypothese" />
 *     <Bound form={flow.forms.erkenntnisse} name="alternativerklaerungen" />
 *     <Bound form={flow.forms.erkenntnisse} name="gueltigkeitsbereich" />
 *     <Bound form={flow.forms.erkenntnisse} name="unsicherheit_grad" />
 *     <Bound form={flow.forms.erkenntnisse} name="unsicherheiten" />
 *     <Bound form={flow.forms.belege} name="wirkung_auf_erkenntnis" />
 *     <Bound form={flow.forms.belege} name="begruendung" />
 *     <Bound form={flow.forms.belege} name="gewichtung" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep, type SummaryItem,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
export type ErkenntnisAusBeobachtungAbleitenFieldKey = 'alternativerklaerungen' | 'begruendung' | 'beobachtung' | 'gewichtung' | 'gueltigkeitsbereich' | 'hypothese' | 'titel' | 'unsicherheit_grad' | 'unsicherheiten' | 'wirkung_auf_erkenntnis';

export interface ErkenntnisAusBeobachtungAbleitenForms {
  erkenntnisse: StepForm<'erkenntnisse'>;
  belege: StepForm<'belege'>;
}

// Alias so the option generics stay readable.
type Key = ErkenntnisAusBeobachtungAbleitenFieldKey;

export interface ErkenntnisAusBeobachtungAbleitenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    beobachtung?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"alternativerklaerungen": 2, "begruendung": 2, "beobachtung": 1, "gewichtung": 2, "gueltigkeitsbereich": 2, "hypothese": 2, "titel": 2, "unsicherheit_grad": 2, "unsicherheiten": 2, "wirkung_auf_erkenntnis": 2};
export const ERKENNTNISAUSBEOBACHTUNGABLEITEN_REVIEW_STEP = 3;

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

export function useErkenntnisAusBeobachtungAbleitenFlow(options: ErkenntnisAusBeobachtungAbleitenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const erkenntnisse = useStepForm('erkenntnisse', {
    fields: ["titel", "hypothese", "alternativerklaerungen", "gueltigkeitsbereich", "unsicherheit_grad", "unsicherheiten"],
    steps: only(steps, ["titel", "hypothese", "alternativerklaerungen", "gueltigkeitsbereich", "unsicherheit_grad", "unsicherheiten"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["titel", "hypothese", "alternativerklaerungen", "gueltigkeitsbereich", "unsicherheit_grad", "unsicherheiten"]),
    messages: only(options.messages as Record<string, string> | undefined, ["titel", "hypothese", "alternativerklaerungen", "gueltigkeitsbereich", "unsicherheit_grad", "unsicherheiten"]),
  });
  const belege = useStepForm('belege', {
    fields: ["beobachtung", "wirkung_auf_erkenntnis", "begruendung", "gewichtung"],
    steps: only(steps, ["beobachtung", "wirkung_auf_erkenntnis", "begruendung", "gewichtung"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["beobachtung", "wirkung_auf_erkenntnis", "begruendung", "gewichtung"]),
    messages: only(options.messages as Record<string, string> | undefined, ["beobachtung", "wirkung_auf_erkenntnis", "begruendung", "gewichtung"]),
  });
  const forms: ErkenntnisAusBeobachtungAbleitenForms = { erkenntnisse, belege };
  const formList: StepForm[] = [erkenntnisse, belege];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    beobachtung: useRecordSearch(servicePort, 'beobachtungen', withPickPolicy('beobachtung', {
      searchFields: ["beschreibung", "betroffene_objekte"] as never,
      toItem: options.items?.beobachtung as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:erkenntnis-aus-beobachtung-ableiten:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:erkenntnis-aus-beobachtung-ableiten:write:${entity}.${field}`,
  });
  const picks = {
    beobachtung: { ...searches.beobachtung, select: { ...searches.beobachtung.select, create: true as boolean, hint: hintFor('beobachtung', 'beobachtungen', null as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'erkenntnisse', entity: 'erkenntnisse', form: erkenntnisse,
      values: (): FormValues => ({
        stufe: policyFixedValue('erkenntnisse', 'stufe') ?? "hypothese",
        freigabestatus: policyFixedValue('erkenntnisse', 'freigabestatus') ?? "entwurf",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('erkenntnisse', 'stufe', policyFixedValue('erkenntnisse', 'stufe') ?? "hypothese"), setting('erkenntnisse', 'freigabestatus', policyFixedValue('erkenntnisse', 'freigabestatus') ?? "entwurf")],
    },
    {
      key: 'belege', entity: 'belege', form: belege, primary: true,      needs: ['erkenntnisse'],
      link: { erkenntnis: 'erkenntnisse' },
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'erkenntnis-aus-beobachtung-ableiten' });

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: ErkenntnisAusBeobachtungAbleitenFieldKey) => {
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
  const pickMany = (field: ErkenntnisAusBeobachtungAbleitenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'erkenntnis-aus-beobachtung-ableiten' as const,
    draftKey: 'erkenntnis-aus-beobachtung-ableiten' as const,
    entity: 'belege' as const,
    form: belege,
    forms, formList, picks, submit, steps,    reviewStep: ERKENNTNISAUSBEOBACHTUNGABLEITEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type ErkenntnisAusBeobachtungAbleitenFlow = ReturnType<typeof useErkenntnisAusBeobachtungAbleitenFlow>;
