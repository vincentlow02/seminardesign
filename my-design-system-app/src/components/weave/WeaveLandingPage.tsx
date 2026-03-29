"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  WEAVE_LANGUAGE_EVENT,
  WeaveLanguage,
  getStoredWeaveLanguage,
  setStoredWeaveLanguage,
} from "@/components/weave/weaveLanguage";

const weatherCodeLabels: Record<WeaveLanguage, Record<number, string>> = {
  EN: {
  0: "Clear",
  1: "Mostly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Icy Fog",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  56: "Freezing Drizzle",
  57: "Heavy Freezing Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  66: "Freezing Rain",
  67: "Heavy Freezing Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Rain Showers",
  81: "Heavy Showers",
  82: "Violent Showers",
  85: "Snow Showers",
  86: "Heavy Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm Hail",
  99: "Severe Thunderstorm",
  },
  JA: {
    0: "快晴",
    1: "ほぼ晴れ",
    2: "晴れ時々くもり",
    3: "くもり",
    45: "霧",
    48: "着氷性の霧",
    51: "弱い霧雨",
    53: "霧雨",
    55: "強い霧雨",
    56: "凍る霧雨",
    57: "強い凍る霧雨",
    61: "弱い雨",
    63: "雨",
    65: "強い雨",
    66: "凍る雨",
    67: "強い凍る雨",
    71: "弱い雪",
    73: "雪",
    75: "大雪",
    77: "雪粒",
    80: "にわか雨",
    81: "強いにわか雨",
    82: "激しいにわか雨",
    85: "にわか雪",
    86: "強いにわか雪",
    95: "雷雨",
    96: "ひょうを伴う雷雨",
    99: "激しい雷雨",
  },
  ZH: {
    0: "晴朗",
    1: "大致晴朗",
    2: "局部多云",
    3: "阴天",
    45: "有雾",
    48: "冻雾",
    51: "小毛毛雨",
    53: "毛毛雨",
    55: "强毛毛雨",
    56: "冻毛毛雨",
    57: "强冻毛毛雨",
    61: "小雨",
    63: "降雨",
    65: "大雨",
    66: "冻雨",
    67: "强冻雨",
    71: "小雪",
    73: "降雪",
    75: "大雪",
    77: "雪粒",
    80: "阵雨",
    81: "强阵雨",
    82: "暴雨",
    85: "阵雪",
    86: "强阵雪",
    95: "雷暴",
    96: "冰雹雷暴",
    99: "强雷暴",
  },
};

const LANDING_COPY: Record<
  WeaveLanguage,
  {
    location: string;
    scroll: string;
    element: string;
    journey: string;
    feeling: string;
    subtitle: string;
    quoteAttribution: string;
    quoteLine1: string;
    quoteLine2: string;
    quoteSubtext: string;
    enter: string;
    continue: string;
    currentConditionLoading: string;
    currentConditionUnavailable: string;
    currentConditionPrefix: string;
  }
> = {
  EN: {
    location: "Nido Beach, Philippines",
    scroll: "Scroll to explore",
    element: "Discover your element",
    journey: "The journey begins",
    feeling: "with a feeling",
    subtitle: "気分から、旅先に出会う",
    quoteAttribution: "Henry Miller",
    quoteLine1: "A destination is never a place,",
    quoteLine2: "but a new way of seeing.",
    quoteSubtext: "目的地というものは決して場所ではなく、物事の新しい見方である。",
    enter: "Enter",
    continue: "Click enter to continue",
    currentConditionLoading: "Current Condition: Loading",
    currentConditionUnavailable: "Current Condition: Unavailable",
    currentConditionPrefix: "Current Condition",
  },
  JA: {
    location: "ニドビーチ、フィリピン",
    scroll: "スクロールして探索",
    element: "旅の感覚を見つける",
    journey: "旅は",
    feeling: "気分から始まる",
    subtitle: "気分から、旅先に出会う",
    quoteAttribution: "ヘンリー・ミラー",
    quoteLine1: "目的地とは決して場所ではなく、",
    quoteLine2: "新しい見方そのものである。",
    quoteSubtext: "視点が変わることで、旅ははじまる。",
    enter: "入る",
    continue: "Enter を押して続ける",
    currentConditionLoading: "現在の天気: 読み込み中",
    currentConditionUnavailable: "現在の天気: 取得不可",
    currentConditionPrefix: "現在の天気",
  },
  ZH: {
    location: "菲律宾 Nido Beach",
    scroll: "滚动探索",
    element: "发现属于你的旅程气质",
    journey: "旅程始于",
    feeling: "一种感觉",
    subtitle: "从一种感觉，遇见下一段旅程",
    quoteAttribution: "亨利·米勒",
    quoteLine1: "目的地从来不是一个地点，",
    quoteLine2: "而是一种新的观看方式。",
    quoteSubtext: "当视角变化时，旅行也随之开始。",
    enter: "进入",
    continue: "点击 Enter 继续",
    currentConditionLoading: "当前天气: 加载中",
    currentConditionUnavailable: "当前天气: 无法获取",
    currentConditionPrefix: "当前天气",
  },
};

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 opacity-80"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function WeatherIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 opacity-70"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-white/80 transition-colors duration-300 group-hover:text-white md:h-6 md:w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-white/80 transition-colors duration-300 group-hover:text-white md:h-6 md:w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" x2="17" y1="9" y2="15" />
      <line x1="17" x2="23" y1="9" y2="15" />
    </svg>
  );
}

