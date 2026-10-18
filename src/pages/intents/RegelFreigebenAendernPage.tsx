/**
 * Regel freigeben oder ändern — 5-Schritt-Wizard.
 * Steps: 1) Regel wählen → 2) Neuen Freigabestatus wählen → 3) Grund angeben → 4) Gültig-ab & Prüftermin → 5) Freigebende Person → Prüfen & speichern.
 * Reads: regeln, erkenntnisse. Writes: regeln (update), erkenntnisse (update, optional).
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
import { useRegelFreigebenAendernFlow } from '@/lib/journey/flows/RegelFreigebenAendern';
import { tx } from '@/i18n';

export default function RegelFreigebenAendernPage() {
  const [step, setStep] = useState(1);
  const flow = useRegelFreigebenAendernFlow({
    steps: {
      regeln: 1,
      freigabestatus: 2,
      aenderungsgrund: 3, ruecknahmegrund: 3, gueltigkeitsbereich: 3,
      gueltig_ab: 4, naechste_pruefung: 4,
      freigegeben_von: 5, erkenntnisse: 5,
    },
    items: {
      regeln: r => ({
        id: r.id,
        title: fieldText(r, 'regeltitel'),
        subtitle: tx`Version ${fieldText(r, 'version')}`,
        status: fieldLookup(r, 'freigabestatus') ?? undefined,
      }),
      erkenntnisse: r => ({ id: r.id, title: fieldText(r, 'titel') }),
    },
  });

  const regel = flow.forms.regeln;
  const erkenntnis = flow.forms.erkenntnisse;
  const erkenntnisGewaehlt = Boolean(erkenntnis.get('erkenntnisse'));

  return (
    <IntentWizardShell
      title={tx('Regel freigeben oder ändern')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine Regel kontrolliert freigeben, einschränken, ablösen oder zurücknehmen.'),
        needs: [tx('Die betroffene Regel'), tx('Einen Grund für die Änderung'), tx('Name der freigebenden Person')],
      }}
    >
      <WizardStep label={tx('Regel')} description={tx('Welche Regel möchtest du freigeben oder ändern?')}>
        <EntitySelectStep
          {...flow.picks.regeln.select}
          {...flow.pick('regeln')}
          searchPlaceholder={tx('Regeltitel suchen …')}
        />
      </WizardStep>

      <WizardStep label={tx('Freigabestatus')} description={tx('Welchen Status soll die Regel bekommen?')} needs={['regeln']}>
        <div className="space-y-4">
          <Bound form={regel} name="freigabestatus" />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Grund')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Grund')} description={tx('Warum wird die Regel geändert oder zurückgenommen?')} needs={['regeln']}>
        <div className="space-y-4">
          <Bound form={regel} name="aenderungsgrund" rows={3} />
          <Bound form={regel} name="ruecknahmegrund" rows={3} />
          <Bound form={regel} name="gueltigkeitsbereich" rows={3} />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Termine')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Termine')} description={tx('Ab wann gilt der Status, und wann wird die Regel wieder geprüft?')} needs={['regeln']}>
        <div className="space-y-4">
          <Bound form={regel} name="gueltig_ab" />
          <Bound form={regel} name="naechste_pruefung" />
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => flow.validateStep(4)}
            nextStepLabel={tx('Freigebende Person')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Freigabe')} description={tx('Wer gibt die Änderung frei?')} needs={['regeln']}>
        <div className="space-y-6">
          <Bound form={regel} name="freigegeben_von" />
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {tx('Optional: Den Freigabestatus der zugrunde liegenden Erkenntnis gleich mit anpassen.')}
            </p>
            <EntitySelectStep
              {...flow.picks.erkenntnisse.select}
              {...flow.pick('erkenntnisse')}
              searchPlaceholder={tx('Erkenntnis suchen …')}
            />
            {erkenntnisGewaehlt && (
              <div className="space-y-4">
                <Bound form={erkenntnis} name="freigabestatus" />
                <Bound form={erkenntnis} name="freigegeben_von" />
              </div>
            )}
          </div>
          <StepNav
            onBack={() => setStep(4)}
            onNext={() => flow.validateStep(5)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'letzte_pruefung', label: tx('Zuletzt überprüft am'), value: tx('Heute') }]}
            whatHappensNext={tx('Die Regel wird mit dem neuen Status und der Begründung gespeichert.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Regel im Vorhaben anwenden'), href: '#/intents/regel-anwenden' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Die Regel ist jetzt mit dem neuen Freigabestatus für Anwendungen sichtbar.')}
        />
      )}
    </IntentWizardShell>
  );
}
