import { useEffect, useMemo, useState } from 'react';
import { PublicShell } from '@/components/PublicShell';
import {
  loadPublicPagesConfig, prepareChallenge,
  type PublicPagesConfig, type PublicPageConfig,
} from '@/lib/publicClient';
import { useStepForm, useJourneySubmit } from '@/lib/journey';
import { createPublicPort } from '@/lib/journey/publicPort';
import { IntentWizardShell, type WizardStep } from '@/components/blocks/IntentWizardShell';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { Bound } from '@/components/blocks/Bound';
import { tx } from '@/i18n';

const SLUG = 'vorhaben-einstellen';

export default function VorhabenEinstellen() {
  const [cfg, setCfg] = useState<PublicPagesConfig | null>(null);
  const [page, setPage] = useState<PublicPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicPagesConfig(SLUG).then(c => {
      setCfg(c);
      setPage(c?.pages[SLUG] ?? null);
      setLoading(false);
    });
  }, []);

  if (loading || !cfg || !page) {
    return <PublicShell loading={loading} unavailable={!loading} />;
  }
  return (
    <PublicShell title={tx('Neues Vorhaben einstellen')} description={tx('Beschreibe dein Vorhaben kurz – das Team schaut es sich an und prüft es.')}>
      <VorhabenWizard cfg={cfg} page={page} />
    </PublicShell>
  );
}

function VorhabenWizard({ cfg, page }: { cfg: PublicPagesConfig; page: PublicPageConfig }) {
  const [step, setStep] = useState(1);
  const port = useMemo(() => createPublicPort(cfg, page), [cfg, page]);

  const form = useStepForm('vorhaben', {
    fields: ['titel', 'intention', 'startdatum', 'kontext', 'beteiligte_rollen', 'verwendete_systeme', 'informationsquellen'],
    required: { titel: true, intention: true },
    messages: {
      titel: tx('Bitte den Titel des Vorhabens eingeben.'),
      intention: tx('Bitte die Intention des Vorhabens beschreiben.'),
    },
    steps: {
      titel: 1, intention: 1, startdatum: 1, kontext: 1,
      beteiligte_rollen: 1, verwendete_systeme: 1, informationsquellen: 1,
    },
    autoComplete: true,
  });
  const submit = useJourneySubmit(
    port,
    [{ key: 'vorhaben', entity: 'vorhaben', form, primary: true }],
    { draftKey: SLUG },
  );

  const steps: WizardStep[] = [
    { label: tx('Angaben'), heading: tx('Angaben zum Vorhaben') },
    { label: tx('Prüfen und absenden'), heading: tx('Prüfen und absenden') },
  ];

  const warm = () => prepareChallenge(cfg, page, 'POST', `/apps/${page.endpoints?.find(e => e.op === 'create')?.app_id}/records`);

  const restart = () => {
    submit.reset();
    form.reset();
    setStep(1);
  };

  return (
    <div onFocus={warm}>
      <IntentWizardShell
        steps={steps}
        currentStep={step}
        onStepChange={setStep}
        back={false}
        forms={[form]}
        draftKey={SLUG}
      >
        {step === 1 && (
          <div className="space-y-4">
            <Bound form={form} name="titel" />
            <Bound form={form} name="intention" rows={4} />
            <Bound form={form} name="startdatum" />
            <Bound form={form} name="kontext" />
            <Bound form={form} name="beteiligte_rollen" />
            <Bound form={form} name="verwendete_systeme" />
            <Bound form={form} name="informationsquellen" />
            <StepNav
              hideBack
              onNext={() => form.validate(['titel', 'intention'])}
              nextStepLabel={tx('Prüfen und absenden')}
            />
          </div>
        )}
        {step === 2 && !submit.done && (
          <SummaryStep
            forms={[form]}
            submit={submit}
            whatHappensNext={tx('Das Team prüft dein Vorhaben, sobald du es abgesendet hast.')}
          />
        )}
        {submit.result && (
          <SuccessStep
            result={submit.result}
            forms={[form]}
            title={tx('Vorhaben eingereicht')}
            whatHappensNext={tx('Danke! Das Team schaut sich dein Vorhaben an.')}
            next={[{ label: tx('Weiteres Vorhaben einstellen'), onClick: restart }]}
          />
        )}
      </IntentWizardShell>
    </div>
  );
}
