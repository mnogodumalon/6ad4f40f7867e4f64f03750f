import type { Pilotbewertungen, Regeln, Vorhaben } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface PilotbewertungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Pilotbewertungen;
  /** N:1-Ziel „Regeln": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  regelnList: Regeln[];
  /** Klick auf die Regeln-Relation → overlay.push auf dessen Detail. */
  onOpenRegeln?: (record: Regeln) => void;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
}

export function PilotbewertungenDetails({
  record,
  regelnList,
  onOpenRegeln,
  vorhabenList,
  onOpenVorhaben,
}: PilotbewertungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const regelTarget = regelnList.find(r => r.record_id === extractRecordId(record.fields.regel));
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('pilotbewertungen', 'bewertet_am')} value={record.fields.bewertet_am} format="date" />
        <RecordField label={fieldLabel('pilotbewertungen', 'problem_reduziert')} value={record.fields.problem_reduziert} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('pilotbewertungen', 'qualitaetsveraenderung')} value={record.fields.qualitaetsveraenderung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('pilotbewertungen', 'zusatzaufwand')} value={record.fields.zusatzaufwand} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('pilotbewertungen', 'akzeptanz')} value={record.fields.akzeptanz} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('pilotbewertungen', 'wiederverwendbar')} value={record.fields.wiederverwendbar} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('pilotbewertungen', 'voraussetzungen')} value={record.fields.voraussetzungen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('pilotbewertungen', 'entscheidung')} value={record.fields.entscheidung} format="pill" />
        <RecordField label={fieldLabel('pilotbewertungen', 'entscheidungsbegruendung')} value={record.fields.entscheidungsbegruendung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('pilotbewertungen', 'regel')}
          name={regelTarget?.fields.regeltitel ?? '—'}
          meta={[regelTarget?.fields.version, regelTarget?.fields.verantwortlicher].filter(Boolean).join(' · ') || undefined}
          onClick={regelTarget && onOpenRegeln ? () => onOpenRegeln!(regelTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('pilotbewertungen', 'vorhaben')}
          name={vorhabenTarget?.fields.titel ?? '—'}
          meta={[vorhabenTarget?.fields.entscheidung_durch].filter(Boolean).join(' · ') || undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.PILOTBEWERTUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('pilotbewertungen')} />
    </>
  );
}
