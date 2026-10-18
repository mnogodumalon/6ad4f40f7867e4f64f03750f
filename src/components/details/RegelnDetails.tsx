import type { Regeln, Erkenntnisse, Regelanwendungen, Pilotbewertungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface RegelnDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Regeln;
  /** N:1-Ziel „Erkenntnisse": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  erkenntnisseList: Erkenntnisse[];
  /** Klick auf die Erkenntnisse-Relation → overlay.push auf dessen Detail. */
  onOpenErkenntnisse?: (record: Erkenntnisse) => void;
  /** 1:N „Regelanwendungen" (regel): VOLLE Liste — der Block filtert auf diesen Record. */
  regelanwendungenList: Regelanwendungen[];
  /** Zeilen-Klick → overlay.push auf das Regelanwendungen-Detail (nie der Edit-Dialog). */
  onOpenRegelanwendungen: (record: Regelanwendungen) => void;
  /** Kontextuelles „+": öffnet den Regelanwendungen-Dialog mit diesem Record vorgesetzt. */
  onAddRegelanwendungen?: () => void;
  /** 1:N „Pilotbewertungen" (regel): VOLLE Liste — der Block filtert auf diesen Record. */
  pilotbewertungenList: Pilotbewertungen[];
  /** Zeilen-Klick → overlay.push auf das Pilotbewertungen-Detail (nie der Edit-Dialog). */
  onOpenPilotbewertungen: (record: Pilotbewertungen) => void;
  /** Kontextuelles „+": öffnet den Pilotbewertungen-Dialog mit diesem Record vorgesetzt. */
  onAddPilotbewertungen?: () => void;
}

export function RegelnDetails({
  record,
  erkenntnisseList,
  onOpenErkenntnisse,
  regelanwendungenList,
  onOpenRegelanwendungen,
  onAddRegelanwendungen,
  pilotbewertungenList,
  onOpenPilotbewertungen,
  onAddPilotbewertungen,
}: RegelnDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const erkenntnisTarget = erkenntnisseList.find(r => r.record_id === extractRecordId(record.fields.erkenntnis));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('regeln', 'regeltitel')} value={record.fields.regeltitel} format="text" />
        <RecordField label={fieldLabel('regeln', 'regeltext')} value={record.fields.regeltext} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regeln', 'version')} value={record.fields.version} format="text" />
        <RecordField label={fieldLabel('regeln', 'gueltigkeitsbereich')} value={record.fields.gueltigkeitsbereich} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regeln', 'ausnahmeregelung')} value={record.fields.ausnahmeregelung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regeln', 'verantwortlicher')} value={record.fields.verantwortlicher} format="text" />
        <RecordField label={fieldLabel('regeln', 'freigabestatus')} value={record.fields.freigabestatus} format="pill" />
        <RecordField label={fieldLabel('regeln', 'freigegeben_von')} value={record.fields.freigegeben_von} format="text" />
        <RecordField label={fieldLabel('regeln', 'gueltig_ab')} value={record.fields.gueltig_ab} format="date" />
        <RecordField label={fieldLabel('regeln', 'aenderungsgrund')} value={record.fields.aenderungsgrund} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regeln', 'ruecknahmegrund')} value={record.fields.ruecknahmegrund} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regeln', 'letzte_pruefung')} value={record.fields.letzte_pruefung} format="date" />
        <RecordField label={fieldLabel('regeln', 'naechste_pruefung')} value={record.fields.naechste_pruefung} format="date" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('regeln', 'erkenntnis')}
          name={erkenntnisTarget?.fields.titel ?? '—'}
          meta={[erkenntnisTarget?.fields.freigegeben_von].filter(Boolean).join(' · ') || undefined}
          onClick={erkenntnisTarget && onOpenErkenntnisse ? () => onOpenErkenntnisse!(erkenntnisTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('regelanwendungen')}
        items={regelanwendungenList.filter(r => extractRecordId(r.fields.regel) === record.record_id)}
        map={r => ({ name: r.fields.bewertet_von ?? appLabel('regelanwendungen'), meta: r.fields.angewendet_am })}
        onOpen={onOpenRegelanwendungen}
        onAdd={onAddRegelanwendungen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('pilotbewertungen')}
        items={pilotbewertungenList.filter(r => extractRecordId(r.fields.regel) === record.record_id)}
        map={r => ({ name: appLabel('pilotbewertungen'), meta: r.fields.bewertet_am })}
        onOpen={onOpenPilotbewertungen}
        onAdd={onAddPilotbewertungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.REGELN} recordId={record.record_id} readOnly={!perms.canWrite('regeln')} />
    </>
  );
}
