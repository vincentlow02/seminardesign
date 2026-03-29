"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WeaveAiDynamicBackground } from "@/components/weave/WeaveAiDynamicBackground";
import { storeGuideOpenTransition } from "@/components/weave/guideOpenTransition";
import {
  WEAVE_PARTNER_LOCATION_EVENT,
  getPartnerLocationFallback,
  getStoredPartnerLocation,
  normalizePartnerLocation,
  setStoredPartnerLocation,
} from "@/components/weave/partnerLocation";
import { WeavePromptBar } from "@/components/weave/WeavePromptBar";
import { useAdaptivePageScale } from "@/components/weave/useAdaptivePageScale";
import { SidebarChatItem, addSearchSidebarChat, getHomeSidebarChats, removeHomeSidebarChat } from "@/components/weave/sidebarChats";
import {
  WEAVE_LANGUAGE_EVENT,
  WeaveLanguage,
  getStoredWeaveLanguage,
  setStoredWeaveLanguage,
} from "@/components/weave/weaveLanguage";

const discoverImageOtaruCanal = "/discover/otaru-canal.jpg";
const discoverImageSlopeStreet = "/discover/slope-street.jpg";
const discoverImageStationPlatform = "/discover/station-platform.jpg";
const discoverImageFerrisWheel = "/discover/ferris-wheel.jpg";

const HOME_COPY: Record<
  WeaveLanguage,
  {
    sidebar: { saved: string; home: string; discover: string; chats: string };
    header: { location: string; intro: string };
    chips: string[];
    saved: {
      title: string;
      subtitle: string;
      filter: string;
      recent: string;
      open: string;
      trips: Array<{ tag: string; title: string; description: string; time: string }>;
    };
    discover: {
      title: string;
      body: string;
      tags: string;
    };
  }
> = {
  EN: {
    sidebar: { saved: "Saved", home: "Home", discover: "Discover", chats: "Chats" },
    header: {
      location: getPartnerLocationFallback("EN"),
      intro: "Let your next journey begin here",
    },
    chips: ["Cultural Experiences", "International Travel", "Domestic Travel", "Natural Spots", "Backpacking"],
    saved: {
      title: "Saved Trips",
      subtitle: "4 AI-generated itineraries",
      filter: "Filter",
      recent: "Recent",
      open: "Open",
      trips: [
        {
          tag: "Winter",
          title: "Sapporo & Otaru Winter Guide",
          description: "A complete 5-day itinerary covering the snow festival, seafood markets, and scenic canals.",
          time: "18:44",
        },
        {
          tag: "Winter",
          title: "Finland Winter Atmosphere Guide",
          description: "A curated route through Lapland light, Helsinki markets, and quieter Nordic winter moments.",
          time: "Yesterday",
        },
        {
          tag: "Foodie",
          title: "Tokyo Culinary Adventure",
          description: "From hidden ramen spots to high-end omakase in Shinjuku and Shibuya.",
          time: "Oct 12",
        },
        {
          tag: "Nature",
          title: "Swiss Alps Scenic Route",
          description: "Breathtaking train journeys and mountain lodging via the Glacier Express.",
          time: "Sep 28",
        },
      ],
    },
    discover: {
      title: "DAY 1 A winter journey begins in snowy Otaru",
      body:
        "The first day of the Hokkaido trip began in Otaru. The moment I stepped into the snow-covered station, the feeling of finally arriving took over. I wandered through the nostalgic streets, then drifted toward the waterfront. Under the pale winter sky, the ferris wheel standing quietly by the sea felt almost dreamlike. The day ended, as it had to, at the Otaru Canal. The historic warehouses and long icicles shaping the winter scene made the whole evening feel calm and beautiful. It was the ideal start to the trip, and it made the days ahead feel even more promising.",
      tags: "#Hokkaido #Otaru #JapanTravel #SnowCountry #FerrisWheelView #OtaruCanal #TravelJournal",
    },
  },
  JA: {
    sidebar: { saved: "保存", home: "ホーム", discover: "発見", chats: "チャット" },
    header: {
      location: getPartnerLocationFallback("JA"),
      intro: "次の旅はここから始まる",
    },
    chips: ["文化体験", "海外旅行", "国内旅行", "自然スポット", "バックパッキング"],
    saved: {
      title: "保存した旅",
      subtitle: "AI生成の旅程 4 件",
      filter: "絞り込み",
      recent: "最新順",
      open: "開く",
      trips: [
        {
          tag: "冬",
          title: "札幌・小樽 冬ガイド",
          description: "雪まつり、海鮮市場、運河の風景を巡る5日間の旅程。",
          time: "18:44",
        },
        {
          tag: "冬",
          title: "フィンランド 冬の空気ガイド",
          description: "ラップランドの光、ヘルシンキの市場、静かな北欧の冬を辿る旅。",
          time: "昨日",
        },
        {
          tag: "美食",
          title: "東京グルメアドベンチャー",
          description: "新宿と渋谷で隠れたラーメン店から高級おまかせまで巡る旅。",
          time: "10月12日",
        },
        {
          tag: "自然",
          title: "スイスアルプス絶景ルート",
          description: "グレッシャー・エクスプレスで巡る山岳列車と滞在体験。",
          time: "9月28日",
        },
      ],
    },
    discover: {
      title: "DAY 1 雪の小樽から始まる冬の旅",
      body:
        "北海道の旅の初日は小樽から始まった。雪に包まれた駅へ降り立った瞬間、ようやく辿り着いたという実感が静かに広がった。懐かしい街並みを歩き、やがて海辺へ向かう。淡い冬空の下、静かに海辺に立つ観覧車はどこか夢のようだった。旅の終わりは、やはり小樽運河。歴史ある倉庫群と長く伸びるつららが冬の景色を形づくり、その夜を穏やかで美しいものにしていた。これから始まる数日間を、さらに楽しみにさせてくれる理想的な一日だった。",
      tags: "#北海道 #小樽 #日本旅行 #雪国 #観覧車 #小樽運河 #旅日記",
    },
  },
  ZH: {
    sidebar: { saved: "收藏", home: "主页", discover: "发现", chats: "聊天" },
    header: {
      location: getPartnerLocationFallback("ZH"),
      intro: "让你的下一段旅程从这里开始",
    },
    chips: ["文化体验", "国际旅行", "国内旅行", "自然景点", "背包旅行"],
    saved: {
      title: "已保存的旅程",
      subtitle: "4 条 AI 生成行程",
      filter: "筛选",
      recent: "最近",
      open: "打开",
      trips: [
        {
          tag: "冬季",
          title: "札幌与小樽冬日指南",
          description: "覆盖雪祭、海鲜市场与运河风景的完整五日行程。",
          time: "18:44",
        },
        {
          tag: "冬季",
          title: "芬兰冬日氛围指南",
          description: "围绕拉普兰光线、赫尔辛基市集与北欧静冬展开的旅程。",
          time: "昨天",
        },
        {
          tag: "美食",
          title: "东京美食冒险",
          description: "从隐藏拉面小店到高端 omakase，穿行新宿与涩谷。",
          time: "10月12日",
        },
        {
          tag: "自然",
          title: "瑞士阿尔卑斯风景路线",
          description: "搭乘冰川列车，体验壮丽山景与高山住宿。",
          time: "9月28日",
        },
      ],
    },
    discover: {
      title: "DAY 1 从雪中的小樽开启冬日旅程",
      body:
        "北海道之旅的第一天从小樽开始。踏入被白雪覆盖的车站时，终于抵达的感觉一下子涌了上来。我穿过带着怀旧气息的街道，慢慢走向海边。在苍白的冬日天空下，静静伫立在海边的摩天轮带着一种近乎梦境般的氛围。一天的结尾自然落在小樽运河。历史悠久的仓库与垂落的长冰柱塑造出冬季景色，也让整个傍晚显得安静而美丽。这是旅程最理想的开场，也让之后的每一天都更值得期待。",
      tags: "#北海道 #小樽 #日本旅行 #雪国 #摩天轮 #小樽运河 #旅行日记",
    },
  },
};

function formatNow(date: Date) {
  const day = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
  }).format(date);

  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return { day, time };
}

