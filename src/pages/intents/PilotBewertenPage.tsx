/**
 * Pilot bewerten — 4-Schritt-Wizard.
 * Steps: 1) Vorhaben und betroffene Regel wählen → 2) Bisherige Regelanwendungen ansehen
 *        → 3) Wirkung bewerten und Entscheidung begründen → 4) Prüfen & speichern.
 * Reads: vorhaben, regeln (Auswahl), regelanwendungen (Rückblick, über flow.port).
 * Writes: pilotbewertungen (via usePilotBewertenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useEffect, useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import {
  combineFilters,
  fieldLookup,
  fieldText,
  refFilter,
  todayIso,
  formatFieldValue,
  type JourneyRecord,
} from '@/lib/journey';
import { usePilotBewertenFlow } from '@/lib/journey/flows/PilotBewerten';
import { tx } from '@/i18n';

export default function PilotBewertenPage() {
  const [step, setStep] = useState(1);
  const flow = usePilotBewertenFlow({
    steps: {
      vorhaben: 1, regel: 1,
      problem_reduziert: 3, qualitaetsveraenderung: 3, zusatzaufwand: 3, akzeptanz: 3,
      wiederverwendbar: 3, voraussetzungen: 3, entscheidung: 3, entscheidungsbegruendung: 3,
    },
    items: {
      vorhaben: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldLookup(r, 'status')?.label,
      }),
      regel: r => ({
        id: r.id,
        title: fieldText(r, 'regeltitel'),
        subtitle: fieldText(r, 'version'),
      }),
    },
  });
  const f = flow.forms.pilotbewertungen;
  const vorhabenId = (f.get('vorhaben') as string | null) || null;
  const regelId = (f.get('regel') as string | null) || null;

  const [anwendungen, setAnwendungen] = useState<JourneyRecord[]>([]);
  const [anwLoading, setAnwLoading] = useState(false);
  const [anwError, setAnwError] = useState<string | null>(null);

  useEffect(() => {
    if (!vorhabenId) { setAnwendungen([]); return; }
    let cancelled = false;
    setAnwLoading(true);
    setAnwError(null);
    flow.port
      .list('regelanwendungen', {
        filter: combineFilters(refFilter('vorhaben', vorhabenId), regelId ? refFilter('regel', regelId) : undefined),
        limit: 100,
      })
      .then(rows => { if (!cancelled) setAnwendungen(rows); })
      .catch(e => { if (!cancelled) setAnwError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setAnwLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vorhabenId, regelId, flow.port]);

  const reduziert = anwendungen.filter(a => fieldLookup(a, 'fehler_reduziert')?.key === 'ja').length;
  const teilweise = anwendungen.filter(a => fieldLookup(a, 'fehler_reduziert')?.key === 'teilweise').length;

  return (
    <IntentWizardShell
      title={tx('Pilot bewerten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Bewerte, ob der Pilot das Problem reduziert hat, und entscheide, wie es weitergeht.'),
        needs: [tx('Das Vorhaben des Piloten'), tx('Die betroffene Regel'), tx('Deine Einschätzung zur Wirkung')],
      }}
    >
      <WizardStep label={tx('Vorhaben & Regel')} description={tx('Welches Vorhaben war der Pilot, und welche Regel wurde erprobt?')}>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{tx('Vorhaben')}</h3>
            <EntitySelectStep
              {...flow.picks.vorhaben.select}
              {...flow.pick('vorhaben')}
              searchPlaceholder={tx('Vorhaben suchen …')}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{tx('Betroffene Regel')}</h3>
            <EntitySelectStep
              {...flow.picks.regel.select}
              {...flow.pick('regel')}
              searchPlaceholder={tx('Regel suchen …')}
            />
          </div>
          <StepNav onNext={() => flow.validateStep(1)} nextStepLabel={tx('Regelanwendungen')} />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Regelanwendungen')}
        description={tx('So wurde die Regel bisher angewendet — das hilft dir bei der Bewertung.')}
        needs={['vorhaben']}
      >
        <div className="space-y-4">
          {anwLoading && <p className="text-sm text-muted-foreground">{tx('Lade Regelanwendungen …')}</p>}
          {anwError && <p className="text-sm text-destructive">{anwError}</p>}
          {!anwLoading && !anwError && anwendungen.length === 0 && (
            <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
              {tx('Zu dieser Auswahl gibt es noch keine Regelanwendungen. Du kannst trotzdem bewerten.')}
            </div>
          )}
          {anwendungen.length > 0 && (
            <>
              <p className="text-sm">
                {tx`${anwendungen.length} Anwendungen — Fehler reduziert: ${reduziert} ja, ${teilweise} teilweise`}
              </p>
              <ul className="space-y-2">
                {anwendungen.map(a => {
                  const art = fieldLookup(a, 'art_der_anwendung')?.label;
                  const red = fieldLookup(a, 'fehler_reduziert')?.label;
                  const neben = fieldText(a, 'nebenwirkungen');
                  return (
                    <li key={a.id} data-key={a.id} className="min-w-0 overflow-hidden rounded-2xl border bg-card p-3">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
                        {art && <span>{art}</span>}
                        <span className="text-muted-foreground">
                          {tx('Fehler reduziert')}: {red ?? formatFieldValue('regelanwendungen', 'fehler_reduziert', null)}
                        </span>
                      </div>
                      {neben && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {tx('Nebenwirkungen')}: {neben}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <StepNav onBack={() => setStep(1)} nextStepLabel={tx('Bewertung')} />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Bewertung')}
        description={tx('Halte fest, was der Pilot gebracht hat — und entscheide mit Begründung.')}
        needs={['vorhaben']}
      >
        <div className="space-y-4">
          <Bound form={f} name="problem_reduziert" rows={3} />
          <Bound form={f} name="qualitaetsveraenderung" rows={3} />
          <Bound form={f} name="zusatzaufwand" rows={3} />
          <Bound form={f} name="akzeptanz" rows={3} />
          <Bound form={f} name="wiederverwendbar" rows={3} />
          <Bound form={f} name="voraussetzungen" rows={3} />
          <Bound form={f} name="entscheidung" />
          <Bound form={f} name="entscheidungsbegruendung" rows={4} />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'bewertet_am', label: tx('Bewertet am'), value: formatFieldValue('pilotbewertungen', 'bewertet_am', todayIso()) }]}
            whatHappensNext={tx('Die Bewertung wird gespeichert und die Entscheidung ist für alle nachvollziehbar.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Bei „ausbauen“ oder „anpassen“ kannst du die Regel im nächsten Vorhaben anwenden oder sie ändern.')}
          next={[
            { label: tx('Regel freigeben oder ändern'), href: '#/intents/regel-freigeben-aendern' },
            { label: tx('Regel im Vorhaben anwenden'), href: '#/intents/regel-anwenden' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
