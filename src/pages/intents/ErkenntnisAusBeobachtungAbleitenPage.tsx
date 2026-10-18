/**
 * Erkenntnis aus Beobachtung ableiten — 5-Schritt-Wizard.
 * Steps: 1) Beobachtung wählen → 2) Titel, Hypothese, Alternativen → 3) Gültigkeit & Unsicherheit
 *        → 4) Wirkung & Begründung des Belegs → 5) Prüfen & speichern.
 * Reads: beobachtungen. Writes: erkenntnisse (stufe=hypothese, freigabestatus=entwurf), belege (verknüpft mit Beobachtung und neuer Erkenntnis).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldDate, fieldLookup } from '@/lib/journey';
import { useErkenntnisAusBeobachtungAbleitenFlow } from '@/lib/journey/flows/ErkenntnisAusBeobachtungAbleiten';
import { tx } from '@/i18n';

export default function ErkenntnisAusBeobachtungAbleitenPage() {
  const [step, setStep] = useState(1);
  const flow = useErkenntnisAusBeobachtungAbleitenFlow({
    steps: {
      beobachtung: 1,
      titel: 2, hypothese: 2, alternativerklaerungen: 2,
      gueltigkeitsbereich: 3, unsicherheit_grad: 3, unsicherheiten: 3,
      wirkung_auf_erkenntnis: 4, begruendung: 4, gewichtung: 4,
    },
    items: {
      beobachtung: r => {
        const datum = fieldDate(r, 'beobachtet_am');
        const art = fieldLookup(r, 'fallart')?.label;
        const objekte = fieldText(r, 'betroffene_objekte');
        const wann = datum ? format(parseISO(datum), 'dd.MM.yyyy') : '';
        return {
          id: r.id,
          title: fieldText(r, 'beschreibung'),
          subtitle: [wann, art, objekte].filter(Boolean).join(' · '),
        };
      },
    },
  });

  return (
    <IntentWizardShell
      title={tx('Erkenntnis aus Beobachtung ableiten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Aus einer Beobachtung wird eine Hypothese mit der Beobachtung als erstem Beleg.'),
        needs: [tx('Eine erfasste Beobachtung'), tx('Eine Hypothese dazu')],
      }}
    >
      <WizardStep label={tx('Beobachtung')} description={tx('Welche Beobachtung ist der Ausgangspunkt?')}>
        <EntitySelectStep
          {...flow.picks.beobachtung.select}
          {...flow.pick('beobachtung')}
          searchPlaceholder={tx('Beschreibung durchsuchen …')}
        />
      </WizardStep>

      <WizardStep label={tx('Hypothese')} description={tx('Was vermutest du und welche anderen Erklärungen gibt es?')} needs={['beobachtung']}>
        <div className="space-y-4">
          <Bound form={flow.forms.erkenntnisse} name="titel" />
          <Bound form={flow.forms.erkenntnisse} name="hypothese" rows={4} />
          <Bound form={flow.forms.erkenntnisse} name="alternativerklaerungen" rows={3} />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Gültigkeit')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Gültigkeit')} description={tx('Wo gilt die Hypothese und wie sicher bist du?')}>
        <div className="space-y-4">
          <Bound form={flow.forms.erkenntnisse} name="gueltigkeitsbereich" rows={3} />
          <Bound form={flow.forms.erkenntnisse} name="unsicherheit_grad" />
          <Bound form={flow.forms.erkenntnisse} name="unsicherheiten" rows={3} />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Beleg')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Beleg')} description={tx('Wie wirkt die Beobachtung auf die Hypothese?')}>
        <div className="space-y-4">
          <Bound form={flow.forms.belege} name="wirkung_auf_erkenntnis" />
          <Bound form={flow.forms.belege} name="begruendung" rows={3} />
          <Bound form={flow.forms.belege} name="gewichtung" />
          <StepNav onBack={() => setStep(3)} onNext={() => flow.validateStep(4)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[
              { key: 'stufe', label: tx('Stufe'), value: tx('Hypothese') },
              { key: 'freigabestatus', label: tx('Freigabestatus'), value: tx('Entwurf') },
            ]}
            whatHappensNext={tx('Die Erkenntnis wird als Hypothese im Entwurf angelegt und mit der Beobachtung als Beleg verbunden.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Erkenntnis prüfen'), href: '#/intents/erkenntnis-pruefen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Weitere Belege und die Prüfung hältst du im Ablauf „Erkenntnis prüfen" fest.')}
        />
      )}
    </IntentWizardShell>
  );
}
