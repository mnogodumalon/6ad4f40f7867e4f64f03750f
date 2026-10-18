/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'vorhaben'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.vorhaben.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.vorhaben.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.vorhaben.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.vorhaben              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   vorhaben: titel, intention, status, startdatum, enddatum, kontext, beteiligte_rollen, verwendete_systeme, …  ·  ← beobachtungen (list + contextual +) · ← regelanwendungen (list + contextual +) · ← pilotbewertungen (list + contextual +)
 *   beobachtungen: vorhaben, beschreibung, beobachtet_am, quelle, betroffene_objekte, fallart, beobachtet_von  ·  → vorhaben · ← belege (list + contextual +)
 *   erkenntnisse: widersprechende_erkenntnis, titel, stufe, hypothese, alternativerklaerungen, pruefung, schlussfolgerung, gueltigkeitsbereich, …  ·  → erkenntnisse · ← belege (list + contextual +) · ← regeln (list + contextual +)
 *   belege: beobachtung, wirkung_auf_erkenntnis, begruendung, gewichtung, geprueft_von, geprueft_am, erkenntnis  ·  → beobachtungen · → erkenntnisse
 *   regeln: regeltitel, regeltext, version, gueltigkeitsbereich, ausnahmeregelung, verantwortlicher, freigabestatus, freigegeben_von, …  ·  → erkenntnisse · ← regelanwendungen (list + contextual +) · ← pilotbewertungen (list + contextual +)
 *   regelanwendungen: regel, vorhaben, angewendet_am, art_der_anwendung, ergebnis, fehler_reduziert, nebenwirkungen, wirkungsbewertung, …  ·  → regeln · → vorhaben
 *   pilotbewertungen: regel, vorhaben, bewertet_am, problem_reduziert, qualitaetsveraenderung, zusatzaufwand, akzeptanz, wiederverwendbar, …  ·  → regeln · → vorhaben
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Vorhaben, Beobachtungen, Erkenntnisse, Belege, Regeln, Regelanwendungen, Pilotbewertungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichBeobachtungen, enrichErkenntnisse, enrichBelege, enrichRegeln, enrichRegelanwendungen, enrichPilotbewertungen } from '@/lib/enrich';
import type { EnrichedBeobachtungen, EnrichedErkenntnisse, EnrichedBelege, EnrichedRegeln, EnrichedRegelanwendungen, EnrichedPilotbewertungen } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { VorhabenDialog, type VorhabenDialogDefaults } from '@/components/dialogs/VorhabenDialog';
import { VorhabenDetails } from '@/components/details/VorhabenDetails';
import { BeobachtungenDialog, type BeobachtungenDialogDefaults } from '@/components/dialogs/BeobachtungenDialog';
import { BeobachtungenDetails } from '@/components/details/BeobachtungenDetails';
import { ErkenntnisseDialog, type ErkenntnisseDialogDefaults } from '@/components/dialogs/ErkenntnisseDialog';
import { ErkenntnisseDetails } from '@/components/details/ErkenntnisseDetails';
import { BelegeDialog, type BelegeDialogDefaults } from '@/components/dialogs/BelegeDialog';
import { BelegeDetails } from '@/components/details/BelegeDetails';
import { RegelnDialog, type RegelnDialogDefaults } from '@/components/dialogs/RegelnDialog';
import { RegelnDetails } from '@/components/details/RegelnDetails';
import { RegelanwendungenDialog, type RegelanwendungenDialogDefaults } from '@/components/dialogs/RegelanwendungenDialog';
import { RegelanwendungenDetails } from '@/components/details/RegelanwendungenDetails';
import { PilotbewertungenDialog, type PilotbewertungenDialogDefaults } from '@/components/dialogs/PilotbewertungenDialog';
import { PilotbewertungenDetails } from '@/components/details/PilotbewertungenDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'vorhaben'; record: Vorhaben }
  | { type: 'beobachtungen'; record: EnrichedBeobachtungen }
  | { type: 'erkenntnisse'; record: EnrichedErkenntnisse }
  | { type: 'belege'; record: EnrichedBelege }
  | { type: 'regeln'; record: EnrichedRegeln }
  | { type: 'regelanwendungen'; record: EnrichedRegelanwendungen }
  | { type: 'pilotbewertungen'; record: EnrichedPilotbewertungen };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
  /** May the signed-in user create/change records of this list? (the
   *  platform's rights — show a „+ Neu“ only when true; openCreate/openEdit
   *  refuse with a notice otherwise). */
  canWrite: boolean;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  vorhaben: EntityCrudApi<Vorhaben, VorhabenDialogDefaults>;
  beobachtungen: EntityCrudApi<Beobachtungen, BeobachtungenDialogDefaults>;
  erkenntnisse: EntityCrudApi<Erkenntnisse, ErkenntnisseDialogDefaults>;
  belege: EntityCrudApi<Belege, BelegeDialogDefaults>;
  regeln: EntityCrudApi<Regeln, RegelnDialogDefaults>;
  regelanwendungen: EntityCrudApi<Regelanwendungen, RegelanwendungenDialogDefaults>;
  pilotbewertungen: EntityCrudApi<Pilotbewertungen, PilotbewertungenDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { vorhaben: Vorhaben[]; beobachtungen: EnrichedBeobachtungen[]; erkenntnisse: EnrichedErkenntnisse[]; belege: EnrichedBelege[]; regeln: EnrichedRegeln[]; regelanwendungen: EnrichedRegelanwendungen[]; pilotbewertungen: EnrichedPilotbewertungen[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  // the platform's rights of the signed-in user (lib/permissions.ts) — unknown = allowed
  const perms = usePermissions();
  const refuse = () => { toast.error(t('perm_denied_title'), { description: t('perm_denied_desc') }); };
  const [vorhabenDialog, setVorhabenDialog] = useState<{ defaults?: VorhabenDialogDefaults; editing?: Vorhaben } | null>(null);
  const [beobachtungenDialog, setBeobachtungenDialog] = useState<{ defaults?: BeobachtungenDialogDefaults; editing?: Beobachtungen } | null>(null);
  const [erkenntnisseDialog, setErkenntnisseDialog] = useState<{ defaults?: ErkenntnisseDialogDefaults; editing?: Erkenntnisse } | null>(null);
  const [belegeDialog, setBelegeDialog] = useState<{ defaults?: BelegeDialogDefaults; editing?: Belege } | null>(null);
  const [regelnDialog, setRegelnDialog] = useState<{ defaults?: RegelnDialogDefaults; editing?: Regeln } | null>(null);
  const [regelanwendungenDialog, setRegelanwendungenDialog] = useState<{ defaults?: RegelanwendungenDialogDefaults; editing?: Regelanwendungen } | null>(null);
  const [pilotbewertungenDialog, setPilotbewertungenDialog] = useState<{ defaults?: PilotbewertungenDialogDefaults; editing?: Pilotbewertungen } | null>(null);
  const enrichedBeobachtungen = useMemo(() => enrichBeobachtungen(data.beobachtungen, { vorhabenMap: data.vorhabenMap }), [data.beobachtungen, data.vorhabenMap]);
  const enrichedErkenntnisse = useMemo(() => enrichErkenntnisse(data.erkenntnisse, { erkenntnisseMap: data.erkenntnisseMap }), [data.erkenntnisse, data.erkenntnisseMap]);
  const enrichedBelege = useMemo(() => enrichBelege(data.belege, { beobachtungenMap: data.beobachtungenMap, erkenntnisseMap: data.erkenntnisseMap }), [data.belege, data.beobachtungenMap, data.erkenntnisseMap]);
  const enrichedRegeln = useMemo(() => enrichRegeln(data.regeln, { erkenntnisseMap: data.erkenntnisseMap }), [data.regeln, data.erkenntnisseMap]);
  const enrichedRegelanwendungen = useMemo(() => enrichRegelanwendungen(data.regelanwendungen, { regelnMap: data.regelnMap, vorhabenMap: data.vorhabenMap }), [data.regelanwendungen, data.regelnMap, data.vorhabenMap]);
  const enrichedPilotbewertungen = useMemo(() => enrichPilotbewertungen(data.pilotbewertungen, { regelnMap: data.regelnMap, vorhabenMap: data.vorhabenMap }), [data.pilotbewertungen, data.regelnMap, data.vorhabenMap]);

  function detailVorhaben(record: Vorhaben, push = false) {
    const item: OverlayItem = { type: 'vorhaben', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitVorhaben(fields: Vorhaben['fields']) {
    const editing = vorhabenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setVorhaben(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateVorhabenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('vorhaben')} — ${t('crud_updated')}`, async () => {
        data.setVorhaben(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateVorhabenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createVorhabenEntry(fields);
      undoToast(`${appLabel('vorhaben')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailBeobachtungen(record: Beobachtungen, push = false) {
    const rec = enrichedBeobachtungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'beobachtungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitBeobachtungen(fields: Beobachtungen['fields']) {
    const editing = beobachtungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setBeobachtungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateBeobachtungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('beobachtungen')} — ${t('crud_updated')}`, async () => {
        data.setBeobachtungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateBeobachtungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createBeobachtungenEntry(fields);
      undoToast(`${appLabel('beobachtungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailErkenntnisse(record: Erkenntnisse, push = false) {
    const rec = enrichedErkenntnisse.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'erkenntnisse', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitErkenntnisse(fields: Erkenntnisse['fields']) {
    const editing = erkenntnisseDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setErkenntnisse(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateErkenntnisseEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('erkenntnisse')} — ${t('crud_updated')}`, async () => {
        data.setErkenntnisse(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateErkenntnisseEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createErkenntnisseEntry(fields);
      undoToast(`${appLabel('erkenntnisse')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailBelege(record: Belege, push = false) {
    const rec = enrichedBelege.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'belege', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitBelege(fields: Belege['fields']) {
    const editing = belegeDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setBelege(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateBelegeEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('belege')} — ${t('crud_updated')}`, async () => {
        data.setBelege(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateBelegeEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createBelegeEntry(fields);
      undoToast(`${appLabel('belege')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailRegeln(record: Regeln, push = false) {
    const rec = enrichedRegeln.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'regeln', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitRegeln(fields: Regeln['fields']) {
    const editing = regelnDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setRegeln(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateRegelnEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('regeln')} — ${t('crud_updated')}`, async () => {
        data.setRegeln(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateRegelnEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createRegelnEntry(fields);
      undoToast(`${appLabel('regeln')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailRegelanwendungen(record: Regelanwendungen, push = false) {
    const rec = enrichedRegelanwendungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'regelanwendungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitRegelanwendungen(fields: Regelanwendungen['fields']) {
    const editing = regelanwendungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setRegelanwendungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateRegelanwendungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('regelanwendungen')} — ${t('crud_updated')}`, async () => {
        data.setRegelanwendungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateRegelanwendungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createRegelanwendungenEntry(fields);
      undoToast(`${appLabel('regelanwendungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailPilotbewertungen(record: Pilotbewertungen, push = false) {
    const rec = enrichedPilotbewertungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'pilotbewertungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitPilotbewertungen(fields: Pilotbewertungen['fields']) {
    const editing = pilotbewertungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setPilotbewertungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updatePilotbewertungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('pilotbewertungen')} — ${t('crud_updated')}`, async () => {
        data.setPilotbewertungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updatePilotbewertungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createPilotbewertungenEntry(fields);
      undoToast(`${appLabel('pilotbewertungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <VorhabenDialog
        open={vorhabenDialog !== null}
        onClose={() => setVorhabenDialog(null)}
        onSubmit={submitVorhaben}
        defaultValues={vorhabenDialog?.defaults}
        recordId={vorhabenDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Vorhaben']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Vorhaben']}
      />
      <BeobachtungenDialog
        open={beobachtungenDialog !== null}
        onClose={() => setBeobachtungenDialog(null)}
        onSubmit={submitBeobachtungen}
        defaultValues={beobachtungenDialog?.defaults}
        recordId={beobachtungenDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        enablePhotoScan={AI_PHOTO_SCAN['Beobachtungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Beobachtungen']}
      />
      <ErkenntnisseDialog
        open={erkenntnisseDialog !== null}
        onClose={() => setErkenntnisseDialog(null)}
        onSubmit={submitErkenntnisse}
        defaultValues={erkenntnisseDialog?.defaults}
        recordId={erkenntnisseDialog?.editing?.record_id}
        erkenntnisseList={data.erkenntnisse}
        enablePhotoScan={AI_PHOTO_SCAN['Erkenntnisse']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Erkenntnisse']}
      />
      <BelegeDialog
        open={belegeDialog !== null}
        onClose={() => setBelegeDialog(null)}
        onSubmit={submitBelege}
        defaultValues={belegeDialog?.defaults}
        recordId={belegeDialog?.editing?.record_id}
        beobachtungenList={data.beobachtungen}
        erkenntnisseList={data.erkenntnisse}
        enablePhotoScan={AI_PHOTO_SCAN['Belege']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Belege']}
      />
      <RegelnDialog
        open={regelnDialog !== null}
        onClose={() => setRegelnDialog(null)}
        onSubmit={submitRegeln}
        defaultValues={regelnDialog?.defaults}
        recordId={regelnDialog?.editing?.record_id}
        erkenntnisseList={data.erkenntnisse}
        enablePhotoScan={AI_PHOTO_SCAN['Regeln']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Regeln']}
      />
      <RegelanwendungenDialog
        open={regelanwendungenDialog !== null}
        onClose={() => setRegelanwendungenDialog(null)}
        onSubmit={submitRegelanwendungen}
        defaultValues={regelanwendungenDialog?.defaults}
        recordId={regelanwendungenDialog?.editing?.record_id}
        regelnList={data.regeln}
        vorhabenList={data.vorhaben}
        enablePhotoScan={AI_PHOTO_SCAN['Regelanwendungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Regelanwendungen']}
      />
      <PilotbewertungenDialog
        open={pilotbewertungenDialog !== null}
        onClose={() => setPilotbewertungenDialog(null)}
        onSubmit={submitPilotbewertungen}
        defaultValues={pilotbewertungenDialog?.defaults}
        recordId={pilotbewertungenDialog?.editing?.record_id}
        regelnList={data.regeln}
        vorhabenList={data.vorhaben}
        enablePhotoScan={AI_PHOTO_SCAN['Pilotbewertungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Pilotbewertungen']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'vorhaben') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('vorhaben')} subtitle={top.record.fields.startdatum ? formatDate(top.record.fields.startdatum) : undefined} />
                <VorhabenDetails
                  record={top.record}
                  beobachtungenList={data.beobachtungen}
                  onOpenBeobachtungen={(r) => detailBeobachtungen(r, true)}
                  onAddBeobachtungen={perms.canWrite('beobachtungen') ? () => setBeobachtungenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  regelanwendungenList={data.regelanwendungen}
                  onOpenRegelanwendungen={(r) => detailRegelanwendungen(r, true)}
                  onAddRegelanwendungen={perms.canWrite('regelanwendungen') ? () => setRegelanwendungenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  pilotbewertungenList={data.pilotbewertungen}
                  onOpenPilotbewertungen={(r) => detailPilotbewertungen(r, true)}
                  onAddPilotbewertungen={perms.canWrite('pilotbewertungen') ? () => setPilotbewertungenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'beobachtungen') {
            return (
              <>
                <RecordHeader title={top.record.fields.quelle ?? appLabel('beobachtungen')} subtitle={top.record.fields.beobachtet_am ? formatDate(top.record.fields.beobachtet_am) : undefined} />
                <BeobachtungenDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  belegeList={data.belege}
                  onOpenBelege={(r) => detailBelege(r, true)}
                  onAddBelege={perms.canWrite('belege') ? () => setBelegeDialog({ defaults: { beobachtung: createRecordUrl(APP_IDS.BEOBACHTUNGEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'erkenntnisse') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('erkenntnisse')} subtitle={top.record.fields.letzte_pruefung ? formatDate(top.record.fields.letzte_pruefung) : undefined} />
                <ErkenntnisseDetails
                  record={top.record}
                  erkenntnisseList={data.erkenntnisse}
                  onOpenErkenntnisse={(r) => detailErkenntnisse(r, true)}
                  belegeList={data.belege}
                  onOpenBelege={(r) => detailBelege(r, true)}
                  onAddBelege={perms.canWrite('belege') ? () => setBelegeDialog({ defaults: { erkenntnis: createRecordUrl(APP_IDS.ERKENNTNISSE, top.record.record_id) } }) : undefined}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  onAddRegeln={perms.canWrite('regeln') ? () => setRegelnDialog({ defaults: { erkenntnis: createRecordUrl(APP_IDS.ERKENNTNISSE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'belege') {
            return (
              <>
                <RecordHeader title={top.record.fields.geprueft_von ?? appLabel('belege')} subtitle={top.record.fields.geprueft_am ? formatDate(top.record.fields.geprueft_am) : undefined} />
                <BelegeDetails
                  record={top.record}
                  beobachtungenList={data.beobachtungen}
                  onOpenBeobachtungen={(r) => detailBeobachtungen(r, true)}
                  erkenntnisseList={data.erkenntnisse}
                  onOpenErkenntnisse={(r) => detailErkenntnisse(r, true)}
                />
              </>
            );
          }
          if (top.type === 'regeln') {
            return (
              <>
                <RecordHeader title={top.record.fields.regeltitel ?? appLabel('regeln')} subtitle={top.record.fields.gueltig_ab ? formatDate(top.record.fields.gueltig_ab) : undefined} />
                <RegelnDetails
                  record={top.record}
                  erkenntnisseList={data.erkenntnisse}
                  onOpenErkenntnisse={(r) => detailErkenntnisse(r, true)}
                  regelanwendungenList={data.regelanwendungen}
                  onOpenRegelanwendungen={(r) => detailRegelanwendungen(r, true)}
                  onAddRegelanwendungen={perms.canWrite('regelanwendungen') ? () => setRegelanwendungenDialog({ defaults: { regel: createRecordUrl(APP_IDS.REGELN, top.record.record_id) } }) : undefined}
                  pilotbewertungenList={data.pilotbewertungen}
                  onOpenPilotbewertungen={(r) => detailPilotbewertungen(r, true)}
                  onAddPilotbewertungen={perms.canWrite('pilotbewertungen') ? () => setPilotbewertungenDialog({ defaults: { regel: createRecordUrl(APP_IDS.REGELN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'regelanwendungen') {
            return (
              <>
                <RecordHeader title={top.record.fields.bewertet_von ?? appLabel('regelanwendungen')} subtitle={top.record.fields.angewendet_am ? formatDate(top.record.fields.angewendet_am) : undefined} />
                <RegelanwendungenDetails
                  record={top.record}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                />
              </>
            );
          }
          if (top.type === 'pilotbewertungen') {
            return (
              <>
                <RecordHeader title={appLabel('pilotbewertungen')} subtitle={top.record.fields.bewertet_am ? formatDate(top.record.fields.bewertet_am) : undefined} />
                <PilotbewertungenDetails
                  record={top.record}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        canEdit={(top) => {
          if (top.type === 'vorhaben') return perms.canWrite('vorhaben');
          if (top.type === 'beobachtungen') return perms.canWrite('beobachtungen');
          if (top.type === 'erkenntnisse') return perms.canWrite('erkenntnisse');
          if (top.type === 'belege') return perms.canWrite('belege');
          if (top.type === 'regeln') return perms.canWrite('regeln');
          if (top.type === 'regelanwendungen') return perms.canWrite('regelanwendungen');
          if (top.type === 'pilotbewertungen') return perms.canWrite('pilotbewertungen');
          return true;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'vorhaben') setVorhabenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'beobachtungen') setBeobachtungenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'erkenntnisse') setErkenntnisseDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'belege') setBelegeDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'regeln') setRegelnDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'regelanwendungen') setRegelanwendungenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'pilotbewertungen') setPilotbewertungenDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    vorhaben: {
      openCreate: (defaults?: VorhabenDialogDefaults) => (perms.canWrite('vorhaben') ? setVorhabenDialog({ defaults }) : refuse()),
      openEdit: (record: Vorhaben) => (perms.canWrite('vorhaben') ? setVorhabenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Vorhaben) => detailVorhaben(record, false),
      canWrite: perms.canWrite('vorhaben'),
    },
    beobachtungen: {
      openCreate: (defaults?: BeobachtungenDialogDefaults) => (perms.canWrite('beobachtungen') ? setBeobachtungenDialog({ defaults }) : refuse()),
      openEdit: (record: Beobachtungen) => (perms.canWrite('beobachtungen') ? setBeobachtungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Beobachtungen) => detailBeobachtungen(record, false),
      canWrite: perms.canWrite('beobachtungen'),
    },
    erkenntnisse: {
      openCreate: (defaults?: ErkenntnisseDialogDefaults) => (perms.canWrite('erkenntnisse') ? setErkenntnisseDialog({ defaults }) : refuse()),
      openEdit: (record: Erkenntnisse) => (perms.canWrite('erkenntnisse') ? setErkenntnisseDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Erkenntnisse) => detailErkenntnisse(record, false),
      canWrite: perms.canWrite('erkenntnisse'),
    },
    belege: {
      openCreate: (defaults?: BelegeDialogDefaults) => (perms.canWrite('belege') ? setBelegeDialog({ defaults }) : refuse()),
      openEdit: (record: Belege) => (perms.canWrite('belege') ? setBelegeDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Belege) => detailBelege(record, false),
      canWrite: perms.canWrite('belege'),
    },
    regeln: {
      openCreate: (defaults?: RegelnDialogDefaults) => (perms.canWrite('regeln') ? setRegelnDialog({ defaults }) : refuse()),
      openEdit: (record: Regeln) => (perms.canWrite('regeln') ? setRegelnDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Regeln) => detailRegeln(record, false),
      canWrite: perms.canWrite('regeln'),
    },
    regelanwendungen: {
      openCreate: (defaults?: RegelanwendungenDialogDefaults) => (perms.canWrite('regelanwendungen') ? setRegelanwendungenDialog({ defaults }) : refuse()),
      openEdit: (record: Regelanwendungen) => (perms.canWrite('regelanwendungen') ? setRegelanwendungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Regelanwendungen) => detailRegelanwendungen(record, false),
      canWrite: perms.canWrite('regelanwendungen'),
    },
    pilotbewertungen: {
      openCreate: (defaults?: PilotbewertungenDialogDefaults) => (perms.canWrite('pilotbewertungen') ? setPilotbewertungenDialog({ defaults }) : refuse()),
      openEdit: (record: Pilotbewertungen) => (perms.canWrite('pilotbewertungen') ? setPilotbewertungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Pilotbewertungen) => detailPilotbewertungen(record, false),
      canWrite: perms.canWrite('pilotbewertungen'),
    },
    enriched: { vorhaben: data.vorhaben, beobachtungen: enrichedBeobachtungen, erkenntnisse: enrichedErkenntnisse, belege: enrichedBelege, regeln: enrichedRegeln, regelanwendungen: enrichedRegelanwendungen, pilotbewertungen: enrichedPilotbewertungen },
  };
}
