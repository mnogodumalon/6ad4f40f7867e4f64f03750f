import type { Belege, Beobachtungen, Erkenntnisse } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface BelegeDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Belege;
  /** N:1-Ziel „Beobachtungen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  beobachtungenList: Beobachtungen[];
  /** Klick auf die Beobachtungen-Relation → overlay.push auf dessen Detail. */
  onOpenBeobachtungen?: (record: Beobachtungen) => void;
  /** N:1-Ziel „Erkenntnisse": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  erkenntnisseList: Erkenntnisse[];
  /** Klick auf die Erkenntnisse-Relation → overlay.push auf dessen Detail. */
  onOpenErkenntnisse?: (record: Erkenntnisse) => void;
}

export function BelegeDetails({
  record,
  beobachtungenList,
  onOpenBeobachtungen,
  erkenntnisseList,
  onOpenErkenntnisse,
}: BelegeDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const beobachtungTarget = beobachtungenList.find(r => r.record_id === extractRecordId(record.fields.beobachtung));
  const erkenntnisTarget = erkenntnisseList.find(r => r.record_id === extractRecordId(record.fields.erkenntnis));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('belege', 'wirkung_auf_erkenntnis')} value={record.fields.wirkung_auf_erkenntnis} format="pill" />
        <RecordField label={fieldLabel('belege', 'begruendung')} value={record.fields.begruendung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('belege', 'gewichtung')} value={record.fields.gewichtung} format="pill" />
        <RecordField label={fieldLabel('belege', 'geprueft_von')} value={record.fields.geprueft_von} format="text" />
        <RecordField label={fieldLabel('belege', 'geprueft_am')} value={record.fields.geprueft_am} format="date" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('belege', 'beobachtung')}
          name={beobachtungTarget?.fields.quelle ?? '—'}
          meta={[beobachtungTarget?.fields.beobachtet_von].filter(Boolean).join(' · ') || undefined}
          onClick={beobachtungTarget && onOpenBeobachtungen ? () => onOpenBeobachtungen!(beobachtungTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('belege', 'erkenntnis')}
          name={erkenntnisTarget?.fields.titel ?? '—'}
          meta={[erkenntnisTarget?.fields.freigegeben_von].filter(Boolean).join(' · ') || undefined}
          onClick={erkenntnisTarget && onOpenErkenntnisse ? () => onOpenErkenntnisse!(erkenntnisTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.BELEGE} recordId={record.record_id} readOnly={!perms.canWrite('belege')} />
    </>
  );
}
