import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import {
  applyTheme,
  defaultProfile,
  hasProfile,
  loadCheckin,
  loadDayState,
  loadProfile,
  type AaiProfile,
  type DayCheckin,
  type ItemStatus,
} from "@/lib/aai-store";
import { buildPlan, type PlanMode } from "@/lib/aai-plan";

export const Route = createFileRoute("/rhythm")({
  component: Rhythm,
});

function Rhythm() {
  const [profile, setProfile] = useState<AaiProfile>(defaultProfile);
  const [status, setStatus] = useState<Record<string, ItemStatus>>({});
  const [checkin, setCheckin] = useState<DayCheckin | null>(null);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    applyTheme(p.theme);
    setStatus(loadDayState());
    setCheckin(loadCheckin());
  }, []);

  const profileReady = hasProfile(profile);
  const isPaused = checkin?.choice === "skip";
  const mode: PlanMode = checkin?.choice === "swap" ? "light" : "normal";
  const plan = buildPlan(profile, mode);

  const ids = plan.map((item) => item.id);
  const labelById = Object.fromEntries(plan.map((item) => [item.id, item.kind]));
  const handled = ids.length;
  const confirmed = ids.filter((id) => status[id] === "confirmed");
  const skipped = ids.filter((id) => status[id] === "skipped");
  const open = ids.filter((id) => !status[id] || status[id] === "pending");

  const freed = handled - open.length;

  if (!profileReady) {
    return (
      <Shell>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Your rhythm · today
        </p>
        <h1 className="serif text-5xl leading-[1.05] max-w-2xl">
          We don't have a plan for today yet.
        </h1>
        <div className="mt-8 rounded-2xl border bg-card p-6 max-w-xl">
          <p className="text-muted-foreground">
            Let's set one up — answer three quick questions and Aai will build today's plan.
          </p>
          <Link
            to="/"
            className="inline-block mt-4 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm"
          >
            Set up my rhythm →
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
        Your rhythm · today
      </p>
      <h1 className="serif text-5xl leading-[1.05] max-w-3xl">
        Aai ran the <em className="text-accent not-italic">background</em>.
        You ran <em className="text-accent not-italic">you</em>.
      </h1>
      <p className="mt-4 text-muted-foreground max-w-xl">
        Mode: <span className="capitalize">{profile.theme}</span> · Automating{" "}
        <span className="lowercase">{profile.automate || "—"}</span> for a{" "}
        <span className="lowercase">{profile.stage || "—"}</span> chapter.
      </p>

      {isPaused ? (
        <div className="mt-10 rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          You paused today's plan, so there's nothing to review yet.
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Bucket
              tone="accent"
              label="Aai handled"
              count={handled}
              items={ids.map((id) => labelById[id])}
            />
            <Bucket
              tone="success"
              label="You confirmed"
              count={confirmed.length}
              items={confirmed.map((id) => labelById[id])}
            />
            <Bucket
              tone="muted"
              label="You skipped"
              count={skipped.length}
              items={skipped.map((id) => labelById[id])}
            />
          </div>

          <div className="mt-12 rounded-3xl border bg-card p-8 text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Today's estimate
            </div>
            <p className="serif text-4xl md:text-5xl mt-3">
              You skipped deciding on <em className="text-accent not-italic">{freed}</em>{" "}
              {freed === 1 ? "thing" : "things"} today.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              A self-reported estimate based on what you confirmed or skipped — not a precise
              measurement.
            </p>
          </div>
        </>
      )}

      <div className="mt-10 flex items-center justify-between">
        <Link to="/moment" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to today
        </Link>
        <Link
          to="/"
          className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm"
        >
          Tune my rhythm
        </Link>
      </div>
    </Shell>
  );
}

function Bucket({
  tone,
  label,
  count,
  items,
}: {
  tone: "accent" | "success" | "muted";
  label: string;
  count: number;
  items: string[];
}) {
  const toneClass =
    tone === "accent"
      ? "border-accent/40 bg-accent/5"
      : tone === "success"
        ? "border-success/40 bg-success/5"
        : "bg-muted/30";
  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="serif text-4xl mt-1">{count}</div>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        {items.length === 0 ? (
          <li className="italic">—</li>
        ) : (
          items.map((i) => <li key={i}>· {i}</li>)
        )}
      </ul>
    </div>
  );
}
