import { useMemo, useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { IconAlertTriangle, IconPlus, IconScale, IconGavel, IconRocket } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import type { EnrichedBeobachtungen } from '@/types/enriched';
import type { Erkenntnisse, Regeln, Vorhaben } from '@/types/app';
import { LOOKUP_OPTIONS, lookupOption } from '@/types/app';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import { formatDate, lookupKey } from '@/lib/formatters';
import { appLabel, tx } from '@/i18n';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { DashboardGrid } from '@/components/DashboardGrid';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { KanbanWidget, type KanbanCard, type KanbanColumn } from '@/components/widgets/KanbanWidget';
import { ChartWidget, type ChartRow } from '@/components/widgets/ChartWidget';

const REVIEW_INTERVAL_DAYS = 90;
const TERMINAL = ['ueberholt', 'zurueckgenommen'];

type KpiFilter = 'widerspruch' | 'unsicher' | null;

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const {
    vorhaben, erkenntnisse, belege, regeln, pilotbewertungen,
    setVorhaben, setErkenntnisse, setRegeln,
    fetchAll,
  } = data;
  const clock = useClock();
  const today = format(clock, 'yyyy-MM-dd');
  const [filter, setFilter] = useState<KpiFilter>(null);

  const reviewedPatch = () => ({
    letzte_pruefung: today,
    naechste_pruefung: format(addDays(clock, REVIEW_INTERVAL_DAYS), 'yyyy-MM-dd'),
  });

  // ── shared write helpers (optimistic + Undo) ─────────────────────────
  const reviewErkenntnis = (e: Erkenntnisse) => {
    const before = { letzte_pruefung: e.fields.letzte_pruefung, naechste_pruefung: e.fields.naechste_pruefung };
    const patch = reviewedPatch();
    setErkenntnisse(prev => prev.map(x => x.record_id === e.record_id ? { ...x, fields: { ...x.fields, ...patch } } : x));
    LivingAppsService.updateErkenntnisseEntry(e.record_id, patch).catch(() => fetchAll());
    undoToast(tx`${e.fields.titel ?? ''} — als geprüft markiert`, () => {
      setErkenntnisse(prev => prev.map(x => x.record_id === e.record_id ? { ...x, fields: { ...x.fields, ...before } } : x));
      LivingAppsService.updateErkenntnisseEntry(e.record_id, before).catch(() => fetchAll());
    });
  };

  const reviewRegel = (r: Regeln) => {
    const before = { letzte_pruefung: r.fields.letzte_pruefung, naechste_pruefung: r.fields.naechste_pruefung };
    const patch = reviewedPatch();
    setRegeln(prev => prev.map(x => x.record_id === r.record_id ? { ...x, fields: { ...x.fields, ...patch } } : x));
    LivingAppsService.updateRegelnEntry(r.record_id, patch).catch(() => fetchAll());
    undoToast(tx`${r.fields.regeltitel ?? ''} — als geprüft markiert`, () => {
      setRegeln(prev => prev.map(x => x.record_id === r.record_id ? { ...x, fields: { ...x.fields, ...before } } : x));
      LivingAppsService.updateRegelnEntry(r.record_id, before).catch(() => fetchAll());
    });
  };

  const approveRegel = (r: Regeln) => {
    const before = r.fields.freigabestatus;
    const beforeAb = r.fields.gueltig_ab;
    const patchAb = beforeAb ? {} : { gueltig_ab: today };
    setRegeln(prev => prev.map(x => x.record_id === r.record_id
      ? { ...x, fields: { ...x.fields, ...patchAb, freigabestatus: lookupOption('regeln', 'freigabestatus', 'freigegeben') } } : x));
    LivingAppsService.updateRegelnEntry(r.record_id, { ...patchAb, freigabestatus: 'freigegeben' }).catch(() => fetchAll());
    undoToast(tx`${r.fields.regeltitel ?? ''} — freigegeben`, () => {
      setRegeln(prev => prev.map(x => x.record_id === r.record_id
        ? { ...x, fields: { ...x.fields, gueltig_ab: beforeAb, freigabestatus: before } } : x));
      LivingAppsService.updateRegelnEntry(r.record_id, { gueltig_ab: beforeAb, freigabestatus: before?.key ?? 'zur_freigabe' }).catch(() => fetchAll());
    });
  };

  const advanceVorhaben = (v: Vorhaben, to: 'in_arbeit' | 'abgeschlossen') => {
    const before = v.fields.status;
    setVorhaben(prev => prev.map(x => x.record_id === v.record_id
      ? { ...x, fields: { ...x.fields, status: lookupOption('vorhaben', 'status', to) } } : x));
    LivingAppsService.updateVorhabenEntry(v.record_id, { status: to }).catch(() => fetchAll());
    undoToast(to === 'abgeschlossen' ? tx`${v.fields.titel ?? ''} — abgeschlossen` : tx`${v.fields.titel ?? ''} — gestartet`, () => {
      setVorhaben(prev => prev.map(x => x.record_id === v.record_id ? { ...x, fields: { ...x.fields, status: before } } : x));
      LivingAppsService.updateVorhabenEntry(v.record_id, { status: before?.key ?? 'geplant' }).catch(() => fetchAll());
    });
  };

  const isDue = (d?: string) => !!d && d.slice(0, 10) <= today;

  const crud = useEntityCrud(data, {
    footer: (top) => {
      if (top.type === 'erkenntnisse') {
        const e = erkenntnisse.find(x => x.record_id === top.record.record_id);
        if (e && !TERMINAL.includes(lookupKey(e.fields.stufe) ?? '') && isDue(e.fields.naechste_pruefung)) {
          return { label: tx('Als geprüft markieren'), onClick: () => reviewErkenntnis(e) };
        }
      }
      if (top.type === 'regeln') {
        const r = regeln.find(x => x.record_id === top.record.record_id);
        if (r && lookupKey(r.fields.freigabestatus) === 'zur_freigabe') {
          return { label: tx('Regel freigeben'), onClick: () => approveRegel(r) };
        }
        if (r && !TERMINAL.includes(lookupKey(r.fields.freigabestatus) ?? '') && isDue(r.fields.naechste_pruefung)) {
          return { label: tx('Als geprüft markieren'), onClick: () => reviewRegel(r) };
        }
      }
      if (top.type === 'vorhaben') {
        const v = vorhaben.find(x => x.record_id === top.record.record_id);
        const st = v ? lookupKey(v.fields.status) : undefined;
        if (v && st === 'in_arbeit') return { label: tx('Vorhaben abschließen'), onClick: () => advanceVorhaben(v, 'abgeschlossen') };
        if (v && st === 'geplant') return { label: tx('Vorhaben starten'), onClick: () => advanceVorhaben(v, 'in_arbeit') };
      }
      return undefined;
    },
  });
  const enrichedBeobachtungen: EnrichedBeobachtungen[] = crud.enriched.beobachtungen;

  // ── derived data ─────────────────────────────────────────────────────
  const widerspruchIds = useMemo(() => {
    const ids = new Set<string>();
    for (const b of belege) {
      if (lookupKey(b.fields.wirkung_auf_erkenntnis) === 'widersprechend') {
        const id = extractRecordId(b.fields.erkenntnis);
        if (id) ids.add(id);
      }
    }
    for (const e of erkenntnisse) {
      if (e.fields.widersprechende_erkenntnis) {
        ids.add(e.record_id);
        const other = extractRecordId(e.fields.widersprechende_erkenntnis);
        if (other) ids.add(other);
      }
    }
    return ids;
  }, [belege, erkenntnisse]);

  const unsicher = useMemo(
    () => erkenntnisse.filter(e => lookupKey(e.fields.unsicherheit_grad) === 'hoch' && !TERMINAL.includes(lookupKey(e.fields.stufe) ?? '')),
    [erkenntnisse],
  );

  const due = useMemo(() => {
    const items: { id: string; kind: 'e' | 'r'; title: string; date: string; overdue: boolean; e?: Erkenntnisse; r?: Regeln }[] = [];
    for (const e of erkenntnisse) {
      const d = e.fields.naechste_pruefung?.slice(0, 10);
      if (!d || TERMINAL.includes(lookupKey(e.fields.stufe) ?? '')) continue;
      const soon = format(addDays(clock, 14), 'yyyy-MM-dd');
      if (d <= soon) items.push({ id: `e:${e.record_id}`, kind: 'e', title: e.fields.titel ?? '—', date: d, overdue: d < today, e });
    }
    for (const r of regeln) {
      const d = r.fields.naechste_pruefung?.slice(0, 10);
      if (!d || TERMINAL.includes(lookupKey(r.fields.freigabestatus) ?? '')) continue;
      const soon = format(addDays(clock, 14), 'yyyy-MM-dd');
      if (d <= soon) items.push({ id: `r:${r.record_id}`, kind: 'r', title: r.fields.regeltitel ?? '—', date: d, overdue: d < today, r });
    }
    return items.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  }, [erkenntnisse, regeln, today, clock]);

  const overdueItems = due.filter(i => i.overdue);
  const zurFreigabe = regeln.filter(r => lookupKey(r.fields.freigabestatus) === 'zur_freigabe');
  const laufend = vorhaben.filter(v => lookupKey(v.fields.status) === 'in_arbeit');

  const pilotCount = (k: string) => pilotbewertungen.filter(p => lookupKey(p.fields.entscheidung) === k).length;
  const latestPilot = [...pilotbewertungen].sort((a, b) => (b.fields.bewertet_am ?? '').localeCompare(a.fields.bewertet_am ?? ''))[0];

  const COLUMNS: KanbanColumn[] = (LOOKUP_OPTIONS['erkenntnisse']?.['stufe'] ?? []).map(o => ({ key: o.key, label: o.label }));

  const visibleErkenntnisse = erkenntnisse.filter(e =>
    filter === 'widerspruch' ? widerspruchIds.has(e.record_id)
      : filter === 'unsicher' ? lookupKey(e.fields.unsicherheit_grad) === 'hoch'
        : true);

  const cards: KanbanCard[] = visibleErkenntnisse.map(e => {
    const d = e.fields.naechste_pruefung?.slice(0, 10);
    const overdue = !!d && d < today && !TERMINAL.includes(lookupKey(e.fields.stufe) ?? '');
    return {
      id: `erkenntnis:${e.record_id}`,
      column: lookupKey(e.fields.stufe) ?? COLUMNS[0]?.key ?? '',
      title: e.fields.titel ?? '—',
      subtitle: overdue ? tx`Prüfung überfällig seit ${formatDate(d)}` : e.fields.unsicherheit_grad ? tx`Unsicherheit: ${e.fields.unsicherheit_grad.label}` : undefined,
      tone: overdue ? 'warning' : widerspruchIds.has(e.record_id) ? 'destructive' : 'default',
    };
  });

  const moveCard = (cardId: string, newColumn: string) => {
    const rid = cardId.split(':')[1];
    const e = erkenntnisse.find(x => x.record_id === rid);
    if (!e) return;
    const before = e.fields.stufe;
    setErkenntnisse(prev => prev.map(x => x.record_id === rid ? { ...x, fields: { ...x.fields, stufe: lookupOption('erkenntnisse', 'stufe', newColumn) } } : x));
    LivingAppsService.updateErkenntnisseEntry(rid, { stufe: newColumn }).catch(() => fetchAll());
    const label = COLUMNS.find(c => c.key === newColumn)?.label ?? newColumn;
    undoToast(tx`${e.fields.titel ?? ''} → ${label}`, () => {
      setErkenntnisse(prev => prev.map(x => x.record_id === rid ? { ...x, fields: { ...x.fields, stufe: before } } : x));
      LivingAppsService.updateErkenntnisseEntry(rid, { stufe: before?.key ?? 'hypothese' }).catch(() => fetchAll());
    });
  };

  const beobachtungRows: ChartRow<EnrichedBeobachtungen>[] = enrichedBeobachtungen.map(b => ({ id: `beobachtung:${b.record_id}`, data: b }));

  const openDue = (id: string) => {
    const [k, rid] = id.split(':');
    if (k === 'e') { const e = erkenntnisse.find(x => x.record_id === rid); if (e) crud.erkenntnisse.openDetail(e); }
    else { const r = regeln.find(x => x.record_id === rid); if (r) crud.regeln.openDetail(r); }
  };

  // ── context line ─────────────────────────────────────────────────────
  const totalRecords = vorhaben.length + erkenntnisse.length + regeln.length + beobachtungen_len();
  function beobachtungen_len() { return enrichedBeobachtungen.length; }
  const isEmpty = totalRecords === 0;

  const dueNames = namen(overdueItems.map(i => i.title), 2);
  const context = overdueItems.length > 0
    ? tx`Überfällig zur Prüfung: ${dueNames}.`
    : zurFreigabe.length > 0
      ? tx`Zur Freigabe wartet: ${namen(zurFreigabe.map(r => r.fields.regeltitel ?? ''), 2)}.`
      : laufend.length > 0
        ? tx`Aktuell laufen: ${namen(laufend.map(v => v.fields.titel ?? ''), 2)}.`
        : tx`Alle Überprüfungen sind im Zeitplan.`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground">{isEmpty ? tx`Richte dein Erfahrungswissen ein — starte mit dem ersten Vorhaben.` : context}</p>
        </div>
        {crud.vorhaben.canWrite && (
          <Button onClick={() => crud.vorhaben.openCreate({ status: 'geplant' })}>
            <IconPlus size={16} className="shrink-0" />
            <span>{tx('Neues Vorhaben')}</span>
          </Button>
        )}
      </div>

      <DashboardGrid
        variant="wide"
        hero={isEmpty ? (
          <HeroBanner
            icon={<IconRocket size={18} />}
            action={{ label: tx('Erstes Vorhaben erfassen'), onClick: () => crud.vorhaben.openCreate({ status: 'geplant' }) }}
          >
            {tx('Noch keine Daten — erfasse ein Vorhaben, um Beobachtungen, Erkenntnisse und Regeln zu verfolgen.')}
          </HeroBanner>
        ) : overdueItems.length > 0 ? (
          <HeroBanner
            icon={<IconAlertTriangle size={18} />}
            action={{
              label: tx('Als geprüft markieren'),
              onClick: () => {
                const first = overdueItems[0];
                if (first.e) reviewErkenntnis(first.e);
                else if (first.r) reviewRegel(first.r);
              },
            }}
          >
            {overdueItems.length === 1
              ? tx`${overdueItems[0].title} ist überfällig — Prüfung war am ${formatDate(overdueItems[0].date)} fällig.`
              : tx`${dueNames} und weitere sind überfällig — älteste Prüfung war am ${formatDate(overdueItems[0].date)} fällig.`}
          </HeroBanner>
        ) : undefined}
        kpis={isEmpty ? undefined : (
          <StatStrip>
            <StatStripItem
              title={tx('Mit Widerspruch')}
              value={widerspruchIds.size}
              icon={<IconScale size={16} className="text-muted-foreground" />}
              tone={widerspruchIds.size > 0 ? 'warning' : 'default'}
              onClick={() => setFilter(f => f === 'widerspruch' ? null : 'widerspruch')}
              active={filter === 'widerspruch'}
            />
            <StatStripItem
              title={tx('Hohe Unsicherheit')}
              value={unsicher.length}
              icon={<IconAlertTriangle size={16} className="text-muted-foreground" />}
              tone={unsicher.length > 0 ? 'warning' : 'default'}
              onClick={() => setFilter(f => f === 'unsicher' ? null : 'unsicher')}
              active={filter === 'unsicher'}
            />
            <StatStripItem
              title={tx('Pilot: Ausbauen · Anpassen · Beenden')}
              value={`${pilotCount('ausbauen')} · ${pilotCount('anpassen')} · ${pilotCount('beenden')}`}
              icon={<IconGavel size={16} className="text-muted-foreground" />}
              onClick={latestPilot ? () => crud.pilotbewertungen.openDetail(latestPilot) : undefined}
            />
          </StatStrip>
        )}
        aside={isEmpty ? undefined : (
          <>
            <WorkList
              title={tx('Fällige Überprüfungen')}
              items={due.map(i => ({
                id: i.id,
                title: i.title,
                secondLine: (
                  <>
                    <span className={i.overdue ? 'font-medium text-destructive' : 'font-medium text-amber-600'}>
                      {i.overdue ? tx('Überfällig') : tx('Bald fällig')}
                    </span>
                    <span className="text-muted-foreground"> · {i.kind === 'e' ? appLabel('erkenntnisse') : appLabel('regeln')} · {formatDate(i.date)}</span>
                  </>
                ),
                action: { label: tx('✓ Geprüft'), onClick: () => (i.e ? reviewErkenntnis(i.e) : i.r && reviewRegel(i.r)) },
              }))}
              onItemClick={openDue}
              empty={{ text: tx('Alle Überprüfungen im Zeitplan.') }}
            />
            <WorkList
              title={tx('Regeln zur Freigabe')}
              items={zurFreigabe.map(r => ({
                id: r.record_id,
                title: r.fields.regeltitel ?? '—',
                secondLine: <span className="text-muted-foreground">{r.fields.version ? tx`Version ${r.fields.version}` : tx('Wartet auf Freigabe')}{r.fields.verantwortlicher ? ` · ${r.fields.verantwortlicher}` : ''}</span>, /* i18n-exempt */
                action: { label: tx('Freigeben'), onClick: () => approveRegel(r) },
              }))}
              onItemClick={id => { const r = regeln.find(x => x.record_id === id); if (r) crud.regeln.openDetail(r); }}
              empty={{ text: tx('Keine Regel wartet auf Freigabe.'), action: crud.regeln.canWrite ? { label: tx('Neue Regel'), onClick: () => crud.regeln.openCreate({ freigabestatus: 'entwurf' }) } : undefined }}
            />
            <WorkList
              title={tx('Laufende Vorhaben')}
              items={laufend.map(v => ({
                id: v.record_id,
                title: v.fields.titel ?? '—',
                secondLine: <span className="text-muted-foreground">{v.fields.startdatum ? tx`seit ${formatDate(v.fields.startdatum)}` : tx('In Arbeit')}</span>,
                action: { label: tx('Abschließen'), onClick: () => advanceVorhaben(v, 'abgeschlossen') },
              }))}
              onItemClick={id => { const v = vorhaben.find(x => x.record_id === id); if (v) crud.vorhaben.openDetail(v); }}
              empty={{ text: tx('Kein Vorhaben läuft gerade.'), action: crud.vorhaben.canWrite ? { label: tx('Neues Vorhaben'), onClick: () => crud.vorhaben.openCreate({ status: 'in_arbeit' }) } : undefined }}
            />
            <ChartWidget<EnrichedBeobachtungen>
              title={tx('Beobachtungen nach Art des Falls')}
              rows={beobachtungRows}
              dimension={{ kind: 'category', accessor: r => r.data.fields.fallart, label: tx('Fallart') }}
            />
          </>
        )}
        primary={
          <KanbanWidget
            cards={cards}
            columns={COLUMNS}
            defaultCollapsed={['ueberholt', 'zurueckgenommen']}
            onCardClick={card => {
              const e = erkenntnisse.find(x => x.record_id === card.id.split(':')[1]);
              if (e) crud.erkenntnisse.openDetail(e);
            }}
            onCardMove={moveCard}
            onAddCard={crud.erkenntnisse.canWrite ? column => crud.erkenntnisse.openCreate({ stufe: column }) : undefined}
          />
        }
      />
      {crud.surfaces}
    </div>
  );
}
