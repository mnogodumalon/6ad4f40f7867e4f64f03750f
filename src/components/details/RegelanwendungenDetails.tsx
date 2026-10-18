import type { Regelanwendungen, Regeln, Vorhaben } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface RegelanwendungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Regelanwendungen;
  /** N:1-Ziel „Regeln": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  regelnList: Regeln[];
  /** Klick auf die Regeln-Relation → overlay.push auf dessen Detail. */
  onOpenRegeln?: (record: Regeln) => void;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
}

export function RegelanwendungenDetails({
  record,
  regelnList,
  onOpenRegeln,
  vorhabenList,
  onOpenVorhaben,
}: RegelanwendungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const regelTarget = regelnList.find(r => r.record_id === extractRecordId(record.fields.regel));
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('regelanwendungen', 'angewendet_am')} value={record.fields.angewendet_am} format="date" />
        <RecordField label={fieldLabel('regelanwendungen', 'art_der_anwendung')} value={record.fields.art_der_anwendung} format="pill" />
        <RecordField label={fieldLabel('regelanwendungen', 'ergebnis')} value={record.fields.ergebnis} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regelanwendungen', 'fehler_reduziert')} value={record.fields.fehler_reduziert} format="pill" />
        <RecordField label={fieldLabel('regelanwendungen', 'nebenwirkungen')} value={record.fields.nebenwirkungen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regelanwendungen', 'wirkungsbewertung')} value={record.fields.wirkungsbewertung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regelanwendungen', 'bewertet_von')} value={record.fields.bewertet_von} format="text" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('regelanwendungen', 'regel')}
          name={regelTarget?.fields.regeltitel ?? '—'}
          meta={[regelTarget?.fields.version, regelTarget?.fields.verantwortlicher].filter(Boolean).join(' · ') || undefined}
          onClick={regelTarget && onOpenRegeln ? () => onOpenRegeln!(regelTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('regelanwendungen', 'vorhaben')}
          name={vorhabenTarget?.fields.titel ?? '—'}
          meta={[vorhabenTarget?.fields.entscheidung_durch].filter(Boolean).join(' · ') || undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.REGELANWENDUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('regelanwendungen')} />
    </>
  );
}
