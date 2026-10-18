import type { Erkenntnisse, Belege, Regeln } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface ErkenntnisseDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Erkenntnisse;
  /** N:1-Ziel „Erkenntnisse": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  erkenntnisseList: Erkenntnisse[];
  /** Klick auf die Erkenntnisse-Relation → overlay.push auf dessen Detail. */
  onOpenErkenntnisse?: (record: Erkenntnisse) => void;
  /** 1:N „Belege" (erkenntnis): VOLLE Liste — der Block filtert auf diesen Record. */
  belegeList: Belege[];
  /** Zeilen-Klick → overlay.push auf das Belege-Detail (nie der Edit-Dialog). */
  onOpenBelege: (record: Belege) => void;
  /** Kontextuelles „+": öffnet den Belege-Dialog mit diesem Record vorgesetzt. */
  onAddBelege?: () => void;
  /** 1:N „Regeln" (erkenntnis): VOLLE Liste — der Block filtert auf diesen Record. */
  regelnList: Regeln[];
  /** Zeilen-Klick → overlay.push auf das Regeln-Detail (nie der Edit-Dialog). */
  onOpenRegeln: (record: Regeln) => void;
  /** Kontextuelles „+": öffnet den Regeln-Dialog mit diesem Record vorgesetzt. */
  onAddRegeln?: () => void;
}

export function ErkenntnisseDetails({
  record,
  erkenntnisseList,
  onOpenErkenntnisse,
  belegeList,
  onOpenBelege,
  onAddBelege,
  regelnList,
  onOpenRegeln,
  onAddRegeln,
}: ErkenntnisseDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const widersprechende_erkenntnisTarget = erkenntnisseList.find(r => r.record_id === extractRecordId(record.fields.widersprechende_erkenntnis));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('erkenntnisse', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('erkenntnisse', 'stufe')} value={record.fields.stufe} format="pill" />
        <RecordField label={fieldLabel('erkenntnisse', 'hypothese')} value={record.fields.hypothese} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erkenntnisse', 'alternativerklaerungen')} value={record.fields.alternativerklaerungen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erkenntnisse', 'pruefung')} value={record.fields.pruefung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erkenntnisse', 'schlussfolgerung')} value={record.fields.schlussfolgerung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erkenntnisse', 'gueltigkeitsbereich')} value={record.fields.gueltigkeitsbereich} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erkenntnisse', 'unsicherheit_grad')} value={record.fields.unsicherheit_grad} format="pill" />
        <RecordField label={fieldLabel('erkenntnisse', 'unsicherheiten')} value={record.fields.unsicherheiten} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erkenntnisse', 'freigabestatus')} value={record.fields.freigabestatus} format="pill" />
        <RecordField label={fieldLabel('erkenntnisse', 'freigegeben_von')} value={record.fields.freigegeben_von} format="text" />
        <RecordField label={fieldLabel('erkenntnisse', 'letzte_pruefung')} value={record.fields.letzte_pruefung} format="date" />
        <RecordField label={fieldLabel('erkenntnisse', 'naechste_pruefung')} value={record.fields.naechste_pruefung} format="date" />
        <RecordField label={fieldLabel('erkenntnisse', 'widerspruch_notiz')} value={record.fields.widerspruch_notiz} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('erkenntnisse', 'widersprechende_erkenntnis')}
          name={widersprechende_erkenntnisTarget?.fields.titel ?? '—'}
          meta={[widersprechende_erkenntnisTarget?.fields.freigegeben_von].filter(Boolean).join(' · ') || undefined}
          onClick={widersprechende_erkenntnisTarget && onOpenErkenntnisse ? () => onOpenErkenntnisse!(widersprechende_erkenntnisTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('belege')}
        items={belegeList.filter(r => extractRecordId(r.fields.erkenntnis) === record.record_id)}
        map={r => ({ name: r.fields.geprueft_von ?? appLabel('belege'), meta: r.fields.geprueft_am })}
        onOpen={onOpenBelege}
        onAdd={onAddBelege}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('regeln')}
        items={regelnList.filter(r => extractRecordId(r.fields.erkenntnis) === record.record_id)}
        map={r => ({ name: r.fields.regeltitel ?? appLabel('regeln'), meta: r.fields.gueltig_ab })}
        onOpen={onOpenRegeln}
        onAdd={onAddRegeln}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ERKENNTNISSE} recordId={record.record_id} readOnly={!perms.canWrite('erkenntnisse')} />
    </>
  );
}
