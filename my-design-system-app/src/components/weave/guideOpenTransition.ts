"use client";

export type GuideOpenTransitionPayload = {
  animate?: boolean;
  backHref?: string;
  href: string;
  image: string;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  tag: string;
  timestamp: number;
  title: string;
};

const GUIDE_OPEN_TRANSITION_KEY = "weave-guide-open-transition";
const GUIDE_RETURN_TARGET_KEY = "weave-guide-return-target";
const GUIDE_OPEN_TRANSITION_MAX_AGE_MS = 12000;

export function storeGuideOpenTransition(payload: GuideOpenTransitionPayload) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(GUIDE_OPEN_TRANSITION_KEY, JSON.stringify(payload));
  if (payload.backHref) {
    window.sessionStorage.setItem(
      GUIDE_RETURN_TARGET_KEY,
      JSON.stringify({
        backHref: payload.backHref,
        href: payload.href,
      })
    );
  }
}

export function readGuideOpenTransition(expectedHref: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(GUIDE_OPEN_TRANSITION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const payload = JSON.parse(raw) as GuideOpenTransitionPayload;
    const isExpired = Date.now() - payload.timestamp > GUIDE_OPEN_TRANSITION_MAX_AGE_MS;
    if (payload.href !== expectedHref || isExpired || payload.animate === false) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function clearGuideOpenTransition() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(GUIDE_OPEN_TRANSITION_KEY);
}

export function readGuideReturnTarget(expectedHref: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(GUIDE_RETURN_TARGET_KEY);
  if (!raw) {
    return null;
  }

  try {
    const payload = JSON.parse(raw) as { backHref?: string; href: string };
    if (payload.href !== expectedHref || !payload.backHref) {
      return null;
    }
    return payload.backHref;
  } catch {
    return null;
  }
}

export function clearGuideReturnTarget() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(GUIDE_RETURN_TARGET_KEY);
}
