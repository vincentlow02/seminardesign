"use client";

import type { WeaveLanguage } from "@/components/weave/weaveLanguage";

export const WEAVE_PARTNER_LOCATION_KEY = "weave-partner-location";
export const WEAVE_PARTNER_LOCATION_EVENT = "weave-partner-location-change";

const PARTNER_LOCATION_FALLBACK: Record<WeaveLanguage, string> = {
  EN: "Partner location appears here",
  JA: "相手の位置情報がここに表示されます",
  ZH: "这里显示对方的位置信息",
};

export function getPartnerLocationFallback(language: WeaveLanguage): string {
  return PARTNER_LOCATION_FALLBACK[language];
}

export function normalizePartnerLocation(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getStoredPartnerLocation(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return normalizePartnerLocation(window.localStorage.getItem(WEAVE_PARTNER_LOCATION_KEY));
}

export function setStoredPartnerLocation(location: string | null | undefined) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizePartnerLocation(location);

  if (normalized) {
    window.localStorage.setItem(WEAVE_PARTNER_LOCATION_KEY, normalized);
  } else {
    window.localStorage.removeItem(WEAVE_PARTNER_LOCATION_KEY);
  }

  window.dispatchEvent(new CustomEvent(WEAVE_PARTNER_LOCATION_EVENT, { detail: normalized }));
}
