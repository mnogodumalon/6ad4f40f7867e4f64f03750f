import type { Vorhaben, Beobachtungen, Regelanwendungen, Pilotbewertungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface VorhabenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Vorhaben;
  /** 1:N „Beobachtungen" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  beobachtungenList: Beobachtungen[];
  /** Zeilen-Klick → overlay.push auf das Beobachtungen-Detail (nie der Edit-Dialog). */
  onOpenBeobachtungen: (record: Beobachtungen) => void;
  /** Kontextuelles „+": öffnet den Beobachtungen-Dialog mit diesem Record vorgesetzt. */
  onAddBeobachtungen?: () => void;
  /** 1:N „Regelanwendungen" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  regelanwendungenList: Regelanwendungen[];
  /** Zeilen-Klick → overlay.push auf das Regelanwendungen-Detail (nie der Edit-Dialog). */
  onOpenRegelanwendungen: (record: Regelanwendungen) => void;
  /** Kontextuelles „+": öffnet den Regelanwendungen-Dialog mit diesem Record vorgesetzt. */
  onAddRegelanwendungen?: () => void;
  /** 1:N „Pilotbewertungen" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  pilotbewertungenList: Pilotbewertungen[];
  /** Zeilen-Klick → overlay.push auf das Pilotbewertungen-Detail (nie der Edit-Dialog). */
  onOpenPilotbewertungen: (record: Pilotbewertungen) => void;
  /** Kontextuelles „+": öffnet den Pilotbewertungen-Dialog mit diesem Record vorgesetzt. */
  onAddPilotbewertungen?: () => void;
}

export function VorhabenDetails({
  record,
  beobachtungenList,
  onOpenBeobachtungen,
  onAddBeobachtungen,
  regelanwendungenList,
  onOpenRegelanwendungen,
  onAddRegelanwendungen,
  pilotbewertungenList,
  onOpenPilotbewertungen,
  onAddPilotbewertungen,
}: VorhabenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('vorhaben', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('vorhaben', 'intention')} value={record.fields.intention} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('vorhaben', 'startdatum')} value={record.fields.startdatum} format="date" />
        <RecordField label={fieldLabel('vorhaben', 'enddatum')} value={record.fields.enddatum} format="date" />
        <RecordField label={fieldLabel('vorhaben', 'kontext')} value={record.fields.kontext} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'beteiligte_rollen')} value={record.fields.beteiligte_rollen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'verwendete_systeme')} value={record.fields.verwendete_systeme} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'informationsquellen')} value={record.fields.informationsquellen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'arbeit')} value={record.fields.arbeit} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'entscheidung')} value={record.fields.entscheidung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'entscheidung_durch')} value={record.fields.entscheidung_durch} format="text" />
        <RecordField label={fieldLabel('vorhaben', 'ergebnis')} value={record.fields.ergebnis} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'wirkung')} value={record.fields.wirkung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'erfahrung')} value={record.fields.erfahrung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('beobachtungen')}
        items={beobachtungenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: r.fields.quelle ?? appLabel('beobachtungen'), meta: r.fields.beobachtet_am })}
        onOpen={onOpenBeobachtungen}
        onAdd={onAddBeobachtungen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('regelanwendungen')}
        items={regelanwendungenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: r.fields.bewertet_von ?? appLabel('regelanwendungen'), meta: r.fields.angewendet_am })}
        onOpen={onOpenRegelanwendungen}
        onAdd={onAddRegelanwendungen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('pilotbewertungen')}
        items={pilotbewertungenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: appLabel('pilotbewertungen'), meta: r.fields.bewertet_am })}
        onOpen={onOpenPilotbewertungen}
        onAdd={onAddPilotbewertungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.VORHABEN} recordId={record.record_id} readOnly={!perms.canWrite('vorhaben')} />
    </>
  );
}
