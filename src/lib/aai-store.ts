export type Theme = "focused" | "energized" | "grounded";

export type AaiProfile = {
  goals: string;
  automate: string;
  stage: string;
  theme: Theme;
  /** Epoch ms of the last time the user completed or touched onboarding. */
  lastCheckInAt?: number;
};

export const defaultProfile: AaiProfile = {
  goals: "",
  automate: "",
  stage: "",
  theme: "focused",
};

/** Days after which the Today screen flags the plan as possibly stale. */
export const STALE_AFTER_DAYS = 7;

const PROFILE_KEY = "aai:profile";

export function loadProfile(): AaiProfile {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile;
    const parsed = JSON.parse(raw);
    return { ...defaultProfile, ...parsed };
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: AaiProfile) {
  const withCheckIn: AaiProfile = { ...profile, lastCheckInAt: Date.now() };
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(withCheckIn));
  } catch {
    // ignore
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/** True once the user has actually answered the onboarding questions. */
export function hasProfile(profile: AaiProfile): boolean {
  return Boolean(profile.goals && profile.automate && profile.stage);
}

export function daysSince(timestampMs: number): number {
  return Math.floor((Date.now() - timestampMs) / (1000 * 60 * 60 * 24));
}

export function isPlanStale(
  profile: AaiProfile,
  staleAfterDays: number = STALE_AFTER_DAYS,
): boolean {
  if (!profile.lastCheckInAt) return false;
  return daysSince(profile.lastCheckInAt) > staleAfterDays;
}

// --- Today's item statuses (confirm / skip) ---

export type ItemStatus = "pending" | "confirmed" | "skipped";

const DAY_STATE_KEY = "aai:day-state";

export function loadDayState(): Record<string, ItemStatus> {
  try {
    const raw = window.localStorage.getItem(DAY_STATE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveDayState(state: Record<string, ItemStatus>) {
  try {
    window.localStorage.setItem(DAY_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/** Clears today's confirm/skip progress. Callers should confirm with the user first. */
export function clearDayState() {
  try {
    window.localStorage.removeItem(DAY_STATE_KEY);
  } catch {
    // ignore
  }
}

// --- Daily "still fits?" check-in ---

export type CheckinChoice = "normal" | "skip" | "swap";

export type DayCheckin = {
  date: string;
  choice: CheckinChoice;
};

const CHECKIN_KEY = "aai:checkin";

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns null if the user hasn't answered today's check-in yet. */
export function loadCheckin(): DayCheckin | null {
  try {
    const raw = window.localStorage.getItem(CHECKIN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DayCheckin;
    if (parsed.date !== todayKey()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCheckin(choice: CheckinChoice) {
  const checkin: DayCheckin = { date: todayKey(), choice };
  try {
    window.localStorage.setItem(CHECKIN_KEY, JSON.stringify(checkin));
  } catch {
    // ignore
  }
}
