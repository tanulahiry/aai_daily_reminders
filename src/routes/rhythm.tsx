import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { applyTheme, defaultProfile, loadProfile, type AaiProfile } from "@/lib/aai-store";

export const Route = createFileRoute("/rhythm")({
  component: Rhythm,
});

type Status = "pending" | "confirmed" | "skipped";

const LABELS: Record<string, string> = {
  morning: "Morning nudge",
  movement: "Movement",
  priorities: "Top 3 for today",
  relationship: "Reconnect",
  dinner: "Dinner",
};

function Rhythm() {
  const [profile, setProfile] = useState<AaiProfile>(defaultProfile);
  const [status, setStatus] = useState<Record<string, Status>>({});

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    applyTheme(p.theme);
    try {
      const raw = window.localStorage.getItem("aai:day-state");
      if (raw) setStatus(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const ids = Object.keys(LABELS);
  const handled = ids.length; // Aai handled all of them (surfaced)
  const confirmed = ids.filter((id) => status[id] === "confirmed");
  const skipped = ids.filter((id) => status[id] === "skipped");
  const open = ids.filter((id) => !status[id] || status[id] === "pending");

  const freed = handled - open.length;

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

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Bucket
          tone="accent"
          label="Aai handled"
          count={handled}
          items={ids.map((id) => LABELS[id])}
        />
        <Bucket
          tone="success"
          label="You confirmed"
          count={confirmed.length}
          items={confirmed.map((id) => LABELS[id])}
        />
        <Bucket
          tone="muted"
          label="You skipped"
          count={skipped.length}
          items={skipped.map((id) => LABELS[id])}
        />
      </div>

      <div className="mt-12 rounded-3xl border bg-card p-8 text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Today's readout
        </div>
        <p className="serif text-4xl md:text-5xl mt-3">
          You freed up <em className="text-accent not-italic">{freed}</em>{" "}
          {freed === 1 ? "decision" : "decisions"} today.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          That's energy back for the calls only you can make.
        </p>
      </div>

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
