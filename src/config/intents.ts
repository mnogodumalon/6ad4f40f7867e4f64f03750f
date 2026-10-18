/**
 * intents.ts — registry of intent workflow pages (Phase 2).
 *
 * The intents orchestrator REGISTERS every page it creates here; the sidebar
 * section (IntentsNav) renders automatically from this list — no Layout edit
 * needed. Keep `path` identical to the route added in App.tsx's
 * `<custom:routes>` block.
 *
 * ONLY write inside the marker blocks — everything outside is scaffold and is
 * overwritten on the next /build/update.
 *
 *   <custom:intent-imports>
 *   import { IconCalendarPlus } from '@tabler/icons-react';
 *   </custom:intent-imports>
 *   …
 *   <custom:intents>
 *   { path: '/intents/neue-buchung', label: { de: 'Neue Buchung', en: 'New booking' }, icon: IconCalendarPlus, description: { de: 'Buchung in 3 Schritten anlegen', en: 'Create a booking in 3 steps' } },
 *   </custom:intents>
 */
import type { ComponentType } from 'react';

// <custom:intent-imports>
import { IconBulb, IconChecklist, IconGavel, IconShieldCheck, IconRulerMeasure, IconFlask } from '@tabler/icons-react';
// </custom:intent-imports>

export interface IntentLink {
  /** Route path as wired in App.tsx (HashRouter), e.g. '/intents/neue-buchung'. */
  path: string;
  /**
   * Short sidebar label (1–3 words). Preferred: both UI languages
   * ({ de, en } — the runtime switcher picks the active one; cs stays
   * readable for legacy entries). A plain string stays valid and renders as-is.
   */
  label: string | { de?: string; en?: string; cs?: string };
  /** Tabler icon COMPONENT reference (not rendered JSX), e.g. IconCalendarPlus. */
  icon?: ComponentType<{ size?: number | string; className?: string; stroke?: number | string }>;
  /**
   * One-line purpose. Same shape as `label`: prefer both UI languages so a
   * language switch reaches it; a plain string stays valid.
   */
  description?: string | { de?: string; en?: string; cs?: string };
}

export const INTENTS: IntentLink[] = [
  // <custom:intents>
  { path: '/intents/erkenntnis-aus-beobachtung-ableiten', label: { de: 'Erkenntnis aus Beobachtung ableiten', en: 'Derive insight from observation' }, icon: IconBulb, description: 'Aus einer Beobachtung eine Hypothese anlegen und als ersten Beleg verbinden' },
  { path: '/intents/erkenntnis-pruefen', label: { de: 'Erkenntnis prüfen', en: 'Review insight' }, icon: IconChecklist, description: 'Erkenntnis mit Belegen prüfen, Stufe setzen und Widersprüche dokumentieren' },
  { path: '/intents/erkenntnis-freigeben-regel-ableiten', label: { de: 'Regel aus Erkenntnis ableiten', en: 'Derive rule from insight' }, icon: IconGavel, description: 'Aus einer geprüften Erkenntnis einen Regelentwurf zur Freigabe erstellen' },
  { path: '/intents/regel-freigeben-aendern', label: { de: 'Regel freigeben oder ändern', en: 'Approve or change rule' }, icon: IconShieldCheck, description: 'Regel freigeben, einschränken, als überholt kennzeichnen oder zurücknehmen' },
  { path: '/intents/regel-anwenden', label: { de: 'Regel im Vorhaben anwenden', en: 'Apply rule in project' }, icon: IconRulerMeasure, description: 'Freigegebene Regel einem Vorhaben zuordnen und die Wirkung dokumentieren' },
  { path: '/intents/pilot-bewerten', label: { de: 'Pilot bewerten', en: 'Evaluate pilot' }, icon: IconFlask, description: 'Pilot bewerten und ausbauen, anpassen oder beenden entscheiden' },
  // </custom:intents>
];

/**
 * True only in the Phase-1 deploy bundle (the service flips it): the sidebar
 * then shows ghost rows ("werden erstellt…") until Phase 2 registers the real
 * pages and sets this back to false. Lives OUTSIDE the custom markers on
 * purpose — a scaffold update resets it to false (self-healing if Phase 2
 * never ran).
 */
export const INTENTS_PENDING = false;

/**
 * When the Phase-1 bundle was deployed (ISO, set by the service together with
 * INTENTS_PENDING). The sidebar stops showing the ghost row PENDING_MAX_MINUTES
 * later on its own: a Phase 2 that ended red (or never ran) used to leave a
 * pulsing "werden erstellt …" in every deployed Phase-1 bundle forever — no
 * code path redeploys Phase 1 without the flag (live 03.09.2026).
 */
export const INTENTS_PENDING_SINCE: string | null = '2026-10-18T16:31:47+00:00';
export const PENDING_MAX_MINUTES = 30;
