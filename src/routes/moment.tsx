import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { applyTheme, defaultProfile, loadProfile, type AaiProfile } from "@/lib/aai-store";

export const Route = createFileRoute("/moment")({
  component: Moment,
});

type Status = "pending" | "confirmed" | "skipped";

type Item = {
  id: string;
  time: string;
  kind: string;
  title: string;
  why: string;
};

function buildPlan(p: AaiProfile): Item[] {
  const fit = /fitness|clarity/i.test(p.goals);
  const career = /career|learning/i.test(p.goals);
  return [
    {
      id: "morning",
      time: "6:45",
      kind: "Morning nudge",
      title: fit ? "Sunlight + 500ml water before your phone" : "10 min journaling before email",
      why: `Your ${p.goals.toLowerCase()} goal starts before the first notification hits.`,
    },
    {
      id: "movement",
      time: "7:30",
      kind: "Movement",
      title: fit ? "Zone 2 · 35 min easy run" : "20 min mobility · low load",
      why: "HRV trending down 2 days — go aerobic, not heavy.",
    },
    {
      id: "priorities",
      time: "9:00",
      kind: "Top 3 for today",
      title: career
        ? "Draft the Q3 memo · Ship the deck v2 · 1:1 with Priya"
        : "Deep block · Errand loop · Inbox to zero",
      why: `You're ${p.stage.toLowerCase()} — Aai front-loaded the compounding work.`,
    },
    {
      id: "relationship",
      time: "17:20",
      kind: "Reconnect",
      title: "Voice-note Marcus on your commute home",
      why: "Last real contact: 11 days. He replied last — the ball is with you.",
    },
    {
      id: "dinner",
      time: "19:15",
      kind: "Dinner",
      title: fit
        ? "Sheet-pan salmon, greens, sweet potato"
        : "Miso-glazed tofu bowl with brown rice",
      why: `Nutrition target hit; doubles as tomorrow's lunch. Automates: ${p.automate.toLowerCase()}.`,
    },
  ];
}

const STATE_KEY = "aai:day-state";

function Moment() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AaiProfile>(defaultProfile);
  const [status, setStatus] = useState<Record<string, Status>>({});

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    applyTheme(p.theme);
    try {
      const raw = window.localStorage.getItem(STATE_KEY);
      if (raw) setStatus(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const plan = useMemo(() => buildPlan(profile), [profile]);

  const setItem = (id: string, s: Status) => {
    const next = { ...status, [id]: s };
    setStatus(next);
    window.localStorage.setItem(STATE_KEY, JSON.stringify(next));
  };

  const confirmed = Object.values(status).filter((s) => s === "confirmed").length;
  const skipped = Object.values(status).filter((s) => s === "skipped").length;

  return (
    <Shell>
      <div className="flex items-end justify-between mb-8 gap-6 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Wednesday · Your Aai moment
          </p>
          <h1 className="serif text-5xl leading-[1.05] max-w-2xl">
            Your day, <em className="text-accent not-italic">already decided</em>.
            <br />You just say yes or skip.
          </h1>
        </div>
        <div className="rounded-2xl border bg-card px-5 py-4 text-sm">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Today
          </div>
          <div className="mt-1 flex gap-4">
            <span><b>{confirmed}</b> confirmed</span>
            <span><b>{skipped}</b> skipped</span>
            <span className="text-muted-foreground">{plan.length - confirmed - skipped} open</span>
          </div>
        </div>
      </div>

      <ol className="grid gap-3">
        {plan.map((it) => {
          const s = status[it.id] ?? "pending";
          return (
            <li
              key={it.id}
              className={`rounded-2xl border bg-card p-5 flex items-start gap-5 transition ${
                s === "confirmed" ? "border-success/50 bg-success/5" : ""
              } ${s === "skipped" ? "opacity-60" : ""}`}
            >
              <div className="w-14 text-right shrink-0">
                <div className="serif text-2xl">{it.time}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {it.kind}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium">{it.title}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="text-accent">Why · </span>{it.why}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setItem(it.id, "skipped")}
                  className="text-xs rounded-full px-3 py-1.5 border hover:border-foreground/30"
                >
                  Skip
                </button>
                <button
                  onClick={() => setItem(it.id, "confirmed")}
                  className="text-xs rounded-full px-3 py-1.5 bg-primary text-primary-foreground"
                >
                  Do it
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 flex items-center justify-between">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Adjust onboarding
        </Link>
        <button
          onClick={() => navigate({ to: "/rhythm" })}
          className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm"
        >
          See today's rhythm →
        </button>
      </div>
    </Shell>
  );
}
