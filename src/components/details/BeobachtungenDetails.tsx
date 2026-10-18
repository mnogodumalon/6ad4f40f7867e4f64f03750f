import type { Beobachtungen, Vorhaben, Belege } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface BeobachtungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Beobachtungen;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** 1:N „Belege" (beobachtung): VOLLE Liste — der Block filtert auf diesen Record. */
  belegeList: Belege[];
  /** Zeilen-Klick → overlay.push auf das Belege-Detail (nie der Edit-Dialog). */
  onOpenBelege: (record: Belege) => void;
  /** Kontextuelles „+": öffnet den Belege-Dialog mit diesem Record vorgesetzt. */
  onAddBelege?: () => void;
}

export function BeobachtungenDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  belegeList,
  onOpenBelege,
  onAddBelege,
}: BeobachtungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('beobachtungen', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('beobachtungen', 'beobachtet_am')} value={record.fields.beobachtet_am} format="datetime" />
        <RecordField label={fieldLabel('beobachtungen', 'quelle')} value={record.fields.quelle} format="text" />
        <RecordField label={fieldLabel('beobachtungen', 'betroffene_objekte')} value={record.fields.betroffene_objekte} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('beobachtungen', 'fallart')} value={record.fields.fallart} format="pill" />
        <RecordField label={fieldLabel('beobachtungen', 'beobachtet_von')} value={record.fields.beobachtet_von} format="text" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('beobachtungen', 'vorhaben')}
          name={vorhabenTarget?.fields.titel ?? '—'}
          meta={[vorhabenTarget?.fields.entscheidung_durch].filter(Boolean).join(' · ') || undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('belege')}
        items={belegeList.filter(r => extractRecordId(r.fields.beobachtung) === record.record_id)}
        map={r => ({ name: r.fields.geprueft_von ?? appLabel('belege'), meta: r.fields.geprueft_am })}
        onOpen={onOpenBelege}
        onAdd={onAddBelege}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.BEOBACHTUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('beobachtungen')} />
    </>
  );
}
