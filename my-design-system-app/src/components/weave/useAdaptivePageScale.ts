"use client";

import { useEffect, useMemo, useState } from "react";

const BASE_WIDTH = 1600;
const BASE_HEIGHT = 1000;
const MIN_SCALE = 0.62;
const MAX_SCALE = 1.14;

function getAdaptiveScale() {
  if (typeof window === "undefined") {
    return 0.8;
  }

  const widthScale = window.innerWidth / BASE_WIDTH;
  const heightScale = window.innerHeight / BASE_HEIGHT;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(widthScale, heightScale)));
}

export function useAdaptivePageScale() {
  const [scale, setScale] = useState(getAdaptiveScale);

  useEffect(() => {
    const handleResize = () => setScale(getAdaptiveScale());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const wrapperStyle = useMemo(
    () => ({
      width: `${100 / scale}%`,
      height: `${100 / scale}%`,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    }),
    [scale]
  );

  return { scale, wrapperStyle };
}
