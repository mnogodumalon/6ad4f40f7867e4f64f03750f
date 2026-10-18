/**
 * Erkenntnis prüfen — 6-Schritt-Wizard.
 * Steps: 1) Erkenntnis wählen → 2) Belege ansehen & optional weiteren Beleg hinzufügen → 3) Prüfung & Schlussfolgerung
 *        → 4) Stufe & Prüftermine → 5) Widerspruch dokumentieren (optional) → 6) Prüfen & speichern.
 * Reads: erkenntnisse, belege, beobachtungen. Writes: erkenntnisse (update), belege (create, optional).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldDate, fieldLookup, refFilter } from '@/lib/journey';
import type { JourneyRecord } from '@/lib/journey';
import { useErkenntnisPruefenFlow } from '@/lib/journey/flows/ErkenntnisPruefen';
import { tx } from '@/i18n';

export default function ErkenntnisPruefenPage() {
  const [step, setStep] = useState(1);
  const flow = useErkenntnisPruefenFlow({
    steps: {
      erkenntnisse: 1, erkenntnis: 1,
      beobachtung: 2, wirkung_auf_erkenntnis: 2, gewichtung: 2, begruendung: 2, geprueft_von: 2,
      pruefung: 3, schlussfolgerung: 3, unsicherheit_grad: 3, unsicherheiten: 3,
      stufe: 4, gueltigkeitsbereich: 4, naechste_pruefung: 4,
      widersprechende_erkenntnis: 5, widerspruch_notiz: 5,
    },
    items: {
      erkenntnisse: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: [fieldLookup(r, 'stufe')?.label, fieldDate(r, 'naechste_pruefung')].filter(Boolean).join(' · '),
      }),
      beobachtung: r => ({
        id: r.id,
        title: fieldText(r, 'beschreibung'),
        subtitle: fieldLookup(r, 'fallart')?.label,
      }),
      widersprechende_erkenntnis: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldLookup(r, 'stufe')?.label,
      }),
    },
  });

  const erkenntnisPick = flow.pick('erkenntnisse');
  const erkenntnisId = (erkenntnisPick.selectedId as string | undefined) ?? null;

  const [belege, setBelege] = useState<JourneyRecord[]>([]);
  const [belegeLoading, setBelegeLoading] = useState(false);
  useEffect(() => {
    if (!erkenntnisId) { setBelege([]); return; }
    let alive = true;
    setBelegeLoading(true);
    flow.port
      .list('belege', { filter: refFilter('erkenntnis', erkenntnisId), limit: 50 })
      .then(rows => { if (alive) setBelege(rows); })
      .catch(() => { if (alive) setBelege([]); })
      .finally(() => { if (alive) setBelegeLoading(false); });
    return () => { alive = false; };
  }, [erkenntnisId, flow.port]);

  const picked = erkenntnisId ? flow.picks.erkenntnisse.recordOf(erkenntnisId) : undefined;
  const hasBeleg = Boolean(flow.forms.belege.get('beobachtung'));
  const today = format(new Date(), 'dd.MM.yyyy');

  return (
    <IntentWizardShell
      title={tx('Erkenntnis prüfen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine Erkenntnis mit Belegen prüfen, bewerten und auf die nächste Stufe setzen.'),
        needs: [tx('Die zu prüfende Erkenntnis'), tx('Optional: eine weitere Beobachtung als Beleg')],
      }}
    >
      <WizardStep label={tx('Erkenntnis')} description={tx('Welche Erkenntnis willst du prüfen?')}>
        <EntitySelectStep
          {...flow.picks.erkenntnisse.select}
          {...erkenntnisPick}
          onSelect={id => {
            erkenntnisPick.onSelect(id);
            flow.forms.belege.set('erkenntnis', id, flow.picks.erkenntnisse.labelOf(id) ?? '');
          }}
          searchPlaceholder={tx('Titel der Erkenntnis …')}
        />
      </WizardStep>

      <WizardStep label={tx('Belege')} description={tx('Bestehende Belege ansehen und optional eine Beobachtung als bestätigenden oder widersprechenden Beleg hinzufügen.')} needs={['erkenntnisse']}>
        <div className="space-y-4">
          {picked && (
            <div className="rounded-2xl border bg-card p-4 overflow-hidden">
              <p className="font-medium truncate">{fieldText(picked, 'titel')}</p>
              <p className="text-sm text-muted-foreground line-clamp-3">{fieldText(picked, 'hypothese')}</p>
            </div>
          )}
          {belegeLoading && <p className="text-sm text-muted-foreground">{tx('Belege werden geladen …')}</p>}
          {!belegeLoading && belege.length === 0 && (
            <p className="text-sm text-muted-foreground">{tx('Zu dieser Erkenntnis gibt es noch keine Belege.')}</p>
          )}
          <ul className="space-y-2">
            {belege.map(b => (
              <li key={b.id} className="rounded-xl border bg-card p-3 overflow-hidden">
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="font-medium">{fieldLookup(b, 'wirkung_auf_erkenntnis')?.label ?? '—'}</span>
                  {fieldLookup(b, 'gewichtung') && (
                    <span className="text-muted-foreground">{tx`Gewichtung: ${fieldLookup(b, 'gewichtung')?.label ?? ''}`}</span>
                  )}
                </div>
                {fieldText(b, 'begruendung') && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{fieldText(b, 'begruendung')}</p>
                )}
              </li>
            ))}
          </ul>
          <EntitySelectStep
            {...flow.picks.beobachtung.select}
            {...flow.pick('beobachtung')}
            searchPlaceholder={tx('Beobachtung suchen …')}
          />
          {hasBeleg && (
            <>
              <Bound form={flow.forms.belege} name="wirkung_auf_erkenntnis" />
              <Bound form={flow.forms.belege} name="gewichtung" />
              <Bound form={flow.forms.belege} name="begruendung" rows={3} />
              <Bound form={flow.forms.belege} name="geprueft_von" />
            </>
          )}
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => (hasBeleg ? flow.validateStep(2) : true)}
            nextStepLabel={tx('Prüfung festhalten')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfung')} description={tx('Wie hast du geprüft, was folgt daraus und was bleibt unsicher?')} needs={['erkenntnisse']}>
        <div className="space-y-4">
          <Bound form={flow.forms.erkenntnisse} name="pruefung" rows={4} />
          <Bound form={flow.forms.erkenntnisse} name="schlussfolgerung" rows={4} />
          <Bound form={flow.forms.erkenntnisse} name="unsicherheit_grad" />
          <Bound form={flow.forms.erkenntnisse} name="unsicherheiten" rows={3} />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Stufe setzen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Stufe & Termine')} description={tx('Auf welche Stufe kommt die Erkenntnis und wann wird erneut geprüft?')} needs={['erkenntnisse']}>
        <div className="space-y-4">
          <Bound form={flow.forms.erkenntnisse} name="stufe" />
          <Bound form={flow.forms.erkenntnisse} name="gueltigkeitsbereich" rows={3} />
          <Bound form={flow.forms.erkenntnisse} name="naechste_pruefung" />
          <StepNav onBack={() => setStep(3)} onNext={() => flow.validateStep(4)} nextStepLabel={tx('Widerspruch')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Widerspruch')} description={tx('Optional: widerspricht eine andere Erkenntnis dieser hier? Dann verknüpfe und dokumentiere sie.')} needs={['erkenntnisse']}>
        <div className="space-y-4">
          <EntitySelectStep
            {...flow.picks.widersprechende_erkenntnis.select}
            {...flow.pick('widersprechende_erkenntnis')}
            searchPlaceholder={tx('Widersprechende Erkenntnis suchen …')}
          />
          <Bound form={flow.forms.erkenntnisse} name="widerspruch_notiz" rows={3} />
          <StepNav onBack={() => setStep(4)} onNext={() => flow.validateStep(5)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'letzte_pruefung', label: tx('Geprüft am'), value: today }]}
            whatHappensNext={tx('Die Erkenntnis wird aktualisiert und der Beleg, falls angegeben, neu angelegt.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Regel aus Erkenntnis ableiten'), href: '#/intents/erkenntnis-freigeben-regel-ableiten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
