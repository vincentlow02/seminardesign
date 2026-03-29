"use client";

export type WeaveLanguage = "EN" | "JA" | "ZH";

export const WEAVE_LANGUAGE_KEY = "weave-language";
export const WEAVE_LANGUAGE_EVENT = "weave-language-change";

export function getStoredWeaveLanguage(): WeaveLanguage {
  if (typeof window === "undefined") {
    return "EN";
  }

  const stored = window.localStorage.getItem(WEAVE_LANGUAGE_KEY);
  return stored === "JA" || stored === "ZH" ? stored : "EN";
}

export function setStoredWeaveLanguage(language: WeaveLanguage) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(WEAVE_LANGUAGE_KEY, language);
  window.dispatchEvent(new CustomEvent(WEAVE_LANGUAGE_EVENT, { detail: language }));
}
