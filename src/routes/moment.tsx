import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import {
  applyTheme,
  clearDayState,
  daysSince,
  defaultProfile,
  hasProfile,
  isPlanStale,
  loadCheckin,
  loadDayState,
  loadProfile,
  saveCheckin,
  saveDayState,
  type AaiProfile,
  type DayCheckin,
  type ItemStatus,
} from "@/lib/aai-store";
import { buildPlan, SENSITIVE_DISCLAIMER, type PlanMode } from "@/lib/aai-plan";

export const Route = createFileRoute("/moment")({
  component: Moment,
});

function Moment() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AaiProfile>(defaultProfile);
  const [status, setStatus] = useState<Record<string, ItemStatus>>({});
  const [checkin, setCheckin] = useState<DayCheckin | null>(null);
  const [askingDifferent, setAskingDifferent] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    applyTheme(p.theme);
    setStatus(loadDayState());
    setCheckin(loadCheckin());
  }, []);

  const profileReady = hasProfile(profile);
  const stale = profileReady && isPlanStale(profile);
  const staleDays = profile.lastCheckInAt ? daysSince(profile.lastCheckInAt) : 0;

  const mode: PlanMode = checkin?.choice === "swap" ? "light" : "normal";
  const plan = useMemo(() => buildPlan(profile, mode), [profile, mode]);

  const setItem = (id: string, s: ItemStatus) => {
    const next = { ...status, [id]: s };
    setStatus(next);
    saveDayState(next);
  };

  const answerNormal = () => {
    saveCheckin("normal");
    setCheckin(loadCheckin());
    setAskingDifferent(false);
  };

  const answerDifferent = (choice: "skip" | "swap") => {
    const warning =
      choice === "skip"
        ? "Skipping today's plan will clear today's history and progress — it can't be undone. Continue?"
        : "Swapping to a lighter plan will clear today's history and progress — it can't be undone. Continue?";
    if (!window.confirm(warning)) return;
    clearDayState();
    setStatus({});
    saveCheckin(choice);
    setCheckin(loadCheckin());
    setAskingDifferent(false);
  };

  const backToNormal = () => {
    if (
      !window.confirm(
        "Switching back will clear today's history and progress — it can't be undone. Continue?",
      )
    )
      return;
    clearDayState();
    setStatus({});
    saveCheckin("normal");
    setCheckin(loadCheckin());
  };

  const confirmedCount = Object.values(status).filter((s) => s === "confirmed").length;
  const skippedCount = Object.values(status).filter((s) => s === "skipped").length;
  const openCount = Math.max(plan.length - confirmedCount - skippedCount, 0);
  const isPaused = checkin?.choice === "skip";
  const allDone = !isPaused && plan.length > 0 && openCount === 0;

  if (!profileReady) {
    return (
      <Shell>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Your Aai moment
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
            <span><b>{confirmedCount}</b> confirmed</span>
            <span><b>{skippedCount}</b> skipped</span>
            <span className="text-muted-foreground">{openCount} open</span>
          </div>
        </div>
      </div>

      {stale && (
        <div className="mb-4 rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 flex items-center justify-between gap-4 flex-wrap text-sm">
          <span>
            This plan is based on answers from {staleDays} {staleDays === 1 ? "day" : "days"}{" "}
            ago — still true?
          </span>
          <Link to="/" className="shrink-0 text-accent hover:underline">
            Refresh answers →
          </Link>
        </div>
      )}

      {!checkin ? (
        <CheckinPrompt
          askingDifferent={askingDifferent}
          onNormal={answerNormal}
          onAskDifferent={() => setAskingDifferent(true)}
          onSkip={() => answerDifferent("skip")}
          onSwap={() => answerDifferent("swap")}
          onCancel={() => setAskingDifferent(false)}
        />
      ) : checkin.choice !== "normal" ? (
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap text-sm text-muted-foreground">
          <span>
            {checkin.choice === "skip"
              ? "Today's plan is paused."
              : "Showing a lighter plan because today's different."}
          </span>
          <button onClick={backToNormal} className="text-accent hover:underline">
            Back to my normal plan
          </button>
        </div>
      ) : null}

      {isPaused ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Nothing to review today — enjoy the break.
        </div>
      ) : allDone ? (
        <div className="rounded-2xl border border-success/40 bg-success/5 p-8 text-center">
          <p className="serif text-3xl">All done for today 🎉</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Every item's been confirmed or skipped.
          </p>
        </div>
      ) : (
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
                  {it.sensitive && (
                    <div className="text-[11px] text-muted-foreground/70 mt-1 italic">
                      {SENSITIVE_DISCLAIMER}
                    </div>
                  )}
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
      )}

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

function CheckinPrompt({
  askingDifferent,
  onNormal,
  onAskDifferent,
  onSkip,
  onSwap,
  onCancel,
}: {
  askingDifferent: boolean;
  onNormal: () => void;
  onAskDifferent: () => void;
  onSkip: () => void;
  onSwap: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mb-4 rounded-2xl border bg-card p-4 text-sm">
      {!askingDifferent ? (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span>Still a normal day?</span>
          <div className="flex gap-2">
            <button
              onClick={onNormal}
              className="rounded-full px-3 py-1.5 bg-primary text-primary-foreground text-xs"
            >
              Yes
            </button>
            <button
              onClick={onAskDifferent}
              className="rounded-full px-3 py-1.5 border text-xs hover:border-foreground/30"
            >
              Something's different
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-muted-foreground">What should Aai do with today's plan?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onSkip}
              className="rounded-full px-3 py-1.5 border text-xs hover:border-foreground/30"
            >
              Skip today's plan
            </button>
            <button
              onClick={onSwap}
              className="rounded-full px-3 py-1.5 border text-xs hover:border-foreground/30"
            >
              Swap for a lighter plan
            </button>
            <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">
              Never mind
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
