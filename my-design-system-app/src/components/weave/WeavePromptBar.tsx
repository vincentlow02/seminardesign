"use client";

import { useState } from "react";

function IconPaperclip() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M21.4 11.1 12 20.5a6 6 0 0 1-8.49-8.49l9.2-9.2a4 4 0 1 1 5.66 5.66l-9.9 9.9a2 2 0 0 1-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m20.5 16-4.5-4.5L7 20.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

function IconCaretDown() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowUp() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type PromptBarTheme = "light" | "night" | "evening" | "day";

type WeavePromptBarProps = {
  className?: string;
  compact?: boolean;
  inputClassName?: string;
  transitionActive?: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  theme?: PromptBarTheme;
  modelName?: string;
  showUtilityChips?: boolean;
  generateTravelMemoryLabel?: string;
  webSearchLabel?: string;
};

export function WeavePromptBar({
  className = "",
  compact = false,
  inputClassName = "",
  transitionActive = false,
  value,
  onChange,
  onSubmit,
  placeholder = "Where do you want to go?",
  theme = "light",
  modelName = "Weave",
  showUtilityChips = true,
  generateTravelMemoryLabel = "Generate travel memory",
  webSearchLabel = "Web search",
}: WeavePromptBarProps) {
  const [modelOpen, setModelOpen] = useState(false);

  const shellClassName =
    theme === "night"
      ? "shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
      : theme === "evening"
        ? "shadow-[0_8px_40px_rgba(0,0,0,0.15)]"
        : "shadow-[0_8px_40px_rgba(0,120,200,0.1)]";

  const sendButtonClassName =
    theme === "night"
      ? "bg-indigo-950 hover:bg-black"
      : theme === "evening"
        ? "bg-gray-900 hover:bg-black"
        : theme === "day"
          ? "bg-sky-600 hover:bg-sky-700"
          : "bg-gray-900 hover:bg-black";

  return (
    <div
      className={`relative z-40 w-full overflow-visible rounded-[24px] bg-white transition-all duration-[1200ms] ease-out ${shellClassName} ${
        transitionActive ? "translate-y-[-10px] scale-[0.988] shadow-[0_28px_90px_rgba(0,0,0,0.32)]" : "translate-y-0 scale-100"
      } ${className}`}
    >
      <div className={compact ? "px-4 pb-2 pt-3.5" : "px-6 pb-3 pt-5"}>
        <input
          className={`w-full border-none bg-transparent font-normal text-gray-800 outline-none placeholder:text-gray-500 transition-all duration-[1000ms] ease-out ${
            transitionActive ? "translate-y-[-16px] opacity-0 blur-[2px]" : "translate-y-0 opacity-100 blur-0"
          } ${compact ? "h-[38px] min-h-[38px] text-[13px]" : "h-[48px] min-h-[48px] text-[16px]"} ${inputClassName}`}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit();
            }
          }}
          placeholder={placeholder}
          type="text"
          value={value}
        />
      </div>

      <div className={`flex items-center justify-between ${compact ? "px-3 pb-2.5" : "px-4 pb-3"}`}>
        <div className={`flex items-center ${compact ? "gap-1.5" : "gap-2"}`}>
          <button className={`flex items-center gap-2 rounded-full border border-gray-100 text-gray-500 transition-colors hover:bg-gray-50 ${compact ? "h-[28px] px-2.5 text-[11px]" : "h-[32px] px-3 text-[13px]"}`} type="button">
            <IconPaperclip />
          </button>
          {showUtilityChips ? (
            <>
              <button className={`flex items-center gap-2 rounded-full border border-gray-100 text-gray-500 transition-colors hover:bg-gray-50 ${compact ? "h-[28px] px-2.5 text-[11px]" : "h-[32px] px-3 text-[13px]"}`} type="button">
                <IconImage />
                <span>{generateTravelMemoryLabel}</span>
              </button>
              <button className={`flex items-center gap-2 rounded-full border border-gray-100 text-gray-500 transition-colors hover:bg-gray-50 ${compact ? "h-[28px] px-2.5 text-[11px]" : "h-[32px] px-3 text-[13px]"}`} type="button">
                <IconGlobe />
                <span>{webSearchLabel}</span>
              </button>
            </>
          ) : null}
        </div>

        <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
          <div
            className={`relative flex cursor-pointer items-center gap-1 font-medium text-gray-500 hover:text-gray-800 ${compact ? "text-[12px]" : "text-[14px]"}`}
            onClick={() => setModelOpen((open) => !open)}
          >
            <span>{modelName}</span>
            <IconCaretDown />
            {modelOpen ? (
              <div className="absolute bottom-9 left-0 z-[70] min-w-[148px] rounded-xl border border-gray-100 bg-white py-2 shadow-[0_18px_36px_rgba(15,23,42,0.14)]">
                {[modelName, "Weave Pro", "Weave Mini"].map((model) => (
                  <div
                    key={model}
                    className="cursor-pointer px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50"
                    onClick={() => setModelOpen(false)}
                  >
                    {model}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <button
            className={`flex items-center justify-center rounded-full text-white transition-all duration-500 ${sendButtonClassName} ${
              transitionActive ? "scale-110 shadow-[0_0_26px_rgba(129,140,248,0.55)]" : "scale-100"
            } ${compact ? "h-[32px] w-[32px]" : "h-[36px] w-[36px]"}`}
            onClick={onSubmit}
            type="button"
          >
            <IconArrowUp />
          </button>
        </div>
      </div>
    </div>
  );
}
