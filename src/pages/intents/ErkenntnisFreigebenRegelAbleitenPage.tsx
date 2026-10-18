/**
 * Regel aus Erkenntnis ableiten — 4-Schritt-Wizard.
 * Steps: 1) Erkenntnis der Stufe Erfahrung wählen → 2) Titel, Text, Version, Gültigkeitsbereich
 *        → 3) Ausnahme, Verantwortliche, nächste Prüfung → 4) Prüfen & als Entwurf zur Freigabe speichern.
 * Reads: erkenntnisse. Writes: regeln (create), erkenntnisse (update freigabestatus) via useErkenntnisFreigebenRegelAbleitenFlow.
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
import { useErkenntnisFreigebenRegelAbleitenFlow } from '@/lib/journey/flows/ErkenntnisFreigebenRegelAbleiten';
import { tx } from '@/i18n';

export default function ErkenntnisFreigebenRegelAbleitenPage() {
  const [step, setStep] = useState(1);
  const flow = useErkenntnisFreigebenRegelAbleitenFlow({
    steps: {
      erkenntnisse: 1, erkenntnis: 1,
      regeltitel: 2, regeltext: 2, version: 2, gueltigkeitsbereich: 2,
      ausnahmeregelung: 3, verantwortlicher: 3, naechste_pruefung: 3,
    },
    items: {
      erkenntnisse: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldText(r, 'schlussfolgerung'),
        status: fieldLookup(r, 'unsicherheit_grad') ?? undefined,
      } as never),
    },
  });

  const target = flow.targets.erkenntnisse;
  const basis = target.record;
  const regeln = flow.forms.regeln;
  const pick = flow.pick('erkenntnisse');

  const onPick = (id: string) => {
    pick.onSelect(id);
    regeln.set('erkenntnis', id, flow.picks.erkenntnisse.labelOf(id) ?? '');
    const rec = flow.picks.erkenntnisse.recordOf(id);
    if (rec && !regeln.get('gueltigkeitsbereich')) {
      const bereich = fieldText(rec, 'gueltigkeitsbereich');
      if (bereich) regeln.set('gueltigkeitsbereich', bereich);
    }
  };

  const basisCard = basis && (
    <div className="rounded-xl border bg-secondary/50 p-3 text-sm space-y-1 overflow-hidden">
      <p className="text-xs text-muted-foreground">{tx('Zugrunde liegende Erkenntnis')}</p>
      <p className="font-medium break-words">{fieldText(basis, 'titel')}</p>
      {fieldText(basis, 'schlussfolgerung') && (
        <p className="text-muted-foreground line-clamp-3 break-words">{fieldText(basis, 'schlussfolgerung')}</p>
      )}
    </div>
  );

  return (
    <IntentWizardShell
      title={tx('Regel aus Erkenntnis ableiten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Aus einer geprüften Erkenntnis entsteht ein Regelentwurf zur Freigabe.'),
        needs: [tx('Eine Erkenntnis der Stufe Erfahrung'), tx('Regeltitel und Regeltext'), tx('Version')],
      }}
    >
      <WizardStep label={tx('Erkenntnis')} description={tx('Welche geprüfte Erkenntnis soll zur Regel werden?')}>
        <EntitySelectStep
          {...flow.picks.erkenntnisse.select}
          selectedId={pick.selectedId}
          onSelect={onPick}
          searchPlaceholder={tx('Titel oder Schlussfolgerung …')}
          emptyText={tx('Keine Erkenntnis der Stufe Erfahrung vorhanden. Prüfe zuerst eine Erkenntnis.')}
        />
      </WizardStep>

      <WizardStep label={tx('Regel')} description={tx('Formuliere die Regel, die aus der Erkenntnis folgt.')} needs={['erkenntnisse']}>
        <div className="space-y-4">
          {basisCard}
          <Bound form={regeln} name="regeltitel" />
          <Bound form={regeln} name="regeltext" rows={4} />
          <Bound form={regeln} name="version" hint={tx('Freitext, z. B. 1.0')} />
          <Bound form={regeln} name="gueltigkeitsbereich" rows={3} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Ausnahme & Verantwortung')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Verantwortung')} description={tx('Lege Ausnahme, Verantwortliche und nächste Prüfung fest.')} needs={['erkenntnisse']}>
        <div className="space-y-4">
          <Bound form={regeln} name="ausnahmeregelung" rows={3} />
          <Bound form={regeln} name="verantwortlicher" />
          <Bound form={regeln} name="naechste_pruefung" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Die Regel wird als Entwurf zur Freigabe gespeichert und gilt erst nach der Freigabe. Die Erkenntnis wird ebenfalls zur Freigabe vorgelegt.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Die Regel gilt erst, wenn sie freigegeben wurde.')}
          next={[
            { label: tx('Regel freigeben oder ändern'), href: '#/intents/regel-freigeben-aendern' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
