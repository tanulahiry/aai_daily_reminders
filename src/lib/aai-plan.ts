import type { AaiProfile } from "@/lib/aai-store";

export type ItemCategory = "health" | "career" | "relationships" | "general";

export type PlanMode = "normal" | "light";

export type Item = {
  id: string;
  time: string;
  kind: string;
  title: string;
  why: string;
  category: ItemCategory;
  /** Health, sleep, or money items get a low-emphasis disclaimer instead of a confident tone. */
  sensitive?: boolean;
};

export const SENSITIVE_DISCLAIMER = "General suggestion, not personalized advice.";

function buildNormalPlan(p: AaiProfile): Item[] {
  const fit = /fitness|clarity/i.test(p.goals);
  const career = /career|learning/i.test(p.goals);
  return [
    {
      id: "morning",
      time: "6:45",
      kind: "Morning nudge",
      title: fit ? "Sunlight + 500ml water before your phone" : "10 min journaling before email",
      why: `Your ${p.goals.toLowerCase()} goal starts before the first notification hits.`,
      category: "health",
      sensitive: true,
    },
    {
      id: "movement",
      time: "7:30",
      kind: "Movement",
      title: fit ? "Zone 2 · 35 min easy run" : "20 min mobility · low load",
      why: "HRV trending down 2 days — go aerobic, not heavy.",
      category: "health",
      sensitive: true,
    },
    {
      id: "priorities",
      time: "9:00",
      kind: "Top 3 for today",
      title: career
        ? "Draft the Q3 memo · Ship the deck v2 · 1:1 with Priya"
        : "Deep block · Errand loop · Inbox to zero",
      why: `You're ${p.stage.toLowerCase()} — Aai front-loaded the compounding work.`,
      category: "career",
    },
    {
      id: "relationship",
      time: "17:20",
      kind: "Reconnect",
      title: "Voice-note Marcus on your commute home",
      why: "Last real contact: 11 days. He replied last — the ball is with you.",
      category: "relationships",
    },
    {
      id: "dinner",
      time: "19:15",
      kind: "Dinner",
      title: fit
        ? "Sheet-pan salmon, greens, sweet potato"
        : "Miso-glazed tofu bowl with brown rice",
      why: `Nutrition target hit; doubles as tomorrow's lunch. Automates: ${p.automate.toLowerCase()}.`,
      category: "health",
      sensitive: true,
    },
  ];
}

function buildLightPlan(): Item[] {
  return [
    {
      id: "light-anchor",
      time: "—",
      kind: "One thing",
      title: "Pick the one thing that actually needs you today",
      why: "You flagged today as different, so Aai backed off the rest of the plan.",
      category: "general",
    },
    {
      id: "light-checkin",
      time: "—",
      kind: "Note for tomorrow",
      title: "Jot down what changed",
      why: "Helps Aai avoid planning around a normal day when today wasn't one.",
      category: "general",
    },
  ];
}

export function buildPlan(p: AaiProfile, mode: PlanMode = "normal"): Item[] {
  return mode === "light" ? buildLightPlan() : buildNormalPlan(p);
}