type SharedProps = {
  conditionLabel: string;
  footerVisible: boolean;
  headerVisible: boolean;
  language: WeaveLanguage;
  onLanguageChange: (language: WeaveLanguage) => void;
  onScrollNext?: () => void;
  soundOn: boolean;
  temperatureLabel: string;
  toggleSound: () => void;
};

function LanguageSwitcher({
  language,
  onLanguageChange,
}: Pick<SharedProps, "language" | "onLanguageChange">) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative pointer-events-auto">
      <button
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className="weave-glass-panel flex min-w-[62px] items-center justify-between gap-2 rounded-full px-3 py-2 text-[11px] font-medium tracking-[0.18em] transition-transform duration-300 hover:scale-105 md:text-xs"
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        <span>{language}</span>
        <svg aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        className={`absolute right-0 top-[calc(100%+10px)] w-[92px] rounded-[18px] border border-white/14 bg-black/28 p-1.5 text-white/88 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 ${
          menuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1.5 opacity-0"
        }`}
      >
        {(["EN", "JA", "ZH"] as const).map((option) => (
          <button
            key={option}
            className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left text-[11px] tracking-[0.18em] transition ${
              language === option ? "bg-white/12 text-white" : "text-white/72 hover:bg-white/8 hover:text-white"
            }`}
            onClick={() => {
              onLanguageChange(option);
              setMenuOpen(false);
            }}
            type="button"
          >
            <span>{option}</span>
            {language === option ? <span className="text-[9px] tracking-[0.16em] text-white/52">ON</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function SharedHeader({
  headerVisible,
  language,
  onLanguageChange,
}: Pick<SharedProps, "headerVisible" | "language" | "onLanguageChange">) {
  const copy = LANDING_COPY[language];

  return (
    <header
      className="flex w-full items-start justify-between px-6 py-6 transition-opacity duration-[2000ms] ease-out md:px-8 lg:px-10"
      style={{ opacity: headerVisible ? 1 : 0 }}
    >
      <div className="group flex cursor-pointer items-center">
        <h1
          className="text-lg font-normal tracking-[0.2em] md:text-xl"
          style={{ fontFamily: '"Futura PT", Futura, "Trebuchet MS", sans-serif', fontWeight: 400 }}
        >
          Weave
        </h1>
      </div>

      <div className="flex items-start gap-3">
        <div className="weave-glass-panel flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-light tracking-widest transition-transform duration-300 hover:scale-105 md:text-xs">
          <LocationIcon />
          <span>{copy.location}</span>
        </div>

        <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
      </div>
    </header>
  );
}

function SharedFooter({
  conditionLabel,
  footerVisible,
  language,
  onScrollNext,
  soundOn,
  temperatureLabel,
  toggleSound,
}: SharedProps) {
  const hasWeatherInfo = Boolean(temperatureLabel || conditionLabel);

  return (
    <footer
      className="relative flex w-full items-end justify-between px-6 py-6 transition-opacity duration-[2000ms] ease-out md:px-8 lg:px-10"
      style={{ opacity: footerVisible ? 1 : 0 }}
    >
      {hasWeatherInfo ? (
        <div className="flex flex-col gap-1.5 text-[10px] font-light tracking-[0.15em] text-white/70 md:text-[11px]">
          <span className="flex items-center gap-2">
            <WeatherIcon />
            {temperatureLabel}
          </span>
          <span className="opacity-70">{conditionLabel}</span>
        </div>
      ) : (
        <div className="h-10 w-10 md:h-12 md:w-12" />
      )}

      <button
        className="group absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-4"
        onClick={onScrollNext}
        type="button"
      >
        <span className="text-[9px] font-light uppercase tracking-[0.28em] text-white/50 transition-colors duration-300 group-hover:text-white md:text-[11px]">
          {LANDING_COPY[language].scroll}
        </span>
        <div className="relative h-12 w-px overflow-hidden bg-white/20">
          <div className="animate-weave-scroll-down absolute left-0 top-0 h-1/2 w-full bg-white" />
        </div>
      </button>

      <button
        aria-label="Toggle video sound"
        className="weave-glass-panel group z-30 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/10 md:h-12 md:w-12"
        onClick={toggleSound}
        type="button"
      >
        {soundOn ? <SoundOnIcon /> : <SoundOffIcon />}
      </button>
    </footer>
  );
}

function FirstScreen(
  props: SharedProps & {
    contentVisible: boolean;
    isActive: boolean;
    videoRef: React.RefObject<HTMLVideoElement | null>;
  }
) {
  const {
    conditionLabel,
    contentVisible,
    footerVisible,
    headerVisible,
    isActive,
    language,
    onLanguageChange,
    onScrollNext,
    soundOn,
    temperatureLabel,
    toggleSound,
    videoRef,
  } = props;

  return (
    <section className="relative h-screen snap-start overflow-hidden bg-gray-900 text-white">
      <div className="absolute inset-0 z-0 h-full w-full">
        <video
          aria-label="Background video"
          autoPlay
          className="h-full w-full object-cover object-center brightness-[0.84]"
          loop
          muted={!isActive || !soundOn}
          playsInline
          preload="metadata"
          ref={videoRef}
          src="/video-project-1.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/24 via-transparent to-black/34" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/15" />
        <div className="weave-noise-overlay absolute inset-0 opacity-[0.03]" />
      </div>

      <main className="relative z-10 flex h-full w-full flex-col justify-between">
        <SharedHeader headerVisible={headerVisible} language={language} onLanguageChange={onLanguageChange} />

        <section className="animate-weave-float flex flex-1 flex-col items-center justify-center px-4 text-center md:px-20">
          <div className="mb-5 overflow-hidden">
            <p
              className="text-[9px] font-light uppercase tracking-[0.28em] text-white/80 transition-all duration-[1500ms] ease-out md:text-[10px]"
              style={{
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible ? "translateY(0)" : "translateY(30px)",
              }}
            >
              {LANDING_COPY[language].element}
            </p>
          </div>

          <h2
            className="weave-text-shadow-lg mb-6 font-serif text-[2rem] leading-tight transition-all duration-[1500ms] ease-out md:text-[2.8rem] lg:text-[5rem]"
            style={{
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateY(0)" : "translateY(30px)",
              transitionDelay: "200ms",
            }}
          >
            {LANDING_COPY[language].journey} <br />
            <span className="font-light italic text-white/90">{LANDING_COPY[language].feeling}</span>
          </h2>

          <p
            className="relative weave-text-shadow-sm text-[11px] font-light tracking-[0.2em] text-transparent transition-all duration-[1500ms] ease-out md:text-[12px]"
            style={{
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateY(0)" : "translateY(30px)",
              transitionDelay: "400ms",
            }}
          >
            気分から、旅先に出会う
            <span className="pointer-events-none absolute inset-0 text-white/80">{LANDING_COPY[language].subtitle}</span>
          </p>
        </section>

        <SharedFooter
          conditionLabel={conditionLabel}
          footerVisible={footerVisible}
          headerVisible={headerVisible}
          language={language}
          onLanguageChange={onLanguageChange}
          onScrollNext={onScrollNext}
          soundOn={soundOn}
          temperatureLabel={temperatureLabel}
          toggleSound={toggleSound}
        />

      </main>
    </section>
  );
}

function SecondScreen(
  props: SharedProps & {
    isActive: boolean;
    shouldLoad: boolean;
    secondVideoRef: React.RefObject<HTMLVideoElement | null>;
    onScrollNext?: () => void;
  }
) {
  const {
    conditionLabel,
    footerVisible,
    headerVisible,
    isActive,
    language,
    onLanguageChange,
    onScrollNext,
    secondVideoRef,
    shouldLoad,
    soundOn,
    temperatureLabel,
    toggleSound,
  } = props;

  return (
    <section className="relative h-screen snap-start overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0 h-full w-full">
        <video
          aria-label="Second background video"
          className="h-full w-full object-cover object-center brightness-[0.84]"
          loop
          muted={!isActive || !soundOn}
          playsInline
          preload="none"
          ref={secondVideoRef}
          src={shouldLoad ? "/video-project-2.mp4" : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/24 via-transparent to-black/34" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/15" />
        <div className="weave-noise-overlay absolute inset-0 opacity-[0.03]" />
      </div>

      <main className="relative z-20 flex h-full w-full flex-col justify-between px-5 pt-5 md:px-8 md:pt-8 lg:px-10 lg:pt-10">
        <header
          className="flex w-full justify-end transition-opacity duration-[2000ms] ease-out"
          style={{ opacity: headerVisible ? 1 : 0 }}
        >
          <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
        </header>

        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-5 overflow-hidden md:mb-6">
            <p
              className="animate-weave-fade-in-up text-[10px] font-light uppercase tracking-[0.32em] text-white/70 md:text-xs"
              style={{ animationDelay: "0.6s" }}
            >
              {LANDING_COPY[language].quoteAttribution}
            </p>
          </div>

            <h2
              className="weave-text-shadow-xl animate-weave-fade-in-up mb-6 max-w-5xl font-serif text-[2.25rem] leading-[1.25] md:text-[3rem] lg:text-[3.75rem]"
              style={{ animationDelay: "0.8s" }}
            >
              {LANDING_COPY[language].quoteLine1}
              <br />
              <span className="font-light italic text-white/90">{LANDING_COPY[language].quoteLine2}</span>
            </h2>

            <p
              className="relative weave-text-shadow-md animate-weave-fade-in-up mb-10 max-w-4xl text-[12px] font-light leading-relaxed tracking-[0.14em] text-transparent md:text-sm lg:text-[15px]"
              style={{ animationDelay: "1s" }}
            >
            目的地というものは決して場所ではなく、
            <br className="md:hidden" />
            物事の新しい見方である。
            <span className="pointer-events-none absolute inset-0 text-white/80">{LANDING_COPY[language].quoteSubtext}</span>
          </p>
        </section>

        <SharedFooter
          footerVisible={footerVisible}
          language={language}
          onLanguageChange={onLanguageChange}
          onScrollNext={onScrollNext}
          soundOn={soundOn}
          conditionLabel=""
          headerVisible={headerVisible}
          temperatureLabel=""
          toggleSound={toggleSound}
        />

      </main>
    </section>
  );
}

function ThirdScreen({
  headerVisible,
  isActive,
  language,
  onLanguageChange,
  onEnter,
  shouldLoad,
  soundOn,
  toggleSound,
  thirdVideoRef,
}: Pick<SharedProps, "headerVisible" | "language" | "onLanguageChange" | "soundOn" | "toggleSound"> & {
  isActive: boolean;
  onEnter: () => void;
  shouldLoad: boolean;
  thirdVideoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const [enterHovered, setEnterHovered] = useState(false);

  return (
    <section className="relative h-screen snap-start overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0 h-full w-full">
        <video
          aria-label="Third background video"
          className="h-full w-full object-cover object-center brightness-[0.8]"
          loop
          muted={!isActive || !soundOn}
          playsInline
          preload="none"
          ref={thirdVideoRef}
          src={shouldLoad ? "/Video Project3.mp4" : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/28 via-transparent to-black/38" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/17 via-transparent to-black/17" />
        <div className="weave-noise-overlay absolute inset-0 opacity-[0.03]" />
      </div>

      <main className="relative z-20 flex h-full w-full flex-col justify-between p-6 md:p-10">
        <header
          className="flex w-full items-start justify-between animate-weave-fade-in"
          style={{ opacity: headerVisible ? 1 : 0, animationDelay: "0.2s" }}
        >
          <div className="group flex cursor-pointer items-center">
            <span
              className="text-xs font-normal tracking-[0.22em] weave-text-shadow-md md:text-sm"
              style={{ fontFamily: '"Futura PT", Futura, "Trebuchet MS", sans-serif', fontWeight: 400 }}
            >
              Weave
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex cursor-pointer items-center gap-2 text-[11px] font-light tracking-[0.08em] text-white/90 transition-colors duration-300 md:text-xs">
              <LocationIcon />
              <span className="weave-text-shadow-md">{LANDING_COPY[language].location}</span>
            </div>
            <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1
            className="weave-text-shadow-hero animate-weave-fade-in-up mb-12 font-normal leading-none opacity-0"
            style={{
              animationDelay: "0.8s",
              fontSize: "clamp(4rem, 9.6vw, 11.2rem)",
              letterSpacing: "-0.02em",
              fontFamily: '"Futura PT", Futura, "Trebuchet MS", sans-serif',
              fontWeight: 400,
            }}
          >
            Weave
          </h1>

          <button
            aria-label="Enter site"
            className="weave-enter-button animate-weave-fade-in-up flex h-24 w-24 items-center justify-center rounded-full opacity-0 md:h-[6.4rem] md:w-[6.4rem]"
            onMouseEnter={() => setEnterHovered(true)}
            onMouseLeave={() => setEnterHovered(false)}
            onClick={onEnter}
            type="button"
          >
            <span
              className="text-[13px] font-light uppercase transition-all duration-300 md:text-[15px]"
              style={{ letterSpacing: enterHovered ? "0.25em" : "0.2em" }}
            >
              {LANDING_COPY[language].enter}
            </span>
          </button>
        </div>

        <footer
          className="relative flex w-full items-end justify-between animate-weave-fade-in"
          style={{ opacity: headerVisible ? 1 : 0, animationDelay: "1.4s" }}
        >
          <div className="hidden h-10 w-10 md:block" />

          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-center md:bottom-4">
            <p className="animate-weave-pulse-slow text-[10px] font-light uppercase tracking-[0.3em] text-white/60 md:text-xs">
              {LANDING_COPY[language].continue}
            </p>
          </div>

          <button
            aria-label="Toggle video sound"
            className="group z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 backdrop-blur-[12px] transition-all duration-300 hover:scale-105 md:h-12 md:w-12"
            onClick={toggleSound}
            type="button"
          >
            {soundOn ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
        </footer>
      </main>
    </section>
  );
}

export function WeaveLandingPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const secondVideoRef = useRef<HTMLVideoElement | null>(null);
  const thirdVideoRef = useRef<HTMLVideoElement | null>(null);
  const secondScreenRef = useRef<HTMLElement | null>(null);
  const thirdScreenRef = useRef<HTMLElement | null>(null);
  const [activeScreen, setActiveScreen] = useState<1 | 2 | 3>(1);
  const [soundOn, setSoundOn] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [language, setLanguage] = useState<WeaveLanguage>("EN");
  const [temperatureLabel, setTemperatureLabel] = useState("--°C / --°F");
  const [conditionLabel, setConditionLabel] = useState(LANDING_COPY.EN.currentConditionLoading);
  const [loadedScreens, setLoadedScreens] = useState<Record<1 | 2 | 3, boolean>>({
    1: true,
    2: false,
    3: false,
  });

  useEffect(() => {
    const headerTimer = window.setTimeout(() => setHeaderVisible(true), 200);
    const contentTimer = window.setTimeout(() => setContentVisible(true), 500);
    const footerTimer = window.setTimeout(() => setFooterVisible(true), 1300);

    containerRef.current?.scrollTo({ top: 0, behavior: "auto" });

    return () => {
      window.clearTimeout(headerTimer);
      window.clearTimeout(contentTimer);
      window.clearTimeout(footerTimer);
    };
  }, [language]);

  useEffect(() => {
    setLanguage(getStoredWeaveLanguage());
    const handleLanguageChange = (event: Event) => {
      setLanguage(((event as CustomEvent<WeaveLanguage>).detail as WeaveLanguage) ?? getStoredWeaveLanguage());
    };
    window.addEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange);
    return () => window.removeEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange);
  }, []);

  useEffect(() => {
    router.prefetch("/home");
  }, [router]);

  useEffect(() => {
    setLoadedScreens((current) => {
      if (current[activeScreen]) {
        return current;
      }

      return {
        ...current,
        [activeScreen]: true,
      };
    });
  }, [activeScreen]);

  useEffect(() => {
    const players = [
      { ref: videoRef, screen: 1 as const },
      { ref: secondVideoRef, screen: 2 as const },
      { ref: thirdVideoRef, screen: 3 as const },
    ];

    for (const { ref, screen } of players) {
      const video = ref.current;

      if (!video) {
        continue;
      }

      const shouldPlay = activeScreen === screen;
      video.muted = !shouldPlay || !soundOn;

      if (shouldPlay) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [activeScreen, soundOn]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      const screenHeight = container.clientHeight;
      const maxScroll = Math.max(container.scrollHeight - container.clientHeight, 1);
      const nextScreen = Math.min(
        3,
        Math.max(1, Math.round(container.scrollTop / Math.max(screenHeight, 1)) + 1)
      ) as 1 | 2 | 3;
      setActiveScreen(nextScreen);
      setScrollProgress(container.scrollTop / maxScroll);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async (latitude: number, longitude: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`
        );
        const weatherData = await response.json();

        if (cancelled) {
          return;
        }

        const celsius = Math.round(weatherData?.current?.temperature_2m ?? 0);
        const fahrenheit = Math.round((celsius * 9) / 5 + 32);
        const weatherCode = weatherData?.current?.weather_code;
        const weatherText = weatherCodeLabels[language][weatherCode] ?? weatherCodeLabels.EN[weatherCode] ?? "Unknown";

        setTemperatureLabel(`${celsius}°C / ${fahrenheit}°F`);
        setConditionLabel(`${LANDING_COPY[language].currentConditionPrefix}: ${weatherText}`);
      } catch {
        if (!cancelled) {
          setTemperatureLabel("--°C / --°F");
          setConditionLabel(LANDING_COPY[language].currentConditionUnavailable);
        }
      }
    };

    if (!navigator.geolocation) {
      setTemperatureLabel("--°C / --°F");
      setConditionLabel(LANDING_COPY[language].currentConditionUnavailable);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        void loadWeather(coords.latitude, coords.longitude);
      },
      () => {
        setTemperatureLabel("--°C / --°F");
        setConditionLabel(LANDING_COPY[language].currentConditionUnavailable);
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="h-screen snap-y snap-mandatory overflow-y-auto overflow-x-hidden bg-black"
      ref={containerRef}
    >
      <div className="pointer-events-none fixed right-8 top-1/2 z-40 hidden h-32 w-px -translate-y-1/2 overflow-hidden bg-white/10 lg:block">
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/88 via-white/58 to-white/18 transition-[height] duration-300 ease-out"
          style={{ height: `${Math.max(6, scrollProgress * 100)}%` }}
        />
      </div>
      <FirstScreen
        conditionLabel={conditionLabel}
        contentVisible={contentVisible}
        footerVisible={footerVisible}
        headerVisible={headerVisible}
        isActive={activeScreen === 1}
        language={language}
        onLanguageChange={(nextLanguage) => setStoredWeaveLanguage(nextLanguage)}
        onScrollNext={() => secondScreenRef.current?.scrollIntoView({ behavior: "smooth" })}
        soundOn={soundOn}
        temperatureLabel={temperatureLabel}
        toggleSound={() => setSoundOn((value) => !value)}
        videoRef={videoRef}
      />
      <div ref={secondScreenRef as React.RefObject<HTMLDivElement>}>
        <SecondScreen
          conditionLabel={conditionLabel}
          footerVisible={footerVisible}
          headerVisible={headerVisible}
          isActive={activeScreen === 2}
          language={language}
          onLanguageChange={(nextLanguage) => setStoredWeaveLanguage(nextLanguage)}
          onScrollNext={() => thirdScreenRef.current?.scrollIntoView({ behavior: "smooth" })}
          secondVideoRef={secondVideoRef}
          shouldLoad={loadedScreens[2]}
          soundOn={soundOn}
          temperatureLabel={temperatureLabel}
          toggleSound={() => setSoundOn((value) => !value)}
        />
      </div>
      <div ref={thirdScreenRef as React.RefObject<HTMLDivElement>}>
        <ThirdScreen
          headerVisible={headerVisible}
          isActive={activeScreen === 3}
          language={language}
          onLanguageChange={(nextLanguage) => setStoredWeaveLanguage(nextLanguage)}
          soundOn={soundOn}
          shouldLoad={loadedScreens[3]}
          thirdVideoRef={thirdVideoRef}
          toggleSound={() => setSoundOn((value) => !value)}
          onEnter={() => router.push("/home")}
        />
      </div>
    </div>
  );
}
