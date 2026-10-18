/**
 * Regel im Vorhaben anwenden — 5-Schritt-Wizard.
 * Steps: 1) Vorhaben wählen → 2) Freigegebene Regel wählen → 3) Art der Anwendung und Ergebnis
 *        → 4) Wirkung auf Fehler, Nebenwirkungen und Bewertung → 5) Prüfen & anlegen.
 * Reads: vorhaben, regeln. Writes: regelanwendungen (via useRegelAnwendenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useRegelAnwendenFlow } from '@/lib/journey/flows/RegelAnwenden';
import { tx } from '@/i18n';

export default function RegelAnwendenPage() {
  const [step, setStep] = useState(1);
  const flow = useRegelAnwendenFlow({
    steps: {
      vorhaben: 1,
      regel: 2,
      art_der_anwendung: 3,
      ergebnis: 3,
      fehler_reduziert: 4,
      nebenwirkungen: 4,
      wirkungsbewertung: 4,
      bewertet_von: 4,
    },
    items: {
      vorhaben: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldText(r, 'intention'),
        status: fieldLookup(r, 'status') ?? undefined,
      }),
      regel: r => ({
        id: r.id,
        title: fieldText(r, 'regeltitel'),
        subtitle: tx`Version ${fieldText(r, 'version')}`,
      }),
    },
  });

  const f = flow.forms.regelanwendungen;

  return (
    <IntentWizardShell
      title={tx('Regel anwenden')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine freigegebene Regel einem Vorhaben zuordnen und ihre Wirkung festhalten.'),
        needs: [tx('Das Vorhaben'), tx('Die angewendete Regel'), tx('Dein Eindruck zur Wirkung')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('In welchem Vorhaben wurde die Regel angewendet?')}>
        <EntitySelectStep
          {...flow.picks.vorhaben.select}
          {...flow.pick('vorhaben')}
          searchPlaceholder={tx('Titel des Vorhabens …')}
        />
      </WizardStep>
      <WizardStep label={tx('Regel')} description={tx('Welche freigegebene Regel wurde angewendet?')} needs={['vorhaben']}>
        <EntitySelectStep
          {...flow.picks.regel.select}
          {...flow.pick('regel')}
          searchPlaceholder={tx('Titel der Regel …')}
          emptyText={tx('Es gibt noch keine freigegebene Regel. Gib zuerst eine Regel frei.')}
        />
      </WizardStep>
      <WizardStep label={tx('Anwendung')} description={tx('Wie wurde die Regel angewendet und was kam dabei heraus?')} needs={['vorhaben', 'regel']}>
        <div className="space-y-4">
          <Bound form={f} name="art_der_anwendung" />
          <Bound form={f} name="ergebnis" rows={4} />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Wirkung')}
          />
        </div>
      </WizardStep>
      <WizardStep label={tx('Wirkung')} description={tx('Was hat die Regel bewirkt — gut wie schlecht?')} needs={['vorhaben', 'regel']}>
        <div className="space-y-4">
          <Bound form={f} name="fehler_reduziert" />
          <Bound form={f} name="nebenwirkungen" rows={3} />
          <Bound form={f} name="wirkungsbewertung" rows={3} />
          <Bound form={f} name="bewertet_von" />
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => flow.validateStep(4)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'angewendet_am', label: tx('Angewendet am'), value: tx('Heute') }]}
            whatHappensNext={tx('Die Anwendung wird dem Vorhaben und der Regel zugeordnet und dokumentiert.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Bewerte als Nächstes, ob der Pilot das Problem wirklich reduziert hat.')}
          next={[
            { label: tx('Pilot bewerten'), href: '#/intents/pilot-bewerten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