function SidebarIcon({
  active,
  children,
  label,
}: {
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="group flex flex-col items-center gap-1.5">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
          active
            ? "border border-white/12 bg-white/[0.06] text-white shadow-[0_8px_20px_-14px_rgba(0,0,0,0.22)] backdrop-blur-md"
            : "text-white/60 group-hover:bg-white/[0.045] group-hover:text-white/88"
        }`}
      >
        {children}
      </div>
      <span
        className={`text-[10px] tracking-wide ${
          active
            ? "font-semibold text-white/88"
            : "font-medium text-white/48 group-hover:text-white/76"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function IconChevronLeft() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlus({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg aria-hidden="true" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 3.8l2.6 5.26 5.8.84-4.2 4.08.98 5.76L12 17l-5.18 2.74.98-5.76-4.2-4.08 5.8-.84L12 3.8z" strokeLinejoin="round" />
    </svg>
  );
}

function IconCompass() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" strokeLinejoin="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg aria-hidden="true" className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 1.8v2.4M12 19.8v2.4M4.22 4.22l1.7 1.7M18.08 18.08l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.22 19.78l1.7-1.7M18.08 5.92l1.7-1.7" strokeLinecap="round" />
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

function IconArrowLeft() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEdit({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="m15.232 5.232 3.536 3.536m-2.036-5.036a2.5 2.5 0 1 1 3.536 3.536L6.5 21.036H3v-3.572L16.732 3.732Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function IconUndo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M3 10h10a5 5 0 0 1 5 5v2m-12-7-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function IconRedo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M21 10H11a5 5 0 0 0-5 5v2m12-7 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function IconInfo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
      <path d="M12 16v-4m0-4h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function IconTrash({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 7h16M9 7V4.8c0-.44.36-.8.8-.8h4.4c.44 0 .8.36.8.8V7M7.2 7l.72 10.14c.03.39.35.7.74.7h6.68c.39 0 .71-.31.74-.7L16.8 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11.2v4.6M14 11.2v4.6" strokeLinecap="round" />
    </svg>
  );
}

function IconCloseCircle({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M7 7l10 10M17 7 7 17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThemeFloatingControls({
  theme,
  onClose,
}: {
  theme: "native" | "premium" | "bento" | "minimalist" | "editorial";
  onClose: () => void;
}) {
  const buttonClassName =
    theme === "native"
      ? "border border-white/10 bg-black/20 text-white/70 hover:bg-white/10 hover:text-white"
      : theme === "premium"
        ? "border border-slate-200 bg-white/80 text-slate-500 hover:bg-white hover:text-slate-800"
        : theme === "bento"
          ? "border border-zinc-700 bg-zinc-900/90 text-zinc-300 hover:border-zinc-500 hover:text-white"
          : theme === "minimalist"
            ? "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            : "border border-[#dcd7cd] bg-[#fcfaf7] text-[#8c8273] hover:text-[#2d2a26]";

  return (
    <div className="absolute left-0 top-[-56px] z-[60] flex items-center gap-4">
      <button
        aria-label="Profile info"
        className={`flex h-10 w-10 items-center justify-center rounded-full transition ${buttonClassName}`}
        type="button"
      >
        <IconInfo />
      </button>
      <button
        aria-label="Close profile panel"
        className={`flex h-10 w-10 items-center justify-center rounded-full transition ${buttonClassName}`}
        onClick={onClose}
        type="button"
      >
        <IconChevronRight />
      </button>
    </div>
  );
}

function MobileBottomNav({
  activeNav,
  labels,
  onDiscover,
  onHome,
  onProfile,
  onSaved,
}: {
  activeNav: "home" | "saved" | "discover";
  labels: { saved: string; home: string; discover: string };
  onDiscover: () => void;
  onHome: () => void;
  onProfile: () => void;
  onSaved: () => void;
}) {
  const itemClassName = "flex min-w-0 flex-1 flex-col items-center gap-1.5";

  return (
    <nav className="pointer-events-auto fixed inset-x-0 bottom-7 z-40 flex justify-center px-6 md:hidden">
      <div className="flex w-full max-w-[376px] items-center rounded-[32px] border border-white/18 bg-[linear-gradient(180deg,rgba(102,132,164,0.26)_0%,rgba(75,102,132,0.18)_100%)] px-4 py-3 text-white/72 backdrop-blur-2xl shadow-[0_22px_50px_-28px_rgba(7,15,26,0.5)]">
        <button className={itemClassName} onClick={onHome} type="button">
          <SidebarIcon active={activeNav === "home"} label={labels.home}>
            <IconSearch />
          </SidebarIcon>
        </button>
        <button className={itemClassName} onClick={onSaved} type="button">
          <SidebarIcon active={activeNav === "saved"} label={labels.saved}>
            <IconStar />
          </SidebarIcon>
        </button>
        <button className={itemClassName} onClick={onDiscover} type="button">
          <SidebarIcon active={activeNav === "discover"} label={labels.discover}>
            <IconCompass />
          </SidebarIcon>
        </button>
        <button className={itemClassName} onClick={onProfile} type="button">
          <SidebarIcon label="Profile">
            <IconUser />
          </SidebarIcon>
        </button>
      </div>
    </nav>
  );
}

function GPTIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.073zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.0343-1.178a.0804.0804 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L8.8071 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813v6.7227zM10.8402 8.4484l1.159-.6718 1.159.6718v1.3435l-1.159.6718-1.159-.6718V8.4484z" />
    </svg>
  );
}

function GeminiIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <img alt="" aria-hidden="true" className={className} src="/icons/google-gemini.svg" />;
}

function ClaudeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <img alt="" aria-hidden="true" className={className} src="/icons/claude-color.svg" />;
}

const journeyWords = ["Stillness", "Passage", "Blue hour", "Harbor light", "Arrival", "Wander gently"];

function ExperienceRadar({
  accentClassName = "text-blue-400",
  gridStroke = "rgba(255,255,255,0.1)",
  labelFill = "rgba(255,255,255,0.6)",
  labelFontSize = 7.5,
}: {
  accentClassName?: string;
  gridStroke?: string;
  labelFill?: string;
  labelFontSize?: number;
}) {
  return (
    <svg viewBox="-25 -25 150 150" className={`h-full w-full ${accentClassName}`}>
      <polygon points="50,5 95,38 78,95 22,95 5,38" fill="none" stroke={gridStroke} strokeWidth="1" />
      <polygon points="50,25 75,43 65,75 35,75 25,43" fill="none" stroke={gridStroke} strokeWidth="1" />
      <line x1="50" y1="50" x2="50" y2="5" stroke={gridStroke} strokeWidth="1" />
      <line x1="50" y1="50" x2="95" y2="38" stroke={gridStroke} strokeWidth="1" />
      <line x1="50" y1="50" x2="78" y2="95" stroke={gridStroke} strokeWidth="1" />
      <line x1="50" y1="50" x2="22" y2="95" stroke={gridStroke} strokeWidth="1" />
      <line x1="50" y1="50" x2="5" y2="38" stroke={gridStroke} strokeWidth="1" />
      <polygon points="50,15 85,45 60,80 30,70 15,38" className="fill-current stroke-current" fillOpacity="0.2" strokeWidth="2" />
      <text x="50" y="-4" fontSize={labelFontSize} fontWeight="500" textAnchor="middle" fill={labelFill}>Adventure</text>
      <text x="100" y="42" fontSize={labelFontSize} fontWeight="500" textAnchor="start" fill={labelFill}>Culture</text>
      <text x="75" y="108" fontSize={labelFontSize} fontWeight="500" textAnchor="middle" fill={labelFill}>Social</text>
      <text x="25" y="108" fontSize={labelFontSize} fontWeight="500" textAnchor="middle" fill={labelFill}>Relaxation</text>
      <text x="0" y="42" fontSize={labelFontSize} fontWeight="500" textAnchor="end" fill={labelFill}>Food</text>
    </svg>
  );
}

function ChipVisual({ kind }: { kind: string }) {
  if (kind === "users") {
    return (
      <svg className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M16 21a4 4 0 0 0-8 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21a4 4 0 0 0-5-3.87M17 11a4 4 0 1 0 0-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "globe") {
    return <IconGlobe />;
  }

  if (kind === "train") {
    return (
      <svg className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="5" y="3.5" width="14" height="13" rx="3" />
        <path d="M8 16.5 6 20M16 16.5 18 20M8.5 20h7M8 8h8M9 12h1M14 12h1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "tree") {
    return (
      <svg className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 20V11M8 20h8M6 11h12L12 4 6 11Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M6.5 20h11A1.5 1.5 0 0 0 19 18.5v-9A1.5 1.5 0 0 0 17.5 8h-11A1.5 1.5 0 0 0 5 9.5v9A1.5 1.5 0 0 0 6.5 20Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type SavedTrip = {
  alt: string;
  description: string;
  href?: string;
  id: number;
  image: string;
  tag: string;
  time: string;
  title: string;
};

const savedTrips: SavedTrip[] = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1200&q=80",
      alt: "Sapporo snowy city view",
      href: "/home/guides/sapporo-otaru-winter-guide",
      tag: "Winter",
      title: "Sapporo & Otaru Winter Guide",
      description: "A complete 5-day itinerary covering the snow festival, seafood markets, and scenic canals.",
      time: "18:44",
  },
  {
    id: 2,
    image: "/saved/finland-card.jpg",
    alt: "Finland winter scene",
    href: "/home/guides/finland-winter-atmosphere-guide",
    tag: "Winter",
    title: "Finland Winter Atmosphere Guide",
    description: "A curated route through Lapland light, Helsinki markets, and quieter Nordic winter moments.",
    time: "Yesterday",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    alt: "Tokyo neon street",
    tag: "Foodie",
    title: "Tokyo Culinary Adventure",
    description: "From hidden ramen spots to high-end omakase in Shinjuku and Shibuya.",
    time: "Oct 12",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
    alt: "Swiss Alps mountains",
    tag: "Nature",
    title: "Swiss Alps Scenic Route",
    description: "Breathtaking train journeys and mountain lodging via the Glacier Express.",
    time: "Sep 28",
  },
];

const chatItems = {
  home: [] as string[],
  saved: ["Sapporo winter guide", "Kyoto temple notes", "Swiss Alps scenic route"],
  discover: ["Hidden island escapes", "Quiet city weekends", "Mountain rail journeys"],
} as const;

function SavedTripCard({
  trip,
  faded,
  onOpen,
  opening,
  openLabel,
}: {
  trip: SavedTrip;
  faded?: boolean;
  onOpen: (trip: SavedTrip, rect: DOMRect) => void;
  opening?: boolean;
  openLabel: string;
}) {
  const cardRef = useRef<HTMLElement | null>(null);

  return (
    <article
      ref={cardRef}
      className={`group flex h-[360px] flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] transition-all duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)] ${
        faded ? "scale-[0.985] opacity-0 blur-[6px]" : opening ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
        <img
          alt={trip.alt}
          className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.05]"
          src={trip.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      <div className="relative flex flex-1 flex-col bg-white p-6">
        <div className="absolute -top-4 left-5 rounded-full border border-slate-100 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
          {trip.tag}
        </div>

        <h3 className="mt-2 text-[18px] font-semibold leading-[1.3] text-slate-900 transition-colors group-hover:text-slate-700">
          {trip.title}
        </h3>
        <p className="mt-2 text-sm text-slate-500">{trip.description}</p>

          <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
            <div className="text-[13px] font-medium text-slate-400">{trip.time}</div>
            {trip.href ? (
              <button
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[13px] font-semibold text-slate-700 transition-all duration-300 group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white"
                onClick={() => {
                  if (!cardRef.current) {
                    return;
                  }
                  onOpen(trip, cardRef.current.getBoundingClientRect());
                }}
                type="button"
              >
                {openLabel}
              </button>
            ) : (
              <button
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[13px] font-semibold text-slate-700 transition-all duration-300 group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white"
                type="button"
              >
                {openLabel}
              </button>
            )}
          </div>
        </div>
      </article>
  );
}

export function SavedTripsView() {
  const router = useRouter();
  const [language, setLanguage] = useState<WeaveLanguage>("EN");
  const copy = HOME_COPY[language];

  useEffect(() => {
    setLanguage(getStoredWeaveLanguage());
    const handleLanguageChange = (event: Event) => {
      setLanguage(((event as CustomEvent<WeaveLanguage>).detail as WeaveLanguage) ?? getStoredWeaveLanguage());
    };
    window.addEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange);
    return () => window.removeEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange);
  }, []);

  const handleTripOpen = (trip: SavedTrip, rect: DOMRect) => {
    if (!trip.href) {
      return;
    }

    storeGuideOpenTransition({
      animate: false,
      backHref: "/home?saved=1",
      href: trip.href,
      image: trip.image,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
      tag: trip.tag,
      timestamp: Date.now(),
      title: trip.title,
    });
    router.push(trip.href);
  };

  return (
    <section className="relative h-full flex-1 overflow-y-auto bg-[#f8f9fa] text-slate-900">
      <div
        className="pointer-events-none absolute right-0 top-0 h-[600px] w-[800px] rounded-full opacity-50 blur-3xl"
        style={{
          background: "linear-gradient(to bottom left, rgba(226,232,240,0.4), transparent)",
          transform: "translate(33%, -33%)",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1600px] p-10 md:p-14 lg:p-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-slate-900 md:text-[40px]">
              {copy.saved.title}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 md:text-base">
              {copy.saved.subtitle}
            </p>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <button
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              type="button"
            >
              {copy.saved.filter}
            </button>
            <button
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              type="button"
            >
              {copy.saved.recent}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2 xl:grid-cols-4">
          {savedTrips.map((trip, index) => (
            <SavedTripCard
              key={trip.id}
              openLabel={copy.saved.open}
              onOpen={handleTripOpen}
              trip={{
                ...trip,
                ...copy.saved.trips[index],
              }}
            />
          ))}
        </div>

        <div className="h-20" />
      </div>
    </section>
  );
}

export function DiscoverJournalView() {
  const [language, setLanguage] = useState<WeaveLanguage>("EN");
  const copy = HOME_COPY[language];

  useEffect(() => {
    setLanguage(getStoredWeaveLanguage());
    const handleLanguageChange = (event: Event) => {
      setLanguage(((event as CustomEvent<WeaveLanguage>).detail as WeaveLanguage) ?? getStoredWeaveLanguage());
    };
    window.addEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange);
    return () => window.removeEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange);
  }, []);

  return (
    <section className="relative h-full flex-1 overflow-y-auto bg-[#f8f9fa] text-slate-900">
      <div className="mx-auto flex min-h-full max-w-[1760px] items-start justify-center px-4 pb-32 pt-5 sm:px-6 md:px-10 md:pb-20 md:pt-10">
        <article className="w-full max-w-[1552px] rounded-[28px] bg-white shadow-[0_18px_42px_-24px_rgba(15,23,42,0.14)] md:rounded-[7px] md:shadow-[0_16px_22.1px_6px_rgba(0,0,0,0.06)]">
          <div className="hidden items-end gap-[27px] px-[28px] pt-[32px] md:flex">
            <div className="h-[253px] w-[379px] overflow-hidden">
              <img alt="Otaru canal in winter" className="h-full w-full object-cover" src={discoverImageOtaruCanal} />
            </div>
            <div className="h-[254px] w-[381px] overflow-hidden">
              <img alt="Street descending toward Otaru port" className="h-full w-full object-cover" src={discoverImageSlopeStreet} />
            </div>
            <div className="h-[253px] w-[381px] overflow-hidden">
              <img alt="Snowy station platform in Hokkaido" className="h-full w-full object-cover" src={discoverImageStationPlatform} />
            </div>
            <div className="h-[253px] w-[302px] overflow-hidden">
              <img alt="Ferris wheel in a snowy Otaru landscape" className="h-full w-full object-cover" src={discoverImageFerrisWheel} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 px-3 pt-3 sm:gap-3 sm:px-5 sm:pt-5 md:hidden">
            <div className="overflow-hidden rounded-[18px] bg-[#edf2f7] shadow-[0_12px_24px_-18px_rgba(15,23,42,0.2)]">
              <img alt="Otaru Canal" className="aspect-[0.92/1] h-full w-full object-cover" src={discoverImageOtaruCanal} />
            </div>
            <div className="overflow-hidden rounded-[18px] bg-[#edf2f7] shadow-[0_12px_24px_-18px_rgba(15,23,42,0.2)]">
              <img alt="Snowy Street" className="aspect-[0.92/1] h-full w-full object-cover" src={discoverImageSlopeStreet} />
            </div>
            <div className="overflow-hidden rounded-[18px] bg-[#edf2f7] shadow-[0_12px_24px_-18px_rgba(15,23,42,0.2)]">
              <img alt="Train Station" className="aspect-[0.92/1] h-full w-full object-cover" src={discoverImageStationPlatform} />
            </div>
            <div className="overflow-hidden rounded-[18px] bg-[#edf2f7] shadow-[0_12px_24px_-18px_rgba(15,23,42,0.2)]">
              <img alt="Ferris Wheel" className="aspect-[0.92/1] h-full w-full object-cover" src={discoverImageFerrisWheel} />
            </div>
          </div>

          <div className="hidden items-end justify-between gap-[156px] px-[46px] pb-[42px] pt-[18px] tracking-[0.02em] md:flex">
            <div className="w-[783px]">
              <h2 className="mb-[18px] text-[24px] font-medium text-black">
                {copy.discover.title}
              </h2>
              <p className="text-[13px] leading-[1.53] text-[#585858]">
                {copy.discover.body}
              </p>
            </div>

            <div className="w-[848px] pb-[6px] text-right text-[14px] font-medium text-[#404040]">
              {copy.discover.tags}
            </div>
          </div>

          <div className="px-5 pb-7 pt-6 tracking-[0.01em] md:hidden">
            <h2 className="max-w-[12ch] text-[20px] font-semibold leading-[1.28] text-[#171717] sm:text-[24px]">
              {copy.discover.title}
            </h2>
            <p className="mt-5 text-[16px] leading-[1.9] text-[#505866]">
              {copy.discover.body}
            </p>
            <div className="mt-6 flex justify-end">
              <p className="max-w-[13.5rem] text-right text-[14px] font-medium leading-[1.7] text-[#4a5565]">
                {copy.discover.tags}
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function ExpandedSidebar({
  activeNav,
  homeChats,
  onChatSelect,
  onChatDelete,
  expanded,
  labels,
}: {
  activeNav: "home" | "saved" | "discover";
  homeChats: SidebarChatItem[];
  onChatSelect: (chat: SidebarChatItem) => void;
  onChatDelete: (chat: SidebarChatItem) => void;
  expanded: boolean;
  labels: (typeof HOME_COPY)["EN"]["sidebar"];
}) {
  const titleMap = {
    home: labels.home,
    saved: labels.saved,
    discover: labels.discover,
  } as const;

  return (
    <div
      className={`relative z-20 h-full flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-out ${
        expanded ? "w-64" : "w-0"
      }`}
    >
      <aside
        className={`flex h-full w-64 flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(34,38,46,0.48)_0%,rgba(26,30,38,0.40)_100%)] text-white backdrop-blur-xl transition-opacity duration-200 ease-out ${
            expanded
              ? "opacity-100 shadow-[10px_0_32px_-20px_rgba(0,0,0,0.16)]"
              : "opacity-0 shadow-none pointer-events-none"
          }`}
      >
        <div
          className={`flex items-center justify-between border-b px-6 pb-4 pt-6 transition-colors duration-200 ${
            expanded ? "border-white/8" : "border-transparent"
          }`}
        >
          <h2
            className={`text-lg font-semibold text-white/90 transition-opacity duration-200 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            {titleMap[activeNav]}
          </h2>
          <button
            className={`text-white/48 transition-opacity duration-200 hover:text-white/82 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
            type="button"
          >
            <IconSearch />
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto p-4 transition-opacity duration-200 ${
            expanded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/34">{labels.chats}</div>
          <div className="space-y-1">
              {(activeNav === "home"
                ? homeChats.map((chat) => chat.label)
                : chatItems[activeNav]
              ).map((item, index) => {
                const chat = homeChats.find((entry) => entry.label === item);
                return (
                  <div
                    key={`${activeNav}-${item}-${index}`}
                    className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                      index === 0
                        ? "border border-white/10 bg-white/[0.08] text-white shadow-[0_8px_24px_-18px_rgba(0,0,0,0.4)]"
                        : "text-white/56 hover:bg-white/[0.05] hover:text-white/88"
                    }`}
                  >
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={activeNav === "home" && chat ? () => onChatSelect(chat) : undefined}
                      type="button"
                    >
                      <span className={`block truncate ${index === 0 ? "font-medium" : ""}`}>{item}</span>
                    </button>
                    {activeNav === "home" && chat ? (
                      <button
                        aria-label={`Delete ${item}`}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                          index === 0
                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                            : "text-white/28 opacity-0 group-hover:opacity-100 hover:bg-white/[0.08] hover:text-red-300"
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onChatDelete(chat);
                        }}
                        type="button"
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
        </div>
      </aside>
    </div>
  );
}

function ProfileExperienceOverlay({
  onClose,
  archiveCopy,
}: {
  onClose: () => void;
  archiveCopy: {
    didVerified: string;
    role: string;
    city: string;
    travelPreferences: string;
    experientialArchive: string;
    statistics: string;
    virtualExperiences: string;
    actualTrips: string;
    explored: string;
    aiInstructions: string;
    aiAccount: string;
    linked: string;
    linkedAi: string;
  };
}) {
  const [profileTheme, setProfileTheme] = useState<"native" | "premium" | "bento" | "minimalist" | "editorial">("native");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [revealStage, setRevealStage] = useState(0);
  const themeOptions = [
    { key: "native", label: "Weave Native" },
    { key: "premium", label: "Premium Glass" },
    { key: "bento", label: "Bento Grid" },
    { key: "minimalist", label: "Minimalist" },
    { key: "editorial", label: "Editorial" },
  ] as const;
  const activeThemeLabel = themeOptions.find((theme) => theme.key === profileTheme)?.label ?? "Themes";

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setRevealStage(1), 30),
      window.setTimeout(() => setRevealStage(2), 160),
      window.setTimeout(() => setRevealStage(3), 300),
      window.setTimeout(() => setRevealStage(4), 470),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex items-start justify-center overflow-y-auto px-4 py-6 md:items-center md:px-8 md:py-10">
      <div
        className={`absolute inset-0 transition-opacity duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          revealStage >= 1 ? "opacity-100" : "opacity-0"
        } ${
          profileTheme === "native"
            ? "bg-[linear-gradient(180deg,rgba(9,11,19,0.22),rgba(9,11,19,0.34)),radial-gradient(ellipse_at_top_right,rgba(50,28,104,0.16),transparent_48%)]"
            : profileTheme === "premium"
              ? "bg-[linear-gradient(180deg,rgba(70,78,96,0.08),rgba(50,58,74,0.14)),radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%)]"
              : profileTheme === "bento"
                ? "bg-[linear-gradient(180deg,rgba(9,9,11,0.24),rgba(9,9,11,0.34))]"
                : profileTheme === "minimalist"
                  ? "bg-[linear-gradient(180deg,rgba(28,28,30,0.08),rgba(28,28,30,0.14))]"
                  : "bg-[linear-gradient(180deg,rgba(45,42,38,0.10),rgba(45,42,38,0.18))]"
        }`}
      />
      <div
        className={`absolute inset-0 backdrop-blur-[10px] transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          revealStage >= 1 ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute right-4 top-4 z-50 items-start gap-3 transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:right-8 md:top-8 ${
          revealStage >= 2 ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        } ${profileTheme === "native" ? "hidden md:flex" : "flex"}`}
      >
        <div className="relative">
          <button
            aria-expanded={themeMenuOpen}
            aria-haspopup="menu"
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-medium tracking-[0.16em] uppercase shadow-[0_12px_28px_-18px_rgba(0,0,0,0.45)] backdrop-blur-xl transition ${
              profileTheme === "native"
                ? "border-white/10 bg-black/20 text-white/75 hover:bg-white/10 hover:text-white"
                : profileTheme === "premium"
                  ? "border-slate-200 bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900"
                  : profileTheme === "bento"
                    ? "border-zinc-700 bg-zinc-900/90 text-zinc-300 hover:border-zinc-500 hover:text-white"
                    : profileTheme === "minimalist"
                      ? "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      : "border-[#dcd7cd] bg-[#fcfaf7] text-[#8c8273] hover:text-[#2d2a26]"
            }`}
            onClick={() => setThemeMenuOpen((open) => !open)}
            type="button"
          >
            <span>{activeThemeLabel}</span>
            <svg aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${themeMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            className={`absolute right-0 top-[calc(100%+10px)] w-52 origin-top-right rounded-[20px] border p-2 shadow-[0_22px_48px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 ${
              themeMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1.5 opacity-0"
            } ${
              profileTheme === "native"
                ? "border-white/10 bg-[#121528]/88"
                : profileTheme === "premium"
                  ? "border-slate-200 bg-white/88"
                  : profileTheme === "bento"
                    ? "border-zinc-700 bg-zinc-950/92"
                    : profileTheme === "minimalist"
                      ? "border-gray-200 bg-white/96"
                      : "border-[#dcd7cd] bg-[#fcfaf7]/95"
            }`}
          >
            <div className="flex flex-col gap-1">
              {themeOptions.map((theme) => (
                <button
                  key={theme.key}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left text-[12px] transition ${
                    profileTheme === theme.key
                      ? profileTheme === "native"
                        ? "bg-white/10 text-white"
                        : profileTheme === "premium"
                          ? "bg-slate-100 text-slate-900"
                          : profileTheme === "bento"
                            ? "bg-zinc-800 text-white"
                            : profileTheme === "minimalist"
                              ? "bg-gray-100 text-gray-900"
                              : "bg-[#ece9e4] text-[#2d2a26]"
                      : profileTheme === "native"
                        ? "text-white/65 hover:bg-white/5 hover:text-white"
                        : profileTheme === "premium"
                          ? "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          : profileTheme === "bento"
                            ? "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            : profileTheme === "minimalist"
                              ? "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                              : "text-[#8c8273] hover:bg-[#f5f0e8] hover:text-[#2d2a26]"
                  }`}
                  onClick={() => {
                    setProfileTheme(theme.key);
                    setThemeMenuOpen(false);
                  }}
                  type="button"
                >
                  <span>{theme.label}</span>
                  {profileTheme === theme.key ? <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">Active</span> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
          <button
            aria-label="Close profile panel"
            className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_12px_28px_-18px_rgba(0,0,0,0.28)] backdrop-blur-xl transition ${
              profileTheme === "native"
                ? "border-white/14 bg-black/22 text-white/78 hover:bg-white/10 hover:text-white"
                : profileTheme === "premium"
                  ? "border-slate-200/80 bg-white/72 text-slate-600 hover:bg-white hover:text-slate-900"
                  : profileTheme === "bento"
                    ? "border-zinc-700 bg-zinc-900/72 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    : profileTheme === "minimalist"
                      ? "border-gray-200 bg-white/80 text-gray-600 hover:bg-white hover:text-black"
                      : "border-[#dcd7cd] bg-[#fcfaf7]/88 text-[#8c8273] hover:bg-[#fcfaf7] hover:text-[#2d2a26]"
            }`}
            onClick={onClose}
            type="button"
          >
            <IconCloseCircle />
          </button>
      </div>
        <div
          className={`transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            revealStage >= 1 ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.985] opacity-0"
          } ${profileTheme === "native" ? "hidden md:block" : "hidden md:block"}`}
        >
          <ThemeFloatingControls onClose={onClose} theme={profileTheme} />
        </div>
        {profileTheme === "native" ? (
          <>
            <div className={`relative z-10 hidden h-[520px] w-[760px] overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(33,28,58,0.88),rgba(23,19,41,0.94))] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:flex ${
              revealStage >= 1 ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.97] opacity-0"
            }`}>
              <div className={`flex w-[280px] flex-col items-center justify-center bg-black/20 p-8 transition-all duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealStage >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
                <div className="group relative mb-6 cursor-pointer">
                  <div className="absolute inset-0 rounded-full bg-blue-500 blur-xl opacity-20 transition-opacity group-hover:opacity-40" />
                  <img
                    alt="Alex28"
                    className="relative h-32 w-32 rounded-full border-2 border-white/20 object-cover shadow-xl"
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop"
                  />
                </div>
                <h2 className="mb-1 text-2xl font-semibold text-white">Alex28</h2>
                <div className="mb-4 flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1">
                  <svg className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-blue-300">{archiveCopy.didVerified}</span>
                </div>
                <p className="mb-1 text-sm font-medium text-white/60">{archiveCopy.role}</p>
                <p className="mb-8 text-sm text-white/40">{archiveCopy.city}</p>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2 transition-colors hover:border-white/10 hover:bg-white/5" type="button">
                  <span className="text-sm font-medium text-white/80">{archiveCopy.travelPreferences}</span>
                  <IconEdit className="h-4 w-4 text-white/40" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-6 p-8">
                <div className={`transition-all duration-[640ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealStage >= 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white/90">{archiveCopy.experientialArchive}</h3>
                    <span className="text-xs font-medium uppercase tracking-wider text-white/40">{archiveCopy.statistics}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="relative h-32 w-32 flex-shrink-0">
                      <ExperienceRadar />
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <span className="flex-1 text-sm text-white/60">{archiveCopy.virtualExperiences}</span>
                        <span className="text-sm font-medium text-white">188</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                        <span className="flex-1 text-sm text-white/60">{archiveCopy.actualTrips}</span>
                        <span className="text-sm font-medium text-white">35</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="flex-1 text-sm text-white/60">{archiveCopy.explored}</span>
                        <span className="text-right text-sm font-medium leading-tight text-white">
                          4 Continents
                          <br />
                          <span className="text-xs text-white/50">15 Countries</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="my-1 h-px w-full bg-white/10" />

                <div className={`transition-all duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealStage >= 4 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
                  <div className="mb-3">
                    <h3 className="text-[13px] font-medium uppercase tracking-wider text-white/80">{archiveCopy.aiInstructions}</h3>
                  </div>
                  <div className="relative h-20 w-full rounded-xl border border-white/10 bg-black/30 p-3 transition-colors hover:border-white/20">
                    <div className="absolute bottom-2 right-2 flex gap-1.5">
                      <button className="rounded-full bg-white/5 p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white" type="button">
                        <IconUndo className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded-full bg-white/5 p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white" type="button">
                        <IconRedo className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded-full bg-white/5 p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white" type="button">
                        <IconEdit className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`transition-all duration-[740ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealStage >= 4 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-medium uppercase tracking-wider text-white/80">{archiveCopy.aiAccount}</h3>
                      <span className="text-[10px] font-medium tracking-wide text-emerald-400">{archiveCopy.linked}</span>
                    </div>
                    <button className="text-white/40 transition hover:text-white" type="button">
                      <IconEdit className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex cursor-pointer flex-col items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10">
                        <GPTIcon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] text-white/60">GPT-15</span>
                    </div>
                    <div className="flex cursor-pointer flex-col items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-blue-400 transition-colors hover:bg-white/10">
                        <GeminiIcon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] text-white/60">Gemini 10 Pro</span>
                    </div>
                    <div className="flex cursor-pointer flex-col items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10">
                        <ClaudeIcon className="h-5 w-5 text-[#d97757]" />
                      </div>
                      <span className="text-[10px] text-white/60">Claude</span>
                    </div>
                    <div className="ml-2 flex cursor-pointer flex-col items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-white/10 bg-white/5 text-white/40 transition-colors hover:bg-white/10">
                        <IconPlus className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] text-transparent">Add</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`relative z-10 w-full max-w-[332px] overflow-hidden rounded-[34px] border border-white/12 bg-[linear-gradient(180deg,rgba(34,36,86,0.96)_0%,rgba(27,22,56,0.96)_16%,rgba(23,18,47,0.98)_100%)] shadow-[0_30px_70px_-18px_rgba(0,0,0,0.58)] transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
            revealStage >= 1 ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.97] opacity-0"
          }`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(92,110,255,0.16),transparent_65%)]" />
            <div className="relative max-h-[calc(100vh-48px)] overflow-y-auto md:max-h-none">
              <div className="flex items-center justify-between px-4 pb-4 pt-4 md:hidden">
                <button
                  aria-expanded={themeMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/88 backdrop-blur-xl transition hover:bg-white/14"
                  onClick={() => setThemeMenuOpen((open) => !open)}
                  type="button"
                >
                  <span>{activeThemeLabel}</span>
                  <svg aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${themeMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  aria-label="Close profile panel"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white/78 backdrop-blur-xl transition hover:bg-white/14 hover:text-white"
                  onClick={onClose}
                  type="button"
                >
                  <IconCloseCircle />
                </button>
                <div
                  className={`absolute left-4 top-[calc(100%+6px)] z-20 w-52 origin-top-left rounded-[20px] border border-white/10 bg-[#121528]/92 p-2 shadow-[0_22px_48px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 ${
                    themeMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1.5 opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    {themeOptions.map((theme) => (
                      <button
                        key={theme.key}
                        className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left text-[12px] transition ${
                          profileTheme === theme.key ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                        }`}
                        onClick={() => {
                          setProfileTheme(theme.key);
                          setThemeMenuOpen(false);
                        }}
                        type="button"
                      >
                        <span>{theme.label}</span>
                        {profileTheme === theme.key ? <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">Active</span> : null}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:flex md:h-[520px]">
                <div className={`border-b border-white/8 px-5 pb-5 pt-7 md:flex md:w-[280px] md:flex-col md:items-center md:justify-center md:border-b-0 md:border-r md:border-white/8 md:bg-black/20 md:p-8 ${
                  revealStage >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                } transition-all duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)]`}>
                  <div className="group relative mx-auto mb-5 h-[86px] w-[86px] cursor-pointer md:mb-6 md:h-32 md:w-32">
                    <div className="absolute inset-[-6px] rounded-full bg-[radial-gradient(circle,rgba(92,149,255,0.48)_0%,rgba(92,149,255,0.18)_48%,transparent_72%)] blur-md" />
                    <img
                      alt="Alex28"
                      className="relative h-full w-full rounded-full border-[3px] border-[#9fb9ff]/45 object-cover shadow-[0_18px_38px_-18px_rgba(32,74,255,0.7)]"
                      src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop"
                    />
                  </div>
                  <h2 className="mb-2 text-center text-[20px] font-semibold tracking-tight text-white md:mb-1 md:text-2xl">Alex28</h2>
                  <div className="mx-auto mb-4 flex w-fit items-center gap-1.5 rounded-full border border-[#4f7fff]/35 bg-[#2555ff]/14 px-3 py-1 shadow-[0_0_22px_rgba(65,117,255,0.28)]">
                    <svg className="h-3 w-3 text-[#6aa0ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#92b4ff]">{archiveCopy.didVerified}</span>
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium text-white/72">{archiveCopy.role}</p>
                    <p className="text-sm text-white/48">{archiveCopy.city}</p>
                  </div>
                  <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2 text-left transition-colors hover:border-white/10 hover:bg-white/5 md:mt-8" type="button">
                    <span className="text-sm font-medium text-white/76">{archiveCopy.travelPreferences}</span>
                    <IconEdit className="h-4 w-4 text-white/40" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col gap-5 px-4 pb-5 pt-4 md:gap-6 md:p-8">
                  <div className={`transition-all duration-[640ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    revealStage >= 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-medium text-white/92">{archiveCopy.experientialArchive}</h3>
                      <span className="text-xs font-medium text-white/42">{archiveCopy.statistics}</span>
                    </div>
                    <div className="rounded-[26px] border border-white/6 bg-white/[0.02] px-4 py-5 md:bg-transparent md:px-0 md:py-0">
                      <div className="mx-auto mb-6 h-[180px] w-[180px] md:h-40 md:w-40">
                        <ExperienceRadar
                          accentClassName="text-[#4f8cff]"
                          gridStroke="rgba(125,147,255,0.18)"
                          labelFill="rgba(214,223,255,0.82)"
                          labelFontSize={8.8}
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 rounded-full bg-[#4f8cff] shadow-[0_0_10px_rgba(79,140,255,0.9)]" />
                          <span className="flex-1 text-sm text-white/66">{archiveCopy.virtualExperiences}</span>
                          <span className="text-sm font-semibold text-white">188</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 rounded-full bg-[#b26dff] shadow-[0_0_10px_rgba(178,109,255,0.9)]" />
                          <span className="flex-1 text-sm text-white/66">{archiveCopy.actualTrips}</span>
                          <span className="text-sm font-semibold text-white">35</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-2 h-2 w-2 rounded-full bg-[#3df2b6] shadow-[0_0_10px_rgba(61,242,182,0.9)]" />
                          <span className="flex-1 text-sm text-white/66">{archiveCopy.explored}</span>
                          <span className="text-right text-sm font-semibold leading-tight text-white">
                            4 Continents
                            <br />
                            <span className="font-medium text-white/54">15 Countries</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-white/8" />

                  <div className={`transition-all duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    revealStage >= 4 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}>
                    <div className="mb-3">
                      <h3 className="text-[13px] font-medium uppercase tracking-wider text-white/82">{archiveCopy.aiInstructions}</h3>
                    </div>
                    <div className="relative h-24 w-full rounded-[18px] border border-white/10 bg-[#090d17] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/18">
                      <div className="absolute bottom-3 right-3 flex gap-1.5">
                        <button className="rounded-full bg-white/5 p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white" type="button">
                          <IconUndo className="h-3.5 w-3.5" />
                        </button>
                        <button className="rounded-full bg-white/5 p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white" type="button">
                          <IconRedo className="h-3.5 w-3.5" />
                        </button>
                        <button className="rounded-full bg-white/5 p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white" type="button">
                          <IconEdit className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={`transition-all duration-[740ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    revealStage >= 4 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-[13px] font-medium uppercase tracking-wider text-white/82">{archiveCopy.aiAccount}</h3>
                      <button className="text-white/40 transition hover:text-white" type="button">
                        <IconEdit className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <div className="flex min-w-[92px] flex-col items-center gap-2 rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
                          <GPTIcon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] text-white/62">GPT-15</span>
                        <span className="rounded-full bg-emerald-400/14 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300">Connected</span>
                      </div>
                      <div className="flex min-w-[112px] flex-col items-center gap-2 rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-blue-400">
                          <GeminiIcon className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] text-white/62">Gemini 10 Pro</span>
                        <span className="rounded-full bg-emerald-400/14 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300">Connected</span>
                      </div>
                      <div className="flex min-w-[92px] flex-col items-center gap-2 rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
                          <ClaudeIcon className="h-5 w-5 text-[#d97757]" />
                        </div>
                        <span className="text-[10px] text-white/62">Claude</span>
                        <span className="rounded-full bg-emerald-400/14 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300">Connected</span>
                      </div>
                      <div className="flex min-w-[74px] flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-white/12 bg-white/[0.02] px-3 py-3 text-white/42 transition-colors hover:bg-white/[0.05]">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-white/12 bg-white/[0.04]">
                          <IconPlus className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] text-white/40">Add</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </>
        ) : profileTheme === "premium" ? (
        <>
        <div className={`relative z-10 hidden h-[520px] w-[760px] overflow-hidden rounded-[32px] border border-white bg-[rgba(248,249,252,0.94)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:flex ${revealStage >= 1 ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.97] opacity-0"}`}>
          <div className={`flex w-[280px] flex-col items-center justify-center bg-slate-50/60 p-8 transition-all duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealStage >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
          <img
            alt="Alex28"
            className="mb-6 h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop"
          />
          <h2 className="mb-2 text-2xl font-semibold text-slate-800">Alex28</h2>
          <span className="mb-4 rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-indigo-600">
            {archiveCopy.didVerified}
          </span>
          <p className="mb-1 text-sm font-medium text-slate-600">{archiveCopy.role}</p>
          <p className="mb-8 text-sm text-slate-400">{archiveCopy.city}</p>
          <button className="flex items-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-slate-500 transition-colors hover:border-slate-200 hover:text-slate-800" type="button">
            <span className="text-sm font-medium">{archiveCopy.travelPreferences}</span>
            <IconEdit className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 bg-white/50 p-8">
          <div className={`transition-all duration-[640ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealStage >= 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-lg font-semibold text-slate-800">{archiveCopy.experientialArchive}</h3>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{archiveCopy.statistics}</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="relative h-32 w-32 flex-shrink-0">
                <ExperienceRadar accentClassName="text-indigo-500" gridStroke="#e2e8f0" labelFill="#64748b" />
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
                  <span className="text-sm text-slate-500">{archiveCopy.virtualExperiences}</span>
                  <span className="text-sm font-semibold text-slate-800">188</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
                  <span className="text-sm text-slate-500">{archiveCopy.actualTrips}</span>
                  <span className="text-sm font-semibold text-slate-800">35</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
                  <span className="text-sm text-slate-500">{archiveCopy.explored}</span>
                  <span className="text-sm font-semibold text-slate-800">4 Continents, 15 Countries</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealStage >= 4 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-slate-700">{archiveCopy.aiInstructions}</h3>
            </div>
            <div className="relative h-20 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-inner">
              <div className="absolute bottom-2 right-2 flex gap-1.5 rounded-lg border border-slate-100 bg-slate-50 p-1">
                <button className="rounded p-1 text-slate-400 transition hover:bg-white hover:text-slate-700" type="button">
                  <IconUndo className="h-4 w-4" />
                </button>
                <button className="rounded p-1 text-slate-400 transition hover:bg-white hover:text-slate-700" type="button">
                  <IconRedo className="h-4 w-4" />
                </button>
                <button className="rounded p-1 text-slate-400 transition hover:bg-white hover:text-slate-700" type="button">
                  <IconEdit className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-[740ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealStage >= 4 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                {archiveCopy.aiAccount} <span className="ml-1 font-medium text-indigo-500">{archiveCopy.linked}</span>
              </h3>
              <button className="text-slate-400 transition hover:text-slate-600" type="button">
                <IconEdit className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-sm">
                  <GPTIcon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-slate-500">GPT-15</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-blue-500 shadow-sm">
                  <GeminiIcon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-medium text-slate-500">Gemini 10 Pro</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-sm">
                  <ClaudeIcon className="h-5 w-5 text-[#d97757]" />
                </div>
                <span className="text-[10px] font-medium text-slate-500">Claude</span>
              </div>
              <div className="ml-2 flex flex-col items-center gap-1.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-slate-300 bg-transparent text-slate-400 transition hover:border-slate-400 hover:text-slate-600">
                  <IconPlus className="h-4 w-4" />
                </div>
                <span className="text-[10px] text-transparent">Add</span>
              </div>
            </div>
          </div>
        </div>
        </div>
        <div className={`relative z-10 w-full max-w-[344px] overflow-hidden rounded-[30px] border border-white bg-[rgba(248,249,252,0.96)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.16)] transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${revealStage >= 1 ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.97] opacity-0"}`}>
          <div className="max-h-[calc(100vh-40px)] overflow-y-auto px-4 pb-5 pt-18">
            <div className={`mb-4 rounded-[24px] bg-slate-50/90 p-5 text-center transition-all duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealStage >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
              <img alt="Alex28" className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg" src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop" />
              <h2 className="mb-2 text-2xl font-semibold text-slate-800">Alex28</h2>
              <span className="mb-4 inline-flex rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-indigo-600">
                {archiveCopy.didVerified}
              </span>
              <p className="mb-1 text-sm font-medium text-slate-600">{archiveCopy.role}</p>
              <p className="mb-5 text-sm text-slate-400">{archiveCopy.city}</p>
              <button className="mx-auto flex items-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-slate-500 transition-colors hover:border-slate-200 hover:text-slate-800" type="button">
                <span className="text-sm font-medium">{archiveCopy.travelPreferences}</span>
                <IconEdit className="h-4 w-4" />
              </button>
            </div>
            <div className={`space-y-4 transition-all duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealStage >= 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
              <div className="rounded-[24px] bg-white/80 p-5">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-lg font-semibold text-slate-800">{archiveCopy.experientialArchive}</h3>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{archiveCopy.statistics}</span>
                </div>
                <div className="mx-auto mb-4 h-36 w-36">
                  <ExperienceRadar accentClassName="text-indigo-500" gridStroke="#e2e8f0" labelFill="#64748b" labelFontSize={8.5} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <span className="text-sm text-slate-500">{archiveCopy.virtualExperiences}</span>
                    <span className="text-sm font-semibold text-slate-800">188</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <span className="text-sm text-slate-500">{archiveCopy.actualTrips}</span>
                    <span className="text-sm font-semibold text-slate-800">35</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <span className="text-sm text-slate-500">{archiveCopy.explored}</span>
                    <span className="text-right text-sm font-semibold text-slate-800">4 Continents, 15 Countries</span>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] bg-white/80 p-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">{archiveCopy.aiInstructions}</h3>
                <div className="relative h-24 rounded-xl border border-slate-200 bg-white p-3 shadow-inner">
                  <div className="absolute bottom-2 right-2 flex gap-1.5 rounded-lg border border-slate-100 bg-slate-50 p-1">
                    <button className="rounded p-1 text-slate-400 transition hover:bg-white hover:text-slate-700" type="button"><IconUndo className="h-4 w-4" /></button>
                    <button className="rounded p-1 text-slate-400 transition hover:bg-white hover:text-slate-700" type="button"><IconRedo className="h-4 w-4" /></button>
                    <button className="rounded p-1 text-slate-400 transition hover:bg-white hover:text-slate-700" type="button"><IconEdit className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] bg-white/80 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">{archiveCopy.aiAccount} <span className="ml-1 font-medium text-indigo-500">{archiveCopy.linked}</span></h3>
                  <button className="text-slate-400 transition hover:text-slate-600" type="button"><IconEdit className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3"><GPTIcon className="h-5 w-5 text-slate-700" /><span className="text-[11px] font-medium text-slate-500">GPT-15</span></div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3"><GeminiIcon className="h-5 w-5" /><span className="text-[11px] font-medium text-slate-500">Gemini 10 Pro</span></div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3"><ClaudeIcon className="h-5 w-5 text-[#d97757]" /><span className="text-[11px] font-medium text-slate-500">Claude</span></div>
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-300 p-3 text-slate-400"><IconPlus className="h-4 w-4" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
        ) : profileTheme === "bento" ? (
        <>
        <div className={`relative z-10 hidden h-[540px] w-[760px] grid-cols-12 grid-rows-6 gap-4 transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:grid ${revealStage >= 1 ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.97] opacity-0"}`}>
          <div className="col-span-4 row-span-6 flex flex-col justify-between rounded-[28px] border border-zinc-800 bg-[#18181b] p-6 shadow-2xl">
          <div className="flex flex-col items-center">
            <img
              alt="Alex28"
              className="mb-4 h-24 w-24 rounded-full object-cover"
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop"
            />
            <h2 className="text-xl font-bold text-zinc-100">Alex28</h2>
            <span className="mb-4 mt-1 rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">
              [ {archiveCopy.didVerified} ]
            </span>
            <p className="text-sm text-zinc-400">{archiveCopy.role}</p>
            <p className="text-sm text-zinc-500">{archiveCopy.city}</p>
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800" type="button">
            {archiveCopy.travelPreferences}
            <IconEdit className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="col-span-8 row-span-3 flex rounded-[28px] border border-zinc-800 bg-[#18181b] p-6 shadow-2xl">
          <div className="flex-1 border-r border-zinc-800/50 pr-4">
            <h3 className="mb-1 font-semibold text-zinc-100">{archiveCopy.experientialArchive}</h3>
            <p className="mb-4 text-xs uppercase tracking-wider text-zinc-500">{archiveCopy.statistics}</p>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-zinc-400">{archiveCopy.virtualExperiences}</span>
                  <span className="text-zinc-100">188</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-[80%] bg-blue-500" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-zinc-400">{archiveCopy.actualTrips}</span>
                  <span className="text-zinc-100">35</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-[30%] bg-emerald-500" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-zinc-400">{archiveCopy.explored}</span>
                  <span className="text-zinc-100">4 Continents, 15 Countries</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-[60%] bg-purple-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex h-full w-40 items-center justify-center pl-4">
            <ExperienceRadar accentClassName="text-blue-500" gridStroke="rgba(82,82,91,0.75)" labelFill="rgba(161,161,170,0.85)" />
          </div>
        </div>

        <div className="col-span-4 row-span-3 flex flex-col rounded-[28px] border border-zinc-800 bg-[#18181b] p-5 shadow-2xl">
          <h3 className="mb-3 text-sm font-semibold text-zinc-100">{archiveCopy.aiInstructions}</h3>
          <div className="relative flex-1 rounded-xl border border-zinc-800/50 bg-zinc-900 p-2">
            <div className="absolute bottom-2 right-2 flex gap-1">
              <button className="p-1.5 text-zinc-500 transition hover:text-zinc-300" type="button">
                <IconUndo className="h-3.5 w-3.5" />
              </button>
              <button className="p-1.5 text-zinc-500 transition hover:text-zinc-300" type="button">
                <IconRedo className="h-3.5 w-3.5" />
              </button>
              <button className="p-1.5 text-zinc-500 transition hover:text-zinc-300" type="button">
                <IconEdit className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-4 row-span-3 flex flex-col rounded-[28px] border border-zinc-800 bg-[#18181b] p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100">
              {archiveCopy.aiAccount} <span className="ml-1 text-xs font-normal text-blue-400">{archiveCopy.linked}</span>
            </h3>
            <IconEdit className="h-3.5 w-3.5 text-zinc-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900 p-2">
              <div className="flex h-6 w-6 items-center justify-center rounded text-zinc-300">
                <GPTIcon className="h-4 w-4" />
              </div>
              <span className="text-[10px] text-zinc-400">GPT-15</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900 p-2">
              <div className="flex h-6 w-6 items-center justify-center rounded text-blue-500">
                <GeminiIcon className="h-4 w-4" />
              </div>
              <span className="text-[10px] text-zinc-400">Gemini 10 Pro</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900 p-2">
              <div className="flex h-6 w-6 items-center justify-center rounded text-zinc-300">
                <ClaudeIcon className="h-4 w-4 text-[#d97757]" />
              </div>
              <span className="text-[10px] text-zinc-400">Claude</span>
            </div>
            <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-transparent p-2 transition-colors hover:bg-zinc-800">
              <IconPlus className="h-4 w-4 text-zinc-500" />
            </div>
          </div>
        </div>
        </div>
        <div className={`relative z-10 w-full max-w-[344px] overflow-hidden rounded-[28px] border border-zinc-800 bg-[#18181b] p-4 shadow-2xl transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${revealStage >= 1 ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.97] opacity-0"}`}>
          <div className="grid max-h-[calc(100vh-40px)] grid-cols-2 gap-4 overflow-y-auto">
            <div className="col-span-2 flex flex-col items-center rounded-[24px] border border-zinc-800 bg-[#18181b] p-5">
              <img alt="Alex28" className="mb-4 h-20 w-20 rounded-full object-cover" src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop" />
              <h2 className="text-xl font-bold text-zinc-100">Alex28</h2>
              <span className="mb-3 mt-1 rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">[ {archiveCopy.didVerified} ]</span>
              <p className="text-sm text-zinc-400">{archiveCopy.role}</p>
              <p className="mb-5 text-sm text-zinc-500">{archiveCopy.city}</p>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800" type="button">{archiveCopy.travelPreferences}<IconEdit className="h-3.5 w-3.5" /></button>
            </div>
            <div className="col-span-2 rounded-[24px] border border-zinc-800 bg-[#18181b] p-5">
              <h3 className="mb-1 font-semibold text-zinc-100">{archiveCopy.experientialArchive}</h3>
              <p className="mb-4 text-xs uppercase tracking-wider text-zinc-500">{archiveCopy.statistics}</p>
              <div className="mx-auto mb-4 h-32 w-32"><ExperienceRadar accentClassName="text-blue-500" gridStroke="rgba(82,82,91,0.75)" labelFill="rgba(161,161,170,0.85)" labelFontSize={8.4} /></div>
              <div className="space-y-3">
                <div><div className="mb-1 flex justify-between text-xs"><span className="text-zinc-400">{archiveCopy.virtualExperiences}</span><span className="text-zinc-100">188</span></div><div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800"><div className="h-full w-[80%] bg-blue-500" /></div></div>
                <div><div className="mb-1 flex justify-between text-xs"><span className="text-zinc-400">{archiveCopy.actualTrips}</span><span className="text-zinc-100">35</span></div><div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800"><div className="h-full w-[30%] bg-emerald-500" /></div></div>
                <div><div className="mb-1 flex justify-between text-xs"><span className="text-zinc-400">{archiveCopy.explored}</span><span className="text-zinc-100">4 Continents, 15 Countries</span></div><div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800"><div className="h-full w-[60%] bg-purple-500" /></div></div>
              </div>
            </div>
            <div className="rounded-[24px] border border-zinc-800 bg-[#18181b] p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-100">{archiveCopy.aiInstructions}</h3>
              <div className="relative h-28 rounded-xl border border-zinc-800/50 bg-zinc-900 p-2"><div className="absolute bottom-2 right-2 flex gap-1"><button className="p-1.5 text-zinc-500 transition hover:text-zinc-300" type="button"><IconUndo className="h-3.5 w-3.5" /></button><button className="p-1.5 text-zinc-500 transition hover:text-zinc-300" type="button"><IconRedo className="h-3.5 w-3.5" /></button><button className="p-1.5 text-zinc-500 transition hover:text-zinc-300" type="button"><IconEdit className="h-3.5 w-3.5" /></button></div></div>
            </div>
            <div className="rounded-[24px] border border-zinc-800 bg-[#18181b] p-4">
              <div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-semibold text-zinc-100">{archiveCopy.aiAccount}</h3><IconEdit className="h-3.5 w-3.5 text-zinc-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900 p-2"><GPTIcon className="h-4 w-4 text-zinc-300" /><span className="text-[10px] text-zinc-400">GPT-15</span></div>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900 p-2"><GeminiIcon className="h-4 w-4" /><span className="text-[10px] text-zinc-400">Gemini 10 Pro</span></div>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900 p-2"><ClaudeIcon className="h-4 w-4 text-[#d97757]" /><span className="text-[10px] text-zinc-400">Claude</span></div>
                <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-700 p-2"><IconPlus className="h-4 w-4 text-zinc-500" /></div>
              </div>
            </div>
          </div>
        </div>
        </>
        ) : profileTheme === "minimalist" ? (
        <>
        <div className={`relative z-10 hidden w-[720px] flex-col rounded-[40px] border border-gray-100 bg-white p-10 shadow-sm transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:flex ${revealStage >= 1 ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.97] opacity-0"}`}>
          <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-6">
            <img
              alt="Alex28"
              className="h-20 w-20 rounded-full object-cover"
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop"
            />
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Alex28</h2>
                <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                  {archiveCopy.didVerified}
                </span>
              </div>
              <p className="font-medium text-gray-500">{archiveCopy.role} · {archiveCopy.city}</p>
            </div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-50" title={archiveCopy.travelPreferences} type="button">
            <IconEdit className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="mb-8 h-px w-full bg-gray-100" />

        <div className="flex gap-12">
          <div className="flex-1">
            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400">{archiveCopy.experientialArchive}</h3>
            <div className="flex items-center gap-6">
              <div className="h-28 w-28">
                <ExperienceRadar accentClassName="text-black" gridStroke="#f3f4f6" labelFill="#9ca3af" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{archiveCopy.virtualExperiences}</p>
                  <p className="text-xl font-bold text-gray-900">188</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{archiveCopy.actualTrips}</p>
                    <p className="text-xl font-bold text-gray-900">35</p>
                  </div>
                  <div>
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{archiveCopy.explored}</p>
                    <p className="mt-1 text-sm font-bold text-gray-900">4 Continents, 15 Countries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-px bg-gray-100" />

          <div className="flex w-[240px] flex-col justify-between">
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">{archiveCopy.aiInstructions}</h3>
              <div className="relative h-24 rounded-2xl border border-gray-200 bg-gray-50 p-2">
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button className="p-1 text-gray-400 transition hover:text-black" type="button">
                    <IconUndo className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 transition hover:text-black" type="button">
                    <IconRedo className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 transition hover:text-black" type="button">
                    <IconEdit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>{archiveCopy.aiAccount}</span>
                <span className="text-black">{archiveCopy.linked}</span>
              </h3>
              <div className="flex gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white">
                  <GPTIcon className="h-4 w-4 text-black" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white">
                  <GeminiIcon className="h-4 w-4 text-black" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white">
                  <ClaudeIcon className="h-4 w-4 text-[#d97757]" />
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        <div className={`relative z-10 w-full max-w-[344px] overflow-hidden rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${revealStage >= 1 ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.97] opacity-0"}`}>
          <div className="max-h-[calc(100vh-40px)] overflow-y-auto">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img alt="Alex28" className="h-16 w-16 rounded-full object-cover" src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop" />
                <div><div className="mb-1 flex items-center gap-2"><h2 className="text-2xl font-bold tracking-tight text-gray-900">Alex28</h2><span className="rounded-full bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">{archiveCopy.didVerified}</span></div><p className="text-sm font-medium text-gray-500">{archiveCopy.role}</p><p className="text-sm text-gray-400">{archiveCopy.city}</p></div>
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-50" title={archiveCopy.travelPreferences} type="button"><IconEdit className="h-4 w-4 text-gray-600" /></button>
            </div>
            <div className="mb-6 h-px w-full bg-gray-100" />
            <div className="space-y-5">
              <div>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">{archiveCopy.experientialArchive}</h3>
                <div className="mx-auto mb-4 h-28 w-28"><ExperienceRadar accentClassName="text-black" gridStroke="#f3f4f6" labelFill="#9ca3af" labelFontSize={8.2} /></div>
                <div className="space-y-3">
                  <div><p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{archiveCopy.virtualExperiences}</p><p className="text-xl font-bold text-gray-900">188</p></div>
                  <div className="flex gap-8"><div><p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{archiveCopy.actualTrips}</p><p className="text-xl font-bold text-gray-900">35</p></div><div><p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{archiveCopy.explored}</p><p className="mt-1 text-sm font-bold text-gray-900">4 Continents, 15 Countries</p></div></div>
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">{archiveCopy.aiInstructions}</h3>
                <div className="relative h-24 rounded-2xl border border-gray-200 bg-gray-50 p-2"><div className="absolute bottom-2 right-2 flex gap-1"><button className="p-1 text-gray-400 transition hover:text-black" type="button"><IconUndo className="h-4 w-4" /></button><button className="p-1 text-gray-400 transition hover:text-black" type="button"><IconRedo className="h-4 w-4" /></button><button className="p-1 text-gray-400 transition hover:text-black" type="button"><IconEdit className="h-4 w-4" /></button></div></div>
              </div>
              <div>
                <h3 className="mb-3 flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400"><span>{archiveCopy.aiAccount}</span><span className="text-black">{archiveCopy.linked}</span></h3>
                <div className="flex gap-2"><div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white"><GPTIcon className="h-4 w-4 text-black" /></div><div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white"><GeminiIcon className="h-4 w-4 text-black" /></div><div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white"><ClaudeIcon className="h-4 w-4 text-[#d97757]" /></div></div>
              </div>
            </div>
          </div>
        </div>
        </>
        ) : (
        <>
        <div className={`relative z-10 hidden h-[520px] w-[800px] flex-col overflow-hidden rounded-sm border border-[#dcd7cd] bg-[#fcfaf7] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:flex ${revealStage >= 1 ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.97] opacity-0"}`}>
          <div className="mb-5 flex shrink-0 items-end justify-between border-b-[3px] border-[#2d2a26] pb-4">
          <div>
            <h1 className="mb-1.5 font-serif text-[40px] font-bold italic leading-none tracking-tight text-[#2d2a26]">Alex28</h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8c8273]">{archiveCopy.role} — {archiveCopy.city}</p>
          </div>
          <div className="mb-1 flex flex-col items-end gap-2.5">
            <span className="inline-block border border-[#d97757] px-1.5 py-0.5 text-[9px] font-bold uppercase leading-tight tracking-widest text-[#d97757]">
              {archiveCopy.didVerified}
            </span>
            <button className="group flex items-center justify-end gap-1.5 text-[#2d2a26] transition-colors hover:text-[#d97757]" type="button">
              <span className="text-[10px] font-bold uppercase tracking-wider">{archiveCopy.travelPreferences}</span>
              <IconEdit className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-7">
          <div className="w-[140px] shrink-0">
            <img
              alt="Alex28 Profile"
              className="aspect-[3/4] w-full rounded-sm object-cover brightness-105 contrast-110 sepia-[0.15]"
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <h2 className="mb-1 shrink-0 font-serif text-[22px] font-bold leading-tight text-[#2d2a26]">{archiveCopy.experientialArchive}</h2>
            <p className="mb-2 shrink-0 border-b border-[#ece9e4] pb-1.5 text-[9px] uppercase tracking-widest text-[#8c8273]">{archiveCopy.statistics}</p>

            <div className="flex min-h-0 flex-1 items-center justify-center py-2">
              <ExperienceRadar accentClassName="text-[#d97757]" gridStroke="rgba(220,215,205,0.95)" labelFill="#8c8273" />
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-x-5 gap-y-3">
              <div className="border-t border-[#dcd7cd] pt-1.5">
                <p className="mb-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#8c8273]">{archiveCopy.virtualExperiences}</p>
                <p className="font-serif text-2xl leading-none text-[#2d2a26]">188</p>
              </div>
              <div className="border-t border-[#dcd7cd] pt-1.5">
                <p className="mb-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#8c8273]">{archiveCopy.actualTrips}</p>
                <p className="font-serif text-2xl leading-none text-[#2d2a26]">35</p>
              </div>
              <div className="col-span-2 border-t border-[#dcd7cd] pt-1.5">
                <p className="mb-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#8c8273]">{archiveCopy.explored}</p>
                <p className="font-serif text-[20px] leading-none text-[#2d2a26]">4 Continents, 15 Countries</p>
              </div>
            </div>
          </div>

          <div className="flex w-[210px] shrink-0 flex-col border-l border-[#dcd7cd] pl-7">
            <div className="mb-7 shrink-0">
              <h3 className="mb-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#2d2a26]">{archiveCopy.aiInstructions}</h3>
              <div className="relative h-[84px] w-full border border-[#dcd7cd] bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <div className="absolute bottom-1 right-1 flex gap-0.5">
                  <button className="rounded p-1.5 text-[#8c8273] transition-colors hover:bg-black/5 hover:text-[#2d2a26]" title="Undo" type="button">
                    <IconUndo className="h-3.5 w-3.5" />
                  </button>
                  <button className="rounded p-1.5 text-[#8c8273] transition-colors hover:bg-black/5 hover:text-[#2d2a26]" title="Edit" type="button">
                    <IconEdit className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#2d2a26]">{archiveCopy.linkedAi}</h3>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#ece9e4] text-[#2d2a26]">
                    <GPTIcon className="h-3 w-3" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wide text-[#8c8273]">GPT-15</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#ece9e4] text-[#d97757]">
                    <GeminiIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wide text-[#8c8273]">Gemini 10 Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#ece9e4] text-[#2d2a26]">
                    <ClaudeIcon className="h-3.5 w-3.5 text-[#d97757]" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wide text-[#8c8273]">Claude</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className={`relative z-10 w-full max-w-[344px] overflow-hidden rounded-[24px] border border-[#dcd7cd] bg-[#fcfaf7] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${revealStage >= 1 ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.97] opacity-0"}`}>
        <div className="max-h-[calc(100vh-40px)] overflow-y-auto">
          <div className="mb-5 border-b-[3px] border-[#2d2a26] pb-4">
            <h1 className="mb-1.5 font-serif text-[34px] font-bold italic leading-none tracking-tight text-[#2d2a26]">Alex28</h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8c8273]">{archiveCopy.role} - {archiveCopy.city}</p>
          </div>
          <div className="mb-5 flex items-start justify-between">
            <img alt="Alex28 Profile" className="aspect-[3/4] w-[112px] rounded-sm object-cover brightness-105 contrast-110 sepia-[0.15]" src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop" />
            <div className="flex flex-col items-end gap-2.5">
              <span className="inline-block border border-[#d97757] px-1.5 py-0.5 text-[9px] font-bold uppercase leading-tight tracking-widest text-[#d97757]">{archiveCopy.didVerified}</span>
              <button className="group flex items-center justify-end gap-1.5 text-[#2d2a26] transition-colors hover:text-[#d97757]" type="button"><span className="text-[10px] font-bold uppercase tracking-wider">{archiveCopy.travelPreferences}</span><IconEdit className="h-3 w-3" /></button>
            </div>
          </div>
          <div className="mb-5">
            <h2 className="mb-1 font-serif text-[22px] font-bold leading-tight text-[#2d2a26]">{archiveCopy.experientialArchive}</h2>
            <p className="mb-3 border-b border-[#ece9e4] pb-1.5 text-[9px] uppercase tracking-widest text-[#8c8273]">{archiveCopy.statistics}</p>
            <div className="flex justify-center py-2"><div className="h-36 w-36"><ExperienceRadar accentClassName="text-[#d97757]" gridStroke="rgba(220,215,205,0.95)" labelFill="#8c8273" labelFontSize={8.2} /></div></div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-3">
              <div className="border-t border-[#dcd7cd] pt-1.5"><p className="mb-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#8c8273]">{archiveCopy.virtualExperiences}</p><p className="font-serif text-2xl leading-none text-[#2d2a26]">188</p></div>
              <div className="border-t border-[#dcd7cd] pt-1.5"><p className="mb-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#8c8273]">{archiveCopy.actualTrips}</p><p className="font-serif text-2xl leading-none text-[#2d2a26]">35</p></div>
              <div className="col-span-2 border-t border-[#dcd7cd] pt-1.5"><p className="mb-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#8c8273]">{archiveCopy.explored}</p><p className="font-serif text-[20px] leading-none text-[#2d2a26]">4 Continents, 15 Countries</p></div>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <h3 className="mb-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#2d2a26]">{archiveCopy.aiInstructions}</h3>
              <div className="relative h-[84px] w-full border border-[#dcd7cd] bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"><div className="absolute bottom-1 right-1 flex gap-0.5"><button className="rounded p-1.5 text-[#8c8273] transition-colors hover:bg-black/5 hover:text-[#2d2a26]" title="Undo" type="button"><IconUndo className="h-3.5 w-3.5" /></button><button className="rounded p-1.5 text-[#8c8273] transition-colors hover:bg-black/5 hover:text-[#2d2a26]" title="Redo" type="button"><IconRedo className="h-3.5 w-3.5" /></button><button className="rounded p-1.5 text-[#8c8273] transition-colors hover:bg-black/5 hover:text-[#2d2a26]" title="Edit" type="button"><IconEdit className="h-3.5 w-3.5" /></button></div></div>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between"><h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#2d2a26]">{archiveCopy.linkedAi}</h3></div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#ece9e4] text-[#2d2a26]"><GPTIcon className="h-3 w-3" /></div><span className="text-[11px] font-semibold tracking-wide text-[#8c8273]">GPT-15</span></li>
                <li className="flex items-center gap-3"><div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#ece9e4] text-[#d97757]"><GeminiIcon className="h-3.5 w-3.5" /></div><span className="text-[11px] font-semibold tracking-wide text-[#8c8273]">Gemini 10 Pro</span></li>
                <li className="flex items-center gap-3"><div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#ece9e4] text-[#2d2a26]"><ClaudeIcon className="h-3.5 w-3.5 text-[#d97757]" /></div><span className="text-[11px] font-semibold tracking-wide text-[#8c8273]">Claude</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

export function WeaveAiHomePage() {
  const router = useRouter();
  const { scale, wrapperStyle } = useAdaptivePageScale();
  const navigationTimerRef = useRef<number | null>(null);
  const [activeNav, setActiveNav] = useState<"home" | "saved" | "discover">("home");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [homeChats, setHomeChats] = useState<SidebarChatItem[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [language, setLanguage] = useState<WeaveLanguage>("EN");
  const [partnerLocation, setPartnerLocation] = useState<string | null>(null);
  const [partnerTemperature, setPartnerTemperature] = useState<string>("--°");
  const [journeyTransition, setJourneyTransition] = useState<{ active: boolean; query: string }>({
    active: false,
    query: "",
  });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [now, setNow] = useState(() => formatNow(new Date()));
  const [themeMode, setThemeMode] = useState<"day" | "evening" | "night">(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) {
      return "night";
    }
    if (hour >= 16 && hour < 18) {
      return "evening";
    }
    return "day";
  });
  const copy = HOME_COPY[language];
  const archiveCopy = {
    didVerified: language === "JA" ? "認証済み" : language === "ZH" ? "已认证" : "DID Verified",
    role:
      language === "JA" ? "プロダクトマネージャー" : language === "ZH" ? "产品经理" : "Product Manager",
    city: language === "JA" ? "東京、日本" : language === "ZH" ? "东京，日本" : "Tokyo, Japan",
    travelPreferences: language === "JA" ? "旅の好み" : language === "ZH" ? "旅行偏好" : "Travel Preferences",
    experientialArchive:
      language === "JA" ? "体験アーカイブ" : language === "ZH" ? "体验档案" : "Experiential Archive",
    statistics: language === "JA" ? "統計" : language === "ZH" ? "统计" : "Statistics",
    virtualExperiences:
      language === "JA" ? "仮想体験" : language === "ZH" ? "虚拟体验" : "Virtual Experiences",
    actualTrips: language === "JA" ? "実際の旅" : language === "ZH" ? "真实旅行" : "Actual Trips",
    explored: language === "JA" ? "踏破エリア" : language === "ZH" ? "已探索" : "Explored",
    aiInstructions: language === "JA" ? "AI指示" : language === "ZH" ? "AI指令" : "AI Instructions",
    aiAccount: language === "JA" ? "AIアカウント" : language === "ZH" ? "AI账号" : "AI Account",
    linked: language === "JA" ? "[ 連携済み ]" : language === "ZH" ? "[ 已连接 ]" : "[ Linked ]",
    linkedAi: language === "JA" ? "連携AI" : language === "ZH" ? "已连接 AI" : "Linked AI",
  };

  const chips = useMemo(
    () => [
      { label: copy.chips[0], icon: "users" },
      { label: copy.chips[1], icon: "globe" },
      { label: copy.chips[2], icon: "train" },
      { label: copy.chips[3], icon: "tree" },
      { label: copy.chips[4], icon: "bag" },
    ],
    [copy]
  );

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("saved") === "1") {
      setActiveNav("saved");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const queryLocation = normalizePartnerLocation(params.get("partnerLocation"));
    let cancelled = false;

    const applyRuntimePayload = (runtimePayload: { location: string | null; temperature: string | null } | null) => {
      if (cancelled || !runtimePayload) {
        return;
      }

      if (!queryLocation && runtimePayload.location) {
        setStoredPartnerLocation(runtimePayload.location);
        setPartnerLocation(runtimePayload.location);
      }

      if (runtimePayload.temperature) {
        setPartnerTemperature(runtimePayload.temperature);
      }
    };

    const fetchRuntimeLocation = async (query?: string) => {
      const response = await fetch(query ? `/api/partner-location?${query}` : "/api/partner-location", { cache: "no-store" });
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        location?: string | null;
        temperatureCelsius?: number | null;
      };

      return {
        location: normalizePartnerLocation(payload.location),
        temperature:
          typeof payload.temperatureCelsius === "number" ? `${Math.round(payload.temperatureCelsius)}°` : null,
      };
    };

    if (queryLocation) {
      setStoredPartnerLocation(queryLocation);
      setPartnerLocation(queryLocation);
    } else {
      setPartnerLocation(getStoredPartnerLocation());
    }

    const fallbackToIpLocation = () => {
      void fetchRuntimeLocation()
        .then((runtimePayload) => {
          applyRuntimePayload(runtimePayload);
        })
        .catch(() => {
          // Keep stored or fallback values when runtime geolocation/weather is unavailable.
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const query = new URLSearchParams({
            latitude: String(coords.latitude),
            longitude: String(coords.longitude),
          }).toString();

          void fetchRuntimeLocation(query)
            .then((runtimePayload) => {
              applyRuntimePayload(runtimePayload);
            })
            .catch(() => {
              fallbackToIpLocation();
            });
        },
        () => {
          fallbackToIpLocation();
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 600000,
        }
      );
    } else {
      fallbackToIpLocation();
    }

    const handlePartnerLocationChange = (event: Event) => {
      setPartnerLocation((event as CustomEvent<string | null>).detail ?? null);
    };

    window.addEventListener(WEAVE_PARTNER_LOCATION_EVENT, handlePartnerLocationChange);
    return () => {
      cancelled = true;
      window.removeEventListener(WEAVE_PARTNER_LOCATION_EVENT, handlePartnerLocationChange);
    };
  }, []);

  useEffect(() => {
    setHomeChats(getHomeSidebarChats());
  }, []);

  useEffect(() => {
    setLanguage(getStoredWeaveLanguage());
    const handleLanguageChange = (event: Event) => {
      setLanguage(((event as CustomEvent<WeaveLanguage>).detail as WeaveLanguage) ?? getStoredWeaveLanguage());
    };
    window.addEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange);
    return () => window.removeEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);

    updateReducedMotion();
    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", updateReducedMotion);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = new Date();
      const hour = current.getHours();
      setNow(formatNow(current));
      if (hour >= 18 || hour < 6) {
        setThemeMode("night");
      } else if (hour >= 16 && hour < 18) {
        setThemeMode("evening");
      } else {
        setThemeMode("day");
      }
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = () => {
    const query = searchValue.trim();
    if (!query || isNavigating) {
      return;
    }

    setIsNavigating(true);
    setHomeChats(addSearchSidebarChat(query));
    setJourneyTransition({
      active: true,
      query,
    });

    navigationTimerRef.current = window.setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }, reducedMotion ? 280 : 1800);
  };

  const handleSidebarChatSelect = (chat: SidebarChatItem) => {
    router.push(chat.href);
  };

  const handleSidebarChatDelete = (chat: SidebarChatItem) => {
    setHomeChats(removeHomeSidebarChat(chat));
  };

  return (
    <div
      className={`h-screen w-screen overflow-hidden ${
        themeMode === "night" ? "bg-slate-950" : themeMode === "evening" ? "bg-[#14233c]" : "bg-[#f0f9ff]"
      }`}
    >
      <div
        className={`flex overflow-hidden text-white transition-[transform,filter,opacity] duration-[820ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          profileOpen ? "opacity-[0.84] saturate-[0.92]" : "opacity-100 saturate-100"
        }`}
        style={{
          ...wrapperStyle,
          transform: `scale(${profileOpen ? scale * 0.985 : scale})`,
        }}
      >
      <aside className="relative z-20 hidden h-full w-[90px] flex-shrink-0 flex-col items-center border-r border-white/10 bg-[linear-gradient(180deg,rgba(34,38,46,0.48)_0%,rgba(26,30,38,0.40)_100%)] py-6 text-white backdrop-blur-xl shadow-[6px_0_28px_-20px_rgba(0,0,0,0.16)] md:flex">
        <div className="flex w-full flex-col items-center gap-3 px-4">
          <button
            aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/[0.04] text-white/72 transition-colors hover:bg-white/[0.08] hover:text-white"
            onClick={() => setSidebarExpanded((value) => !value)}
            type="button"
          >
            {sidebarExpanded ? <IconChevronLeft /> : <IconChevronRight />}
          </button>
          <button
            className="mt-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/72 transition-colors hover:bg-white/[0.1] hover:text-white"
            type="button"
          >
            <IconPlus />
          </button>
        </div>

        <nav className="mt-10 flex flex-1 flex-col items-center gap-7">
          <button onClick={() => setActiveNav("saved")} type="button">
            <SidebarIcon active={activeNav === "saved"} label={copy.sidebar.saved}>
              <IconStar />
            </SidebarIcon>
          </button>
          <button onClick={() => setActiveNav("home")} type="button">
            <SidebarIcon active={activeNav === "home"} label={copy.sidebar.home}>
              <IconSearch />
            </SidebarIcon>
          </button>
          <button onClick={() => setActiveNav("discover")} type="button">
            <SidebarIcon active={activeNav === "discover"} label={copy.sidebar.discover}>
              <IconCompass />
            </SidebarIcon>
          </button>
        </nav>
      </aside>

      <div className="hidden md:block">
        <ExpandedSidebar activeNav={activeNav} expanded={sidebarExpanded} homeChats={homeChats} labels={copy.sidebar} onChatDelete={handleSidebarChatDelete} onChatSelect={handleSidebarChatSelect} />
      </div>

      {activeNav === "saved" ? (
        <SavedTripsView />
      ) : activeNav === "discover" ? (
        <DiscoverJournalView />
      ) : (
       <main className="relative h-full flex-1 overflow-hidden">
        <div
          className={`absolute inset-0 z-0 ${
            themeMode === "night"
              ? "weave-ai-night"
              : themeMode === "evening"
                ? "weave-ai-evening"
                : "weave-ai-afternoon"
          }`}
        />
        <WeaveAiDynamicBackground
          className="absolute inset-0 z-[1] h-full w-full"
          reducedMotion={reducedMotion}
          themeMode={themeMode}
        />
        {themeMode === "day" ? (
          <div className="weave-ai-sun-glare absolute right-[-10%] top-[-10%] z-[2] h-[60%] w-[60%]" />
        ) : null}
        {themeMode === "evening" ? (
          <div className="weave-ai-evening-glow absolute bottom-[-8%] left-1/2 z-[2] h-[44%] w-[52%] -translate-x-1/2" />
        ) : null}
        <div className="weave-ai-grain absolute inset-0 z-10" />
        {themeMode === "evening" ? <div className="weave-ai-evening-particles absolute inset-0 z-[11]" /> : null}

        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col p-8">
          <header className="flex w-full items-start justify-between">
            <div className="pointer-events-auto flex flex-col drop-shadow-md">
              <span
                className={`mb-1 text-[13px] font-medium ${
                  themeMode === "night"
                    ? "text-white/90"
                    : themeMode === "evening"
                      ? "text-white/90"
                      : "text-white/88"
                }`}
              >
                {now.day}
              </span>
              <h2
                className={`mb-4 text-[44px] font-light leading-none tracking-tight ${
                  themeMode === "night" ? "text-white" : themeMode === "evening" ? "text-white" : "text-white"
                }`}
              >
                {now.time}
              </h2>
              <div className="mb-1.5 flex items-center gap-2">
                {themeMode === "night" ? (
                  <svg
                    aria-hidden="true"
                    className="h-6 w-6 text-indigo-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : themeMode === "evening" ? (
                  <svg
                    aria-hidden="true"
                    className="h-6 w-6 text-orange-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="4.5" />
                    <path d="M12 1.8v2.4M12 19.8v2.4M4.22 4.22l1.7 1.7M18.08 18.08l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.22 19.78l1.7-1.7M18.08 5.92l1.7-1.7" strokeLinecap="round" />
                  </svg>
                ) : (
                  <IconSun />
                )}
                <span
                  className={`text-[22px] font-light ${
                    themeMode === "night" ? "text-white" : themeMode === "evening" ? "text-white" : "text-white"
                  }`}
                >
                  {partnerTemperature}
                </span>
              </div>
              <p
                className={`text-[12px] font-medium tracking-wide ${
                  themeMode === "night"
                    ? "text-white/80"
                    : themeMode === "evening"
                      ? "text-white/80"
                      : "text-white/72"
                }`}
              >
                {partnerLocation ?? copy.header.location}
              </p>
            </div>

            <div className="pointer-events-auto flex items-center gap-4">
              <button
                className={`flex h-[42px] w-[42px] items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-colors ${
                  themeMode === "night"
                    ? "border border-white/10 bg-black/40 text-white hover:bg-white/10"
                    : themeMode === "evening"
                      ? "bg-black text-white hover:bg-gray-800"
                    : "bg-white/40 text-sky-950 hover:bg-white/60"
                }`}
                onClick={() => setProfileOpen(true)}
                type="button"
              >
                <IconArrowLeft />
              </button>
              <button
                aria-label="Profile menu"
                className={`group relative flex h-[46px] w-[46px] cursor-pointer items-center justify-center overflow-hidden rounded-full border-[2px] shadow-sm ${
                  themeMode === "night"
                    ? "border-white/20 bg-indigo-900/60"
                    : themeMode === "evening"
                      ? "border-white/20 bg-orange-700/60"
                      : "border-white/40 bg-sky-200"
                }`}
                onClick={() => setProfileOpen(true)}
                type="button"
              >
                <span
                  className={`text-lg font-medium ${
                    themeMode === "night" ? "text-white" : themeMode === "evening" ? "text-white" : "text-sky-900"
                  }`}
                >
                  M
                </span>
                <div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-transparent" />
              </button>
              <div className="relative">
                <button
                  aria-expanded={languageMenuOpen}
                  aria-haspopup="menu"
                  className={`flex min-w-[62px] items-center justify-between gap-2 rounded-full px-3 py-2 text-[11px] font-medium tracking-[0.18em] shadow-sm backdrop-blur-md transition-colors ${
                    themeMode === "night"
                      ? "border border-white/10 bg-black/40 text-white hover:bg-white/10"
                      : themeMode === "evening"
                        ? "border border-white/18 bg-black/38 text-white hover:bg-white/12"
                        : "border border-white/45 bg-white/38 text-sky-950 hover:bg-white/60"
                  }`}
                  onClick={() => setLanguageMenuOpen((open) => !open)}
                  type="button"
                >
                  <span>{language}</span>
                  <svg aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${languageMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div
                  className={`absolute right-0 top-[calc(100%+10px)] w-[92px] rounded-[18px] p-1.5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 ${
                    languageMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1.5 opacity-0"
                  } ${
                    themeMode === "night"
                      ? "border border-white/12 bg-[#101628]/90 text-white"
                      : themeMode === "evening"
                        ? "border border-white/14 bg-[#1d2436]/90 text-white"
                        : "border border-white/50 bg-white/78 text-sky-950"
                  }`}
                >
                  {(["EN", "JA", "ZH"] as const).map((option) => (
                    <button
                      key={option}
                      className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left text-[11px] tracking-[0.18em] transition ${
                        language === option
                          ? themeMode === "day"
                            ? "bg-sky-950/8 text-sky-950"
                            : "bg-white/10 text-white"
                          : themeMode === "day"
                            ? "text-sky-950/72 hover:bg-sky-950/6 hover:text-sky-950"
                            : "text-white/72 hover:bg-white/8 hover:text-white"
                      }`}
                      onClick={() => {
                        setStoredWeaveLanguage(option);
                        setLanguageMenuOpen(false);
                      }}
                      type="button"
                    >
                      <span>{option}</span>
                      {language === option ? <span className={`${themeMode === "day" ? "text-sky-950/45" : "text-white/45"} text-[9px] tracking-[0.16em]`}>ON</span> : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="pointer-events-auto mt-[-80px] flex flex-1 flex-col items-center justify-center">
            <h1
              className={`mb-2 text-center font-normal tracking-wide [font-family:var(--font-cormorant),serif] transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                themeMode === "night"
                  ? "text-white drop-shadow-2xl"
                  : themeMode === "evening"
                    ? "text-white drop-shadow-xl"
                    : "text-sky-950 drop-shadow-sm"
              } ${
                journeyTransition.active
                  ? "max-w-[980px] translate-y-2 text-[54px] leading-[1.04] md:text-[84px]"
                  : "max-w-none translate-y-0 text-[72px]"
              }`}
            >
              {journeyTransition.active ? journeyTransition.query : "Weave Ai"}
            </h1>

            <p
              className={`mb-10 text-[18px] font-light tracking-wider transition-all duration-[1100ms] ease-out ${
                themeMode === "night"
                  ? "text-white/90 drop-shadow-lg"
                  : themeMode === "evening"
                    ? "text-white/90 drop-shadow-lg"
                    : "text-sky-900/90 drop-shadow-sm"
              } ${journeyTransition.active ? "translate-y-3 opacity-0 blur-[2px]" : "translate-y-0 opacity-100 blur-0"}`}
            >
              {copy.header.intro}
            </p>

            <WeavePromptBar
              className="max-w-[720px]"
              onChange={setSearchValue}
              onSubmit={handleSubmit}
              theme={themeMode === "night" ? "night" : themeMode === "evening" ? "evening" : "day"}
              transitionActive={journeyTransition.active}
              value={searchValue}
            />

            <div
              className={`mt-7 flex flex-wrap justify-center gap-3 transition-all duration-[1100ms] ease-out ${
                journeyTransition.active ? "translate-y-5 opacity-0 blur-[2px]" : "translate-y-0 opacity-100 blur-0"
              }`}
            >
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  className={`flex h-[36px] items-center gap-2 rounded-full px-4 text-[12px] font-medium backdrop-blur-md transition-all ${
                    themeMode === "night"
                      ? "border border-white/10 bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:bg-white/20"
                      : themeMode === "evening"
                        ? "border border-white/20 bg-white/15 text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-white/25"
                        : "border border-white/50 bg-white/40 text-sky-900 shadow-sm hover:bg-white/60"
                  }`}
                  onClick={() => setSearchValue(chip.label)}
                  type="button"
                >
                  <span
                    className={
                      themeMode === "night"
                        ? "text-indigo-200"
                        : themeMode === "evening"
                          ? "text-orange-200"
                          : "text-sky-700"
                    }
                  >
                    <ChipVisual kind={chip.icon} />
                  </span>
                  {chip.label}
                </button>
              ))}
            </div>

            {journeyTransition.active ? (
              <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
                <div
                  className={`absolute inset-0 ${
                    themeMode === "night"
                      ? "bg-[radial-gradient(circle_at_50%_55%,rgba(129,140,248,0.22),transparent_18%),radial-gradient(circle_at_50%_58%,rgba(191,219,254,0.10),transparent_38%)]"
                      : themeMode === "evening"
                        ? "bg-[radial-gradient(circle_at_50%_55%,rgba(251,146,60,0.20),transparent_18%),radial-gradient(circle_at_50%_58%,rgba(254,215,170,0.10),transparent_38%)]"
                        : "bg-[radial-gradient(circle_at_50%_55%,rgba(56,189,248,0.18),transparent_18%),radial-gradient(circle_at_50%_58%,rgba(186,230,253,0.08),transparent_38%)]"
                  }`}
                />
                <div className="animate-weave-journey-drift absolute inset-0 opacity-90" />
                <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center px-8">
                  <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.34em] text-white/42">
                    Weaving from a feeling
                  </div>
                  <div className="relative mt-3 h-px w-[280px] overflow-hidden bg-white/10">
                    <div className="animate-weave-thread-pass absolute inset-y-0 left-[-32%] w-[32%] bg-gradient-to-r from-transparent via-white to-transparent" />
                  </div>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {journeyWords.map((word, index) => (
                      <span
                        key={word}
                        className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white/38"
                        style={{
                          animation: reducedMotion
                            ? undefined
                            : `weave-word-fade 1100ms ease-out ${index * 120}ms forwards`,
                          opacity: reducedMotion ? 0.5 : 0,
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
      )}
    </div>
    <MobileBottomNav
      activeNav={activeNav}
      labels={copy.sidebar}
      onDiscover={() => setActiveNav("discover")}
      onHome={() => setActiveNav("home")}
      onProfile={() => setProfileOpen(true)}
      onSaved={() => setActiveNav("saved")}
    />
      {profileOpen ? <ProfileExperienceOverlay archiveCopy={archiveCopy} onClose={() => setProfileOpen(false)} /> : null}
    </div>
  );
}
