import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import {
  applyTheme,
  defaultProfile,
  loadProfile,
  saveProfile,
  type Theme,
} from "@/lib/aai-store";

export const Route = createFileRoute("/")({
  component: Onboarding,
});

const goalOptions = ["Fitness", "Career growth", "Relationships", "Learning", "Mental clarity"];
const automateOptions = [
  "What to eat",
  "When to work out",
  "What to wear",
  "Daily priorities",
  "Who to reach out to",
];
const stageOptions = [
  "Building career",
  "Newlywed",
  "New parent",
  "Scaling up",
  "Reinventing",
];

const themes: { id: Theme; label: string; hint: string; swatch: string[] }[] = [
  { id: "focused", label: "Focused", hint: "Minimal, dark. For deep work.", swatch: ["#0b0d10", "#e6e7ea", "#7dd3fc"] },
  { id: "energized", label: "Energized", hint: "Bright, bold. For momentum.", swatch: ["#fef7ed", "#111827", "#f97316"] },
  { id: "grounded", label: "Grounded", hint: "Warm, calm. For balance.", swatch: ["#f6f1e7", "#2a1e17", "#b0552e"] },
];

function Onboarding() {
  const navigate = useNavigate();
  const [p, setP] = useState(defaultProfile);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const loaded = loadProfile();
    setP(loaded);
    applyTheme(loaded.theme);
  }, []);

  const update = <K extends keyof typeof p>(k: K, v: (typeof p)[K]) => {
    const next = { ...p, [k]: v };
    setP(next);
    saveProfile(next);
    if (k === "theme") applyTheme(v as Theme);
  };

  const canFinish = p.goals && p.automate && p.stage;

  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
        Setup · 3 questions
      </p>
      <h1 className="serif text-5xl md:text-6xl leading-[1.02] max-w-2xl">
        Tell Aai what you want to <em className="text-accent not-italic">stop deciding</em>.
      </h1>
      <p className="mt-5 text-muted-foreground max-w-xl">
        You're overloaded. Aai automates the low-stakes calls and hands you back
        the ones that actually matter. Answer three questions and get your rhythm.
      </p>

      <div className="mt-10 grid gap-5">
        <Question
          n={1}
          active={step === 0}
          title="What are your goals right now?"
          value={p.goals}
          options={goalOptions}
          onSelect={(v) => {
            update("goals", v);
            setStep(1);
          }}
        />
        <Question
          n={2}
          active={step === 1}
          title="What do you want to automate?"
          value={p.automate}
          options={automateOptions}
          onSelect={(v) => {
            update("automate", v);
            setStep(2);
          }}
        />
        <Question
          n={3}
          active={step === 2}
          title="What stage of life are you in?"
          value={p.stage}
          options={stageOptions}
          onSelect={(v) => {
            update("stage", v);
            setStep(3);
          }}
        />

        <div
          className={`rounded-2xl border bg-card p-6 transition ${
            step >= 3 ? "" : "opacity-60"
          }`}
        >
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Mode
            </span>
            <h3 className="serif text-2xl">Pick your rhythm's feel</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {themes.map((t) => {
              const selected = p.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => update("theme", t.id)}
                  className={`text-left rounded-xl border p-4 transition ${
                    selected
                      ? "border-accent ring-2 ring-accent/30 bg-accent/5"
                      : "hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {t.swatch.map((c) => (
                      <span
                        key={c}
                        className="h-4 w-4 rounded-full border border-border/50"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.hint}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            You can change these anytime.
          </span>
          <button
            disabled={!canFinish}
            onClick={() => navigate({ to: "/moment" })}
            className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm disabled:opacity-40"
          >
            Build my rhythm →
          </button>
        </div>
      </div>
    </Shell>
  );
}

function Question({
  n,
  active,
  title,
  value,
  options,
  onSelect,
}: {
  n: number;
  active: boolean;
  title: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-6 transition ${
        active ? "border-accent/60" : ""
      }`}
    >
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Q{n}
        </span>
        <h3 className="serif text-2xl">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = value === o;
          return (
            <button
              key={o}
              onClick={() => onSelect(o)}
              className={`text-sm rounded-full px-4 py-1.5 border transition ${
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
