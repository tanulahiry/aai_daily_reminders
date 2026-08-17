export type Theme = "focused" | "energized" | "grounded";

export type AaiProfile = {
  goals: string;
  automate: string;
  stage: string;
  theme: Theme;
};

export const defaultProfile: AaiProfile = {
  goals: "",
  automate: "",
  stage: "",
  theme: "focused",
};

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
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}
