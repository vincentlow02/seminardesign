"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WeavePromptBar } from "@/components/weave/WeavePromptBar";
import { DiscoverJournalView, SavedTripsView } from "@/components/weave/WeaveAiHomePage";
import { WEAVE_LANGUAGE_EVENT, type WeaveLanguage, getStoredWeaveLanguage } from "@/components/weave/weaveLanguage";
import { useAdaptivePageScale } from "@/components/weave/useAdaptivePageScale";
import {
  SidebarChatItem,
  addNewSidebarChat,
  addSearchSidebarChat,
  getHomeSidebarChats,
  removeHomeSidebarChat,
} from "@/components/weave/sidebarChats";

const HOKKAIDO_VIDEO_SRC = "/media/hokkaido-web.mp4";
const FINLAND_VIDEO_SRC = "/media/finland1-web.mp4";

function IconBack() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

function IconPlus() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 12h14M12 5v14" strokeLinecap="round" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg aria-hidden="true" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinejoin="round" />
    </svg>
  );
}

function IconCompass() {
  return (
    <svg aria-hidden="true" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" strokeLinejoin="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg aria-hidden="true" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" strokeLinecap="round" />
    </svg>
  );
}

function IconPlay({ className = "h-[14px] w-[14px]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function IconPause({ className = "h-[14px] w-[14px]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="4" width="4" height="16" rx="1.5" />
      <rect x="14" y="4" width="4" height="16" rx="1.5" />
    </svg>
  );
}

function IconVolume({ muted }: { muted: boolean }) {
  return muted ? (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ) : (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 12h14" strokeLinecap="round" />
      <path d="m12 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 7h16M9 7V4.8c0-.44.36-.8.8-.8h4.4c.44 0 .8.36.8.8V7M7.2 7l.72 10.14c.03.39.35.7.74.7h6.68c.39 0 .71-.31.74-.7L16.8 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11.2v4.6M14 11.2v4.6" strokeLinecap="round" />
    </svg>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function primeVideoCover(video: HTMLVideoElement) {
  if (video.readyState >= 2) {
    if (video.currentTime < 0.01) {
      try {
        video.currentTime = 0.01;
      } catch {}
    }
    return;
  }

  const handleLoadedData = () => {
    if (video.currentTime < 0.01) {
      try {
        video.currentTime = 0.01;
      } catch {}
    }
    video.removeEventListener("loadeddata", handleLoadedData);
  };

  video.addEventListener("loadeddata", handleLoadedData);
}

function SidebarNavItem({
  active,
  icon,
  label,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="group flex flex-col items-center gap-1.5 text-white/54 transition-colors hover:text-white/88" type="button">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-[18px] transition-colors ${
          active
            ? "border border-white/12 bg-white/[0.06] text-white shadow-[0_8px_20px_-14px_rgba(0,0,0,0.22)] backdrop-blur-md"
            : "group-hover:bg-white/[0.045]"
        }`}
      >
        {icon}
      </div>
      <span className={`text-[10px] font-medium ${active ? "text-white/88" : "text-white/48 group-hover:text-white/76"}`}>{label}</span>
    </button>
  );
}

const chatItems = {
  home: [] as string[],
  saved: ["Sapporo winter guide", "Kyoto temple notes", "Swiss Alps scenic route"],
  discover: ["Hidden island escapes", "Quiet city weekends", "Mountain rail journeys"],
} as const;

function ExpandedSidebar({
  activeNav,
  homeChats,
  onChatSelect,
  onChatDelete,
  expanded,
  titleMap,
  chatsLabel,
}: {
  activeNav: "home" | "saved" | "discover";
  homeChats: SidebarChatItem[];
  onChatSelect: (chat: SidebarChatItem) => void;
  onChatDelete: (chat: SidebarChatItem) => void;
  expanded: boolean;
  titleMap: Record<"home" | "saved" | "discover", string>;
  chatsLabel: string;
}) {
  return (
    <div
      className={`relative z-20 h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-out ${
        expanded ? "w-64" : "w-0"
      }`}
    >
      <aside
        className={`flex h-full w-64 flex-col border-r border-white/8 bg-[linear-gradient(180deg,rgba(18,22,30,0.82)_0%,rgba(12,16,24,0.74)_100%)] text-white backdrop-blur-2xl transition-opacity duration-200 ease-out ${
            expanded
            ? "opacity-100 shadow-[10px_0_34px_-22px_rgba(0,0,0,0.36)]"
            : "pointer-events-none opacity-0 shadow-none"
          }`}
      >
        <div
          className={`flex items-center justify-between border-b px-6 pb-4 pt-6 transition-colors duration-200 ${
            expanded ? "border-white/8" : "border-transparent"
          }`}
        >
          <h2 className={`text-lg font-semibold text-white/90 transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}>
            {titleMap[activeNav]}
          </h2>
          <button
            className={`text-white/48 transition-opacity duration-200 hover:text-white/82 ${expanded ? "opacity-100" : "opacity-0"}`}
            type="button"
          >
            <IconSearch />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-4 transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}>
          <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/28">{chatsLabel}</div>
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
                        ? "border border-white/12 bg-white/[0.05] text-white shadow-[0_10px_24px_-18px_rgba(0,0,0,0.45)] backdrop-blur-md"
                        : "text-white/54 hover:bg-white/[0.04] hover:text-white/86"
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
                            ? "text-white/64 hover:bg-white/[0.08] hover:text-white"
                            : "text-white/24 opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] hover:text-red-300"
                        }`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onChatDelete(chat);
                        }}
                        type="button"
                      >
                        <IconTrash />
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

function DestinationCard({
  title,
  locationLabel,
  media,
  seasonLabel,
  exploreLabel,
  active = false,
  compact = false,
  onExplore,
  onSelect,
  footerControls,
}: {
  title: string;
  locationLabel: string;
  media: React.ReactNode;
  seasonLabel: string;
  exploreLabel: string;
  active?: boolean;
  compact?: boolean;
  onExplore?: () => void;
  onSelect?: () => void;
  footerControls: React.ReactNode;
}) {
  return (
    <article
      className={`flex flex-col transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        compact ? "gap-3" : "gap-4"
      } ${active ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.965] opacity-90"}`}
    >
      <h2
        className={`text-center font-medium tracking-tight text-gray-900 [font-family:var(--font-search-serif),serif] ${
          compact ? "text-[22px] xl:text-[26px]" : "text-[32px] xl:text-[38px]"
        }`}
      >
        {title}
      </h2>

      <div
        className={`group relative flex flex-col overflow-hidden bg-black ring-1 ring-black/5 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          compact
            ? "aspect-[1.22/1] min-h-[268px] rounded-[18px] shadow-[0_14px_28px_-18px_rgba(0,0,0,0.16)]"
            : "aspect-[1.88/1] min-h-[100px] rounded-[22px] shadow-[0_10px_18px_-18px_rgba(0,0,0,0.12)]"
        } ${onSelect ? "cursor-pointer" : ""}`}
        onClick={onSelect}
      >
        <div className={`absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent ${compact ? "h-10 px-3.5" : "h-12 px-4.5"}`}>
          <span className={`${compact ? "text-[12px]" : "text-[14px]"} font-medium tracking-wide text-white/90 drop-shadow-md`}>{locationLabel}</span>
          <div className="flex gap-1.5">
            <div className={`${compact ? "h-2 w-2" : "h-2.5 w-2.5"} rounded-full bg-white/30 backdrop-blur-sm`} />
            <div className={`${compact ? "h-2 w-2" : "h-2.5 w-2.5"} rounded-full bg-white/30 backdrop-blur-sm`} />
            <div className={`${compact ? "h-2 w-2" : "h-2.5 w-2.5"} rounded-full bg-white/30 backdrop-blur-sm`} />
          </div>
        </div>

        <div className="absolute inset-0 z-0">{media}</div>
        <div className="z-10 flex-1" />

        <div className={`relative z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent ${compact ? "px-3.5 pb-3 pt-7" : "px-4 pb-3.5 pt-9"}`}>
          {footerControls}
        </div>
      </div>

      <div className={`mt-0.5 flex items-center justify-between ${compact ? "px-1" : "px-1.5"}`}>
        <div className="flex items-center gap-2">
          <span className={`flex rounded-full bg-emerald-500 ${compact ? "h-2 w-2" : "h-2.5 w-2.5"}`} />
          <span className={`${compact ? "text-[10px]" : "text-[11px]"} font-medium uppercase tracking-[0.12em] text-gray-500`}>{seasonLabel}</span>
        </div>
        <button
          className={`group flex items-center gap-2 rounded-full border border-gray-200 bg-white font-medium text-gray-800 transition-all hover:border-gray-300 hover:shadow-sm ${
            compact ? "px-3 py-1.5 text-[11px]" : "px-4 py-1.5 text-[13px]"
          }`}
          onClick={onExplore}
          type="button"
        >
          {exploreLabel}
          <IconArrowRight />
        </button>
      </div>
    </article>
  );
}

type WeaveSearchResultsPageProps = {
  query: string;
};

export function WeaveSearchResultsPage({ query }: WeaveSearchResultsPageProps) {
  const router = useRouter();
  const { wrapperStyle } = useAdaptivePageScale();
  const [language, setLanguage] = useState<WeaveLanguage>("EN");
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const hokkaidoVideoRef = useRef<HTMLVideoElement | null>(null);
  const finlandVideoRef = useRef<HTMLVideoElement | null>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [activeNav, setActiveNav] = useState<"home" | "saved" | "discover">("home");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [homeChats, setHomeChats] = useState<SidebarChatItem[]>([]);
  const [activeDestinationIndex, setActiveDestinationIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [followUpValue, setFollowUpValue] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(24);
  const [shouldLoadHokkaidoVideo, setShouldLoadHokkaidoVideo] = useState(true);
  const [finlandPlaying, setFinlandPlaying] = useState(false);
  const [finlandMuted, setFinlandMuted] = useState(true);
  const [finlandCurrentTime, setFinlandCurrentTime] = useState(0);
  const [finlandDuration, setFinlandDuration] = useState(24);
  const [shouldLoadFinlandVideo, setShouldLoadFinlandVideo] = useState(true);
  const [fullscreenDestination, setFullscreenDestination] = useState<"hokkaido" | "finland" | null>(null);
  const [fullscreenMuted, setFullscreenMuted] = useState(true);
  const normalizedQuery = query.trim() || "I'm looking to see some beautiful winter scenery. Where do you recommend?";

  useEffect(() => {
    setLanguage(getStoredWeaveLanguage());

    const handleLanguageChange = (event: Event) => {
      const nextLanguage = (event as CustomEvent<WeaveLanguage>).detail ?? getStoredWeaveLanguage();
      setLanguage(nextLanguage);
    };

    window.addEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange);
    return () => window.removeEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  const searchUiLabels = useMemo(() => {
    if (language === "JA") {
      return {
        nav: {
          home: "ホーム",
          saved: "保存済み",
          discover: "発見",
        },
        chats: "チャット",
        browseTitle: "冬の雰囲気を探す",
        destinationTitles: {
          hokkaido: "北海道・JP",
          finland: "フィンランド",
        },
        locationLabels: {
          hokkaido: "小樽",
          finland: "フィンランド",
        },
        highSeason: "ハイシーズン",
        exploreDestination: "目的地を探る",
        replyPlaceholder: "返信...",
        discoveryDisclaimer: "AI生成による発見 • 不正確な情報が含まれる場合があります",
        generateTravelMemory: "旅の記憶を生成",
        webSearch: "ウェブ検索",
      } as const;
    }

    if (language === "ZH") {
      return {
        nav: {
          home: "主页",
          saved: "已保存",
          discover: "发现",
        },
        chats: "聊天",
        browseTitle: "浏览冬季氛围",
        destinationTitles: {
          hokkaido: "北海道・日本",
          finland: "芬兰",
        },
        locationLabels: {
          hokkaido: "小樽",
          finland: "芬兰",
        },
        highSeason: "旺季",
        exploreDestination: "探索目的地",
        replyPlaceholder: "回复...",
        discoveryDisclaimer: "AI 生成内容 • 可能包含不准确信息",
        generateTravelMemory: "生成旅行记忆",
        webSearch: "网络搜索",
      } as const;
    }

    return {
      nav: { home: "Home", saved: "Saved", discover: "Discover" },
      chats: "Chats",
      browseTitle: "Browse winter atmospheres",
      destinationTitles: {
        hokkaido: "Hokkaido, JP",
        finland: "Finland",
      },
      locationLabels: {
        hokkaido: "Otaru",
        finland: "Finland",
      },
      highSeason: "High Season",
      exploreDestination: "Explore destination",
      replyPlaceholder: "Reply...",
      discoveryDisclaimer: "AI-GENERATED DISCOVERY • MIGHT CONTAIN INACCURACIES",
      generateTravelMemory: "Generate travel memory",
      webSearch: "Web search",
    } as const;
  }, [language]);

  const fullscreenDossiers = {
    hokkaido: {
      title: "Otaru",
      series: "Weave Dossier",
      episode: "Episode 01",
      headline: "Winter Rail & Canal Memory",
      intro: "The Winter Charm of Hokkaido: Sapporo & Otaru",
      introBody:
        "Otaru is one of Hokkaido?s most iconic port towns, known for its retro canal, stone warehouses, and nostalgic atmosphere. In winter, the city is wrapped in snow, creating a romantic mood, while at night it comes alive with dazzling illuminations and a food scene that rivals any major city.",
      src: HOKKAIDO_VIDEO_SRC,
      spots: [
        {
          label: "Otaru City Center & Around Otaru Station",
          title: "Otaru Spot",
          description:
            "The snowy scenery and passing trains perfectly capture the winter spirit of Hokkaido. Around the historic JR Otaru Station, there is a nostalgic atmosphere that reflects the town?s slow pace and rich history.",
          image: "/dossier/otaru-spot.svg",
        },
        {
          label: "Funamizaka",
          title: "Funamizaka Spot",
          description:
            "One of Otaru?s most famous slopes, Funamizaka is also known as a filming location for the movie Love Letter. From the top of the hill, you can look straight down the road toward Otaru Port, with the town spreading out below. In winter, the snow-covered view feels almost cinematic.",
          image: "/dossier/funamizaka-spot.svg",
        },
        {
          label: "Susukino Intersection",
          title: "Susukino Intersection",
          description:
            "The heart of Susukino, Sapporo?s largest entertainment district. The iconic NIKKA WHISKY neon sign lights up the area, while countless restaurants, bars, and shops fill the surrounding streets. It is one of the best places to experience the lively energy of Sapporo at night.",
          image: "/dossier/susukino-intersection.svg",
        },
        {
          label: "Moiwa Night View",
          title: "Moiwa Night View",
          description:
            "The night view from Mount Moiwa is considered one of Japan?s New Three Great Night Views. After taking the ropeway to the summit, you can enjoy a 360-degree panorama of Sapporo, where the snow-covered city sparkles like jewels below.",
          image: "/dossier/moiwa-night-view.svg",
        },
        {
          label: "Shiroi Koibito Soft Serve",
          title: "Shiroi Koibito Soft Serve",
          description:
            "Shiroi Koibito is one of Hokkaido?s most famous souvenirs. The soft serve ice cream, made with the same white chocolate and Hokkaido milk, is known for its rich, smooth, and creamy flavor.",
          image: "/dossier/shiroi-koibito-soft-serve.svg",
        },
        {
          label: "Unaju",
          title: "Unaju Dish",
          description:
            "Unaju is a beloved dish enjoyed throughout Japan. Grilled with a fragrant sweet-savory sauce, the eel is crispy on the outside and tender on the inside. Served over warm rice, it is a luxurious meal that gently restores your energy during a trip.",
          image: "/dossier/unaju-dish.svg",
        },
        {
          label: "Jingisukan",
          title: "Jingisukan Dish",
          description:
            "A signature local dish of Hokkaido, Jingisukan features lamb and vegetables grilled on a special dome-shaped pan. The meat is tender and juicy, and pairs perfectly with the savory sauce. It is one of the must-try dishes when visiting Hokkaido.",
          image: "/dossier/jingisukan-dish.svg",
        },
        {
          label: "Original Sapporo Ramen Alley",
          title: "Ramen Alley",
          description:
            "Sapporo is known as the birthplace of miso ramen. In the narrow lane known as Ramen Alley, long-established shops preserve a nostalgic Showa-era atmosphere. On a snowy night, a steaming hot bowl of ramen here feels especially unforgettable.",
          image: "/dossier/ramen-alley.svg",
        },
        {
          label: "Odori Park & Sapporo TV Tower",
          title: "Odori Park and Sapporo TV Tower",
          description:
            "Stretching through the center of Sapporo, Odori Park is both a place of relaxation for locals and a venue for many major events. During the Sapporo White Illumination, the entire park glows with lights, and the TV Tower shines beautifully above the scene. In winter, the Sapporo Snow Festival is also held here, making it one of the most symbolic places to experience the season in Sapporo.",
          image: "/dossier/odori-park-and-sapporo-tv-tower.svg",
        },
      ],
    },
    finland: {
      title: "Finland",
      series: "Weave Dossier",
      episode: "Episode 02",
      headline: "The Winter Atmosphere of Finland: Lapland & Helsinki",
      intro: "The Winter Atmosphere of Finland: Lapland & Helsinki",
      introBody:
        "Finland in winter offers a different kind of rhythm ? quieter, colder, and more spacious. From snowy ski landscapes and northern lights to warm local dishes and festive city markets, it is a destination where winter feels both cinematic and deeply lived-in.",
      src: FINLAND_VIDEO_SRC,
      spots: [
        {
          label: "Ski Resort Landscape",
          title: "Finland Spot",
          description:
            "Snowy slopes, ski lifts, and pale northern light come together to create the calm resort atmosphere of Lapland. The open landscape and quiet air make it one of the most peaceful ways to enter the Finnish winter.",
          image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=800&q=80",
        },
        {
          label: "Northern Lights",
          title: "Aurora Spot",
          description:
            "The aurora is one of Finland's most iconic winter sights. Across the dark northern sky, waves of green light move over mountain ridges and forests, creating a view that feels both natural and surreal.",
          image: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=800&q=80",
        },
        {
          label: "Salmon Soup",
          title: "Salmon Soup Dish",
          description:
            "A classic Finnish comfort food, salmon soup is known for its creamy texture and gentle flavor. Made with salmon, vegetables, and dill, it is a simple but deeply satisfying dish for cold days.",
          image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
        },
        {
          label: "Snow-Covered Village",
          title: "Winter Village View",
          description:
            "As daylight fades, the village lights begin to glow across the snow. Cabins, roads, and rooftops soften into a quiet winter scene that feels intimate and still.",
          image: "/guide/winter-village-view.jpg",
        },
        {
          label: "Santa Claus Village",
          title: "Santa Claus Village",
          description:
            "A well-known stop in Lapland, Santa Claus Village blends festive charm with northern winter scenery. Snow, warm lights, and holiday decoration create a cheerful and memorable seasonal atmosphere.",
          image: "/guide/santa-claus-village.png",
        },
        {
          label: "Helsinki Christmas Market",
          title: "Helsinki Christmas Market",
          description:
            "Held in front of Helsinki Cathedral, this Christmas market brings together lights, food, local crafts, and a classic carousel. It is one of the most atmospheric winter scenes in the capital.",
          image: "/guide/helsinki-christmas-market.jpg",
        },
        {
          label: "Winter Festival Performance",
          title: "Seasonal Celebration",
          description:
            "Public performances and winter gatherings add movement and energy to Finland's colder season. They reflect a social side of winter that feels festive without losing its northern calm.",
          image: "/guide/seasonal-celebration.jpg",
        },
      ],
    },
  } as const;

  const localizedFullscreenDossiers = useMemo(() => {
    if (language === "EN") {
      return fullscreenDossiers;
    }

    if (language === "JA") {
      return {
        hokkaido: {
          ...fullscreenDossiers.hokkaido,
          title: "小樽",
          headline: "冬の鉄道と運河の記憶",
          intro: "北海道の冬の魅力：札幌と小樽",
          introBody:
            "小樽は北海道を代表する港町のひとつで、レトロな運河、石造りの倉庫群、そしてノスタルジックな雰囲気で知られています。冬になると街は雪に包まれロマンチックな空気が漂い、夜になると美しいイルミネーションと、大都市に匹敵するほど充実したグルメシーンが楽しめます。",
          spots: [
            { ...fullscreenDossiers.hokkaido.spots[0], label: "小樽市街地・小樽駅周辺", title: "小樽スポット", description: "雪景色と行き交う列車が、北海道の冬の情緒を映し出しています。歴史ある JR 小樽駅周辺には、町のゆったりとした歩みと豊かな歴史を感じさせるノスタルジックな雰囲気が漂っています。" },
            { ...fullscreenDossiers.hokkaido.spots[1], label: "船見坂", title: "船見坂スポット", description: "小樽でもっとも有名な坂のひとつ、船見坂は映画『Love Letter』のロケ地としても知られています。坂の上から小樽港へと続く道を見下ろすと、街が眼下に広がります。冬には雪化粧した景色がまるで映画のワンシーンのようです。" },
            { ...fullscreenDossiers.hokkaido.spots[2], label: "すすきの交差点", title: "すすきの交差点", description: "札幌最大の歓楽街・すすきのの中心地。あの NIKKA WHISKY のネオンサインが街を彩り、周辺には数えきれないほどのレストラン、バー、ショップが軒を連ねています。夜の札幌の活気を体感できる最高の場所のひとつです。" },
            { ...fullscreenDossiers.hokkaido.spots[3], label: "藻岩山夜景", title: "藻岩山夜景", description: "藻岩山からの夜景は、日本新三大夜景のひとつに数えられています。ロープウェイで山頂へ上ると、雪に覆われた札幌の街が宝石のように輝く 360 度のパノラマを楽しめます。" },
            { ...fullscreenDossiers.hokkaido.spots[4], label: "白い恋人ソフトクリーム", title: "白い恋人ソフトクリーム", description: "白い恋人は北海道を代表するお土産のひとつ。ホワイトチョコレートと北海道産ミルクを使ったソフトクリームは、濃厚でなめらかな味わいが特徴です。" },
            { ...fullscreenDossiers.hokkaido.spots[5], label: "鰻重", title: "鰻重", description: "鰻重は日本全国で愛される一品。甘辛いタレで香ばしく焼き上げられた鰻は、外はパリッと中はふっくらとした食感。温かいご飯の上に盛られた鰻重は、旅の疲れをやさしく癒してくれる贅沢な一食です。" },
            { ...fullscreenDossiers.hokkaido.spots[6], label: "ジンギスカン", title: "ジンギスカン", description: "北海道を代表するご当地グルメ、ジンギスカンは羊肉と野菜を専用ドーム型の鍋で焼いていただきます。肉は柔らかくジューシーで、旨味たっぷりのタレとの相性も抜群。北海道を訪れた際にはぜひ味わっていただきたい一品です。" },
            { ...fullscreenDossiers.hokkaido.spots[7], label: "元祖さっぽろラーメン横丁", title: "ラーメン横丁", description: "味噌ラーメン発祥の地、札幌。ラーメン横丁と呼ばれる細い路地には、昭和の趣を残した老舗店が軒を連ねています。雪の降る夜、熱々の一杯は格別の味わいです。" },
            { ...fullscreenDossiers.hokkaido.spots[8], label: "大通公園・さっぽろテレビ塔", title: "大通公園・さっぽろテレビ塔", description: "札幌の中心部に広がる大通公園は、市民の憩いの場であり、数多くのイベント会場としても賑わいます。さっぽろホワイトイルミネーションの期間中は公園全体がライトアップされ、テレビ塔も美しく輝きます。冬には雪まつりも開催され、札幌の冬を彩る象徴的な場所のひとつです。" },
          ],
        },
        finland: {
          ...fullscreenDossiers.finland,
          title: "フィンランド",
          headline: "フィンランドの冬の情景：ラップランドとヘルシンキ",
          intro: "フィンランドの冬の情景：ラップランドとヘルシンキ",
          introBody:
            "冬のフィンランドは、より静かで、より冷たく、より広大なリズムを感じさせます。雪景色のスキー場やオーロラから、温かな郷土料理や賑やかな街のマーケットまで、ここは冬が映画的であると同時に、深く生活に根ざした場所です。",
          spots: [
            { ...fullscreenDossiers.finland.spots[0], label: "スキーリゾートの景色", title: "フィンランドスポット", description: "雪に覆われたゲレンデ、スキーリフト、そして淡い北の光が一体となり、ラップランドの静かなリゾートの雰囲気を作り出しています。広大な景色と静寂な空気は、フィンランドの冬への最高の入口です。" },
            { ...fullscreenDossiers.finland.spots[1], label: "オーロラ", title: "オーロラスポット", description: "オーロラはフィンランドの冬を代表する絶景のひとつ。暗い北の夜空に緑の光の波が山の稜線や森の上を揺れ動き、自然でありながらも幻想的な光景を生み出します。" },
            { ...fullscreenDossiers.finland.spots[2], label: "サーモンスープ", title: "サーモンスープ", description: "フィンランドを代表するあたたかい家庭料理、サーモンスープはクリーミーなテクスチャーとやさしい風味が特徴です。サーモン、野菜、そしてディルで作られたシンプルながら、寒い日に体の芯から温まる一品です。" },
            { ...fullscreenDossiers.finland.spots[3], label: "雪に覆われた村", title: "冬の村の風景", description: "夕暮れが近づくにつれ、村の灯りが雪の上に静かに広がります。コテージ、道路、屋根が柔らかく溶け込み、親密で穏やかな冬の情景を作り出しています。" },
            { ...fullscreenDossiers.finland.spots[4], label: "サンタクロース村", title: "サンタクロース村", description: "ラップランドのよく知られたスポット、サンタクロース村はフェスティブな雰囲気と北国の冬景色が調和した場所です。雪、温かな光、ホリデーの装飾が、楽しく印象的な季節の雰囲気を演出します。" },
            { ...fullscreenDossiers.finland.spots[5], label: "ヘルシンキ・クリスマスマーケット", title: "ヘルシンキ・クリスマスマーケット", description: "ヘルシンキ大聖堂前で開催されるこのクリスマスマーケットには、ライトアップ、フード、地元のクラフト、そてクラシックなメリーゴーランドが揃います。首都でもっとも雰囲気ある冬の風景のひとつです。" },
            { ...fullscreenDossiers.finland.spots[6], label: "冬のフェスティバルパフォーマンス", title: "季節の祝祭", description: "野外パフォーマンスや冬の集いは、フィンランドの寒い季節に動きと活気をもたらします。北国の静けさを失わずに、冬の社交的な側面を映し出しています。" },
          ],
        },
      } as const;
    }

    return {
      hokkaido: {
        ...fullscreenDossiers.hokkaido,
        title: "小樽",
        headline: "冬日铁路与运河记忆",
        intro: "北海道的冬日魅力：札幌与小樽",
        introBody:
          "小樽是北海道最具代表性的港口城镇之一，以复古运河、石砌仓库群和怀旧氛围著称。冬季，城市被白雪覆盖，浪漫气息弥漫，夜晚则在璀璨灯光与媲美大城市的美食文化中焕发生机。",
        spots: [
          { ...fullscreenDossiers.hokkaido.spots[0], label: "小樽市区·小樽站周边", title: "小樽景点", description: "雪景与往来列车完美呈现了北海道冬日的情韵。历史悠久的 JR 小樽站周边弥漫着一份怀旧气息，折射出这座小城从容的步调与深厚的历史底蕴。" },
          { ...fullscreenDossiers.hokkaido.spots[1], label: "船见坂", title: "船见坂景点", description: "船见坂是小樽最著名的坡道之一，同时也是电影《情书》的取景地。站在坡顶，视线沿着道路一直延伸至小樽港，城镇在脚下铺展开来。冬日里，被白雪覆盖的景色宛如电影画面般令人动容。" },
          { ...fullscreenDossiers.hokkaido.spots[2], label: "狸小路交叉口", title: "狸小路交叉口", description: "这里是札幌最大娱乐区薄野的核心地带。标志性的 NIKKA WHISKY 霓虹灯点亮了整片区域，周边餐厅、酒吧和商店林立。这是夜晚感受札幌活力的最佳去处之一。" },
          { ...fullscreenDossiers.hokkaido.spots[3], label: "藻岩山夜景", title: "藻岩山夜景", description: "从藻岩山俯瞰的夜景被列为日本新三大夜景之一。乘坐缆车登顶后，可以欣赏到360度的全景，雪覆之下的札幌城市如宝石般闪耀。" },
          { ...fullscreenDossiers.hokkaido.spots[4], label: "白色恋人软冰淇淋", title: "白色恋人软冰淇淋", description: "白色恋人是北海道最有名的伴手礼之一。以同款白巧克力与北海道牛奶制成的软冰淇淋，以其浓郁、顺滑、奶香十足的口感而广受喜爱。" },
          { ...fullscreenDossiers.hokkaido.spots[5], label: "鳗鱼饭", title: "鳗鱼饭", description: "鳗鱼饭是日本各地深受喜爱的佳肴。以香甜咸鲜的酱汁烤制的鳗鱼，外皮酥脆、内里鲜嫩，盛于温热的米饭之上，是一道在旅途中温柔滋养身心的奢华享受。" },
          { ...fullscreenDossiers.hokkaido.spots[6], label: "成吉思汗烤肉", title: "成吉思汗烤肉", description: "成吉思汗烤肉是北海道的标志性地方料理，以羊肉和蔬菜在特制圆顶铁锅上烧烤而成。肉质鲜嫩多汁，与香浓酱汁搭配绝妙，是来北海道必尝的美食之一。" },
          { ...fullscreenDossiers.hokkaido.spots[7], label: "元祖札幌拉面横丁", title: "拉面横丁", description: "札幌是味噌拉面的发祥地。在这条被称为拉面横丁的狭窄小巷里，老字号店铺保留着昭和时代的怀旧氛围。雪夜里，捧着一碗热气腾腾的拉面，格外令人难忘。" },
          { ...fullscreenDossiers.hokkaido.spots[8], label: "大通公园·札幌电视塔", title: "大通公园·札幌电视塔", description: "贯穿札幌市中心的大通公园，既是市民休闲的场所，也是各类大型活动的举办地。札幌白色彩灯节期间，整个公园灯火通明，电视塔在上空熠熠生辉。冬季，这里还举办闻名遐迩的札幌雪祭，是感受冬日札幌最具代表性的地方之一。" },
        ],
      },
      finland: {
        ...fullscreenDossiers.finland,
        title: "芬兰",
        headline: "芬兰冬日氛围：拉普兰与赫尔辛基",
        intro: "芬兰冬日氛围：拉普兰与赫尔辛基",
        introBody:
          "冬日的芬兰，节奏更宁静、气候更寒冷、空间更辽阔。从白雪皑皑的滑雪景致与极光，到温暖的地方料理与热闹的城市市集，这是一个让冬天既如电影般唯美、又深深融入日常生活的目的地。",
        spots: [
          { ...fullscreenDossiers.finland.spots[0], label: "滑雪场景色", title: "芬兰景点", description: "白雪覆盖的山坡、滑雪缆车与苍白的北方光线交织在一起，勾勒出拉普兰冬日度假区的宁静氛围。开阔的地景与清冽的空气，是走进芬兰冬天最平和的方式。" },
          { ...fullscreenDossiers.finland.spots[1], label: "极光", title: "极光景点", description: "极光是芬兰冬季最具标志性的景致之一。在漆黑的北方夜空中，一道道绿色光波跃过山脊与林间，营造出一种既自然又超现实的震撼视觉。" },
          { ...fullscreenDossiers.finland.spots[2], label: "三文鱼汤", title: "三文鱼汤", description: "三文鱼汤是芬兰经典的暖心料理，以奶滑的质地和清雅的风味著称。由三文鱼、蔬菜和莳萝制成，简单却在寒冷天气里令人深感满足。" },
          { ...fullscreenDossiers.finland.spots[3], label: "白雪覆盖的村庄", title: "冬日村庄景色", description: "随着暮色降临，村庄的灯光开始在白雪上隐约闪烁。木屋、道路与屋顶在静谧中融为一体，呈现出一幅温馨而沉静的冬日画面。" },
          { ...fullscreenDossiers.finland.spots[4], label: "圣诞老人村", title: "圣诞老人村", description: "拉普兰著名的圣诞老人村，将节日气息与北国冬日景色融为一体。白雪、暖光与节日装饰共同营造出欢乐而令人难忘的季节氛围。" },
          { ...fullscreenDossiers.finland.spots[5], label: "赫尔辛基圣诞市集", title: "赫尔辛基圣诞市集", description: "在赫尔辛基大教堂前举办的圣诞市集，汇聚了灯饰、美食、本地工艺品与经典旋转木马，是首都最具冬日情调的场景之一。" },
          { ...fullscreenDossiers.finland.spots[6], label: "冬季节日表演", title: "季节庆典", description: "公共表演与冬日聚会为芬兰寒冷的季节注入了活力与生气，展现了这里在北国宁静之外同样热烈的社交面貌。" },
        ],
      },
    } as const;
  }, [language, fullscreenDossiers]);

  const dossierUiLabels =
    language === "JA"
      ? {
          guide: "AIキュレーション旅行ガイド",
          highlights: "厳選ハイライト",
          routeSignal: "ルートシグナル",
          openGuide: "全ガイドを開く",
          mute: "ミュート",
          unmute: "ミュート解除",
        }
      : language === "ZH"
        ? {
            guide: "AI 精选旅行指南",
            highlights: "精选亮点",
            routeSignal: "路线信号",
            openGuide: "打开完整指南",
            mute: "静音",
            unmute: "取消静音",
          }
        : {
            guide: "AI-Curated Travel Guide",
            highlights: "Curated Highlights",
            routeSignal: "Route Signal",
            openGuide: "Open Full Guide",
            mute: "Mute",
            unmute: "Unmute",
          };

  const activeFullscreenDossier = fullscreenDestination
    ? localizedFullscreenDossiers[fullscreenDestination]
    : null;

  const hokkaidoProgress = useMemo(() => {
    if (!duration) {
      return 0;
    }
    return Math.max(0, Math.min(100, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const togglePlayback = () => {
    if (activeDestinationIndex !== 0) {
      return;
    }
    const video = hokkaidoVideoRef.current;
    if (!video) {
      setShouldLoadHokkaidoVideo(true);
      return;
    }

    if (video.paused) {
      void video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        void video.play().catch(() => {});
      });
    } else {
      video.pause();
    }
  };

  const toggleMuted = () => {
    const video = hokkaidoVideoRef.current;
    if (!video) {
      return;
    }
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const finlandProgress = useMemo(() => {
    if (!finlandDuration) {
      return 0;
    }
    return Math.max(0, Math.min(100, (finlandCurrentTime / finlandDuration) * 100));
  }, [finlandCurrentTime, finlandDuration]);

  const toggleFinlandPlayback = () => {
    if (activeDestinationIndex !== 1) {
      return;
    }
    const video = finlandVideoRef.current;
    if (!video) {
      setShouldLoadFinlandVideo(true);
      return;
    }

    if (video.paused) {
      void video.play().catch(() => {
        video.muted = true;
        setFinlandMuted(true);
        void video.play().catch(() => {});
      });
    } else {
      video.pause();
    }
  };

  const toggleFinlandMuted = () => {
    const video = finlandVideoRef.current;
    if (!video) {
      return;
    }
    video.muted = !video.muted;
    setFinlandMuted(video.muted);
  };

  const handleFinlandProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = finlandVideoRef.current;
    if (!video || !finlandDuration) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    video.currentTime = Math.max(0, Math.min(finlandDuration, ratio * finlandDuration));
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = hokkaidoVideoRef.current;
    if (!video || !duration) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    video.currentTime = Math.max(0, Math.min(duration, ratio * duration));
  };

  const submitFollowUp = () => {
    const nextQuery = followUpValue.trim();
    if (!nextQuery) {
      return;
    }
    setHomeChats(addSearchSidebarChat(nextQuery));
    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
  };

  const handleSidebarChatSelect = (chat: SidebarChatItem) => {
    router.push(chat.href);
  };

  const handleSidebarChatDelete = (chat: SidebarChatItem) => {
    setHomeChats(removeHomeSidebarChat(chat));
  };

  const selectDestination = (index: number) => {
    setActiveDestinationIndex(index);
  };

  const openFullscreenDossier = (destination: "hokkaido" | "finland") => {
    setFullscreenMuted(true);
    if (destination === "hokkaido") {
      setShouldLoadHokkaidoVideo(true);
    } else {
      setShouldLoadFinlandVideo(true);
    }
    setFullscreenDestination(destination);
  };

  const handleShowcaseTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleShowcaseTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) {
      return;
    }
    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const delta = endX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(delta) < 40) {
      return;
    }

    setActiveDestinationIndex((current) => {
      if (delta < 0) {
        return Math.min(1, current + 1);
      }
      return Math.max(0, current - 1);
    });
  };

  const renderCardMedia = (destinationId: "hokkaido" | "finland", active: boolean) => {
    if (destinationId === "hokkaido") {
      if (active) {
        return (
          <>
            <video
              ref={hokkaidoVideoRef}
              className="h-full w-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-[1.035]"
              autoPlay={!isMobileViewport}
              loop
              muted
              onLoadedData={(event) => {
                primeVideoCover(event.currentTarget);
                setDuration(event.currentTarget.duration || 24);
                setCurrentTime(event.currentTarget.currentTime);
                setIsMuted(event.currentTarget.muted);
              }}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
              playsInline
              preload={isMobileViewport ? "metadata" : "auto"}
              poster="/preview/hokkaido-first-frame.jpg"
              src={HOKKAIDO_VIDEO_SRC}
            />
            <div className="absolute inset-0 bg-black/10" />
          </>
        );
      }

      return (
        <>
          <img
            alt="Hokkaido preview cover"
            className="h-full w-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-[1.02]"
            src="/preview/hokkaido-first-frame.jpg"
          />
          <div className="absolute inset-0 bg-black/12" />
        </>
      );
    }

    if (active) {
      return (
        <>
          <video
            ref={finlandVideoRef}
            className="h-full w-full object-cover opacity-92 transition-transform duration-700 group-hover:scale-[1.035]"
            autoPlay={!isMobileViewport}
            loop
            muted
            onLoadedData={(event) => {
              primeVideoCover(event.currentTarget);
              setFinlandDuration(event.currentTarget.duration || 24);
              setFinlandCurrentTime(event.currentTarget.currentTime);
              setFinlandMuted(event.currentTarget.muted);
            }}
            onPause={() => setFinlandPlaying(false)}
            onPlay={() => setFinlandPlaying(true)}
            onTimeUpdate={(event) => setFinlandCurrentTime(event.currentTarget.currentTime)}
            playsInline
            preload={isMobileViewport ? "metadata" : "auto"}
            poster="/preview/finland-first-frame.jpg"
            src={FINLAND_VIDEO_SRC}
          />
          <div className="absolute inset-0 bg-black/10" />
        </>
      );
    }

      return (
        <>
          <img
            alt="Finland preview cover"
            className="h-full w-full object-cover opacity-92 transition-transform duration-700 group-hover:scale-[1.02]"
            src="/preview/finland-first-frame.jpg"
          />
          <div className="absolute inset-0 bg-black/12" />
        </>
      );
  };

  const renderCardFooterControls = (destinationId: "hokkaido" | "finland", active: boolean) => {
    if (destinationId === "hokkaido") {
      return (
        <div className="flex items-center gap-4 text-white">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30"
            onClick={active ? togglePlayback : undefined}
            type="button"
          >
            {active ? <>{isPlaying ? <IconPause className="h-[15px] w-[15px]" /> : <IconPlay className="h-[15px] w-[15px]" />}</> : <IconPlay className="h-[15px] w-[15px]" />}
          </button>
          <span className="font-mono text-[13px] font-medium opacity-80">{formatTime(active ? currentTime : 0)}</span>
          <div
            className={`group/bar relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/20 ${active ? "cursor-pointer" : ""}`}
            onClick={active ? handleProgressClick : undefined}
          >
            <div className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${active ? hokkaidoProgress : 0}%` }}>
              <div className="absolute right-0 top-1/2 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/bar:opacity-100" />
            </div>
          </div>
          <span className="font-mono text-[13px] font-medium opacity-80">{formatTime(duration)}</span>
          <button className="opacity-80 transition hover:opacity-100" onClick={active ? toggleMuted : undefined} type="button">
            <IconVolume muted={active ? isMuted : true} />
          </button>
          <button className="ml-1 opacity-80 transition hover:opacity-100" type="button">
            <span
              onClick={(event) => {
                event.stopPropagation();
                openFullscreenDossier("hokkaido");
              }}
            >
              <IconExpand />
            </span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4 text-white">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30"
          onClick={active ? toggleFinlandPlayback : undefined}
          type="button"
        >
          {active ? <>{finlandPlaying ? <IconPause className="h-[15px] w-[15px]" /> : <IconPlay className="h-[15px] w-[15px]" />}</> : <IconPlay className="h-[15px] w-[15px]" />}
        </button>
        <span className="font-mono text-[13px] font-medium opacity-80">{formatTime(active ? finlandCurrentTime : 0)}</span>
        <div
          className={`group/bar relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/20 ${active ? "cursor-pointer" : ""}`}
          onClick={active ? handleFinlandProgressClick : undefined}
        >
          <div className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${active ? finlandProgress : 0}%` }}>
            <div className="absolute right-0 top-1/2 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/bar:opacity-100" />
          </div>
        </div>
        <span className="font-mono text-[13px] font-medium opacity-80">{formatTime(finlandDuration)}</span>
        <button className="opacity-80 transition hover:opacity-100" onClick={active ? toggleFinlandMuted : undefined} type="button">
          <IconVolume muted={active ? finlandMuted : true} />
        </button>
        <button className="ml-1 opacity-80 transition hover:opacity-100" type="button">
          <span
            onClick={(event) => {
              event.stopPropagation();
              openFullscreenDossier("finland");
            }}
          >
            <IconExpand />
          </span>
        </button>
      </div>
    );
  };

  const destinations = [
    {
      id: "hokkaido",
      title: searchUiLabels.destinationTitles.hokkaido,
      locationLabel: searchUiLabels.locationLabels.hokkaido,
      seasonLabel: searchUiLabels.highSeason,
      exploreLabel: searchUiLabels.exploreDestination,
      onExplore: () => router.push("/home/guides/sapporo-otaru-winter-guide"),
    },
    {
      id: "finland",
      title: searchUiLabels.destinationTitles.finland,
      locationLabel: searchUiLabels.locationLabels.finland,
      seasonLabel: searchUiLabels.highSeason,
      exploreLabel: searchUiLabels.exploreDestination,
      onExplore: () => undefined,
    },
  ] as const;

  const activeFullscreenPoster =
    fullscreenDestination === "finland"
      ? "/preview/finland-first-frame.jpg"
      : "/preview/hokkaido-first-frame.jpg";

  useEffect(() => {
    if (!fullscreenDestination) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const video = fullscreenVideoRef.current;
      if (!video) {
        return;
      }

      primeVideoCover(video);
      void video.play().catch(() => {
        video.muted = true;
        setFullscreenMuted(true);
        void video.play().catch(() => {});
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [fullscreenDestination]);

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-[#F8F9FA] antialiased"
    >
      <div className="hidden text-gray-900 md:flex" style={wrapperStyle}>
        <aside className="relative z-20 flex h-full w-[90px] shrink-0 flex-col items-center border-r border-white/10 bg-[linear-gradient(180deg,rgba(34,38,46,0.48)_0%,rgba(26,30,38,0.40)_100%)] py-6 text-white backdrop-blur-xl shadow-[6px_0_28px_-20px_rgba(0,0,0,0.16)]">
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
              onClick={() => {
                setHomeChats(addNewSidebarChat());
                router.push("/home");
              }}
              type="button"
            >
              <IconPlus />
            </button>
          </div>

          <nav className="mt-10 flex w-full flex-1 flex-col items-center gap-7">
            <button onClick={() => setActiveNav("saved")} type="button">
              <SidebarNavItem active={activeNav === "saved"} icon={<IconStar />} label={searchUiLabels.nav.saved} />
            </button>
            <button onClick={() => setActiveNav("home")} type="button">
              <SidebarNavItem active={activeNav === "home"} icon={<IconSearch />} label={searchUiLabels.nav.home} />
            </button>
            <button onClick={() => setActiveNav("discover")} type="button">
              <SidebarNavItem active={activeNav === "discover"} icon={<IconCompass />} label={searchUiLabels.nav.discover} />
            </button>
          </nav>
        </aside>
        <ExpandedSidebar
          activeNav={activeNav}
          chatsLabel={searchUiLabels.chats}
          expanded={sidebarExpanded}
          homeChats={homeChats}
          onChatDelete={handleSidebarChatDelete}
          onChatSelect={handleSidebarChatSelect}
          titleMap={searchUiLabels.nav}
        />

        {activeNav === "saved" ? (
          <SavedTripsView />
        ) : activeNav === "discover" ? (
          <DiscoverJournalView />
        ) : (
        <main className="relative flex flex-1 flex-col overflow-hidden">
          <header className="h-2 w-full shrink-0 px-10 pt-2" />

          <div className="flex-1 overflow-hidden px-8 pb-20 pt-0">
            <div className="mx-auto flex h-full max-w-[1360px] flex-col justify-start pt-6 transition-all duration-[1100ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]">
              <div className="mb-1.5 flex items-end justify-between px-6">
                <div>
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-gray-400">
                    Destination Comparison
                  </p>
                  <h2 className="text-[24px] font-medium tracking-tight text-gray-900 [font-family:var(--font-search-serif),serif]">
                    {searchUiLabels.browseTitle}
                  </h2>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-2">
                    {[0, 1].map((index) => (
                      <button
                        key={index}
                        aria-label={`Go to destination ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ${
                          activeDestinationIndex === index ? "w-8 bg-gray-900" : "w-2.5 bg-gray-300"
                        }`}
                        onClick={() => selectDestination(index)}
                        type="button"
                      />
                    ))}
                  </div>
                  <button
                    aria-label="Previous destination"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
                    onClick={() => selectDestination(Math.max(0, activeDestinationIndex - 1))}
                    type="button"
                  >
                    <IconBack />
                  </button>
                  <button
                    aria-label="Next destination"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
                    onClick={() => selectDestination(Math.min(1, activeDestinationIndex + 1))}
                    type="button"
                  >
                    <IconArrowRight />
                  </button>
                </div>
              </div>

              <div
                className="relative h-[100px] -translate-y-3 px-6 pb-0 pt-0"
                onTouchEnd={handleShowcaseTouchEnd}
                onTouchStart={handleShowcaseTouchStart}
              >
                {destinations.map((destination, index) => {
                  const isActiveDestination = activeDestinationIndex === index;

                return (
                  <div
                    key={destination.id}
                      className={`absolute transition-all duration-[720ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                        isActiveDestination
                          ? "left-14 right-[22rem] top-0 z-20 opacity-100"
                          : "right-0 top-[68px] z-10 w-[332px] opacity-100"
                      }`}
                    >
                      <DestinationCard
                        active={isActiveDestination}
                        compact={!isActiveDestination}
                        exploreLabel={destination.exploreLabel}
                        title={destination.title}
                        locationLabel={destination.locationLabel}
                        media={renderCardMedia(destination.id, isActiveDestination)}
                        onExplore={destination.onExplore}
                        onSelect={!isActiveDestination ? () => selectDestination(index) : undefined}
                        seasonLabel={destination.seasonLabel}
                        footerControls={renderCardFooterControls(destination.id, isActiveDestination)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent px-10 pb-3 pt-6">
            <div className="pointer-events-auto mx-auto max-w-[620px]">
              <WeavePromptBar
                className="rounded-[20px] border border-gray-300/80 bg-white/94 px-1 py-1 shadow-[0_6px_14px_rgba(0,0,0,0.03)]"
                compact
                inputClassName="text-[13px]"
                modelName="Weave"
                onChange={setFollowUpValue}
                onSubmit={submitFollowUp}
                placeholder={searchUiLabels.replyPlaceholder}
                showUtilityChips
                theme="light"
                value={followUpValue}
                generateTravelMemoryLabel={searchUiLabels.generateTravelMemory}
                webSearchLabel={searchUiLabels.webSearch}
              />
              <div className="mt-2 text-center">
                <p className="text-[10px] font-medium tracking-wide text-gray-400">AI-GENERATED DISCOVERY • MIGHT CONTAIN INACCURACIES</p>
              </div>
            </div>
          </div>
        </main>
        )}
      </div>

      <div className="h-full bg-[#f6f5f2] md:hidden">
        {activeNav === "saved" ? (
          <SavedTripsView />
        ) : activeNav === "discover" ? (
          <DiscoverJournalView />
        ) : (
        <div className="relative flex h-full flex-col overflow-hidden bg-[#f6f5f2] text-gray-900">
          <div className="flex-1 overflow-y-auto px-5 pb-[24rem] pt-10">
            <div className="mx-auto max-w-[360px]">
              <div className="mb-7 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <button
                    aria-label="Back to home"
                    className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-[#e3e6ec] bg-white/78 text-[#444851] shadow-[0_10px_20px_-18px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:border-[#d5d9e1] hover:bg-white"
                    onClick={() => router.push("/home")}
                    type="button"
                  >
                    <IconBack />
                  </button>
                  <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b3bac6]">
                    Destination Comparison
                  </p>
                  <h2 className="max-w-[220px] text-[34px] leading-[0.98] tracking-tight text-[#2f3138] [font-family:var(--font-search-serif),serif]">
                    {searchUiLabels.browseTitle}
                  </h2>
                  </div>
                </div>
                <div className="mb-2 flex items-center gap-1.5">
                  {destinations.map((destination, index) => (
                    <button
                      key={destination.id}
                      aria-label={`Go to destination ${index + 1}`}
                      className={`rounded-full transition-all ${
                        activeDestinationIndex === index ? "h-[6px] w-7 bg-[#1f2024]" : "h-[6px] w-[6px] bg-[#d4d8df]"
                      }`}
                      onClick={() => selectDestination(index)}
                      type="button"
                    />
                  ))}
                </div>
              </div>

              <h3 className="mb-5 text-center text-[26px] tracking-tight text-[#31333a] [font-family:var(--font-search-serif),serif]">
                {destinations[activeDestinationIndex]?.title}
              </h3>

              <div
                className="relative h-[322px] overflow-hidden"
                onTouchEnd={handleShowcaseTouchEnd}
                onTouchStart={handleShowcaseTouchStart}
                style={{ touchAction: "pan-y" }}
              >
                {destinations.map((destination, index) => {
                  const isActiveDestination = activeDestinationIndex === index;

                  return (
                    <div
                      key={destination.id}
                      className={`absolute top-0 transition-all duration-[720ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                        isActiveDestination
                          ? "left-0 z-20 w-[calc(100%-22px)] translate-x-0 opacity-100"
                          : index > activeDestinationIndex
                            ? "right-[-238px] z-10 w-[calc(100%-22px)] opacity-100"
                            : "left-[-238px] z-10 w-[calc(100%-22px)] opacity-0"
                      }`}
                    >
                      <article className="flex flex-col gap-4">
                        <div className="relative overflow-hidden rounded-[24px] bg-black shadow-[0_18px_46px_-28px_rgba(0,0,0,0.45)] ring-1 ring-black/6">
                          <div className="absolute inset-x-0 top-0 z-20 flex h-10 items-center justify-between bg-gradient-to-b from-black/40 to-transparent px-3.5">
                            <span className="rounded-[9px] bg-black/28 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/92 backdrop-blur-sm">
                              {destination.locationLabel}
                            </span>
                            <div className="flex gap-1.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-white/68" />
                              <div className="h-1.5 w-1.5 rounded-full bg-white/42" />
                              <div className="h-1.5 w-1.5 rounded-full bg-white/42" />
                            </div>
                          </div>

                          <div className="relative aspect-[1.16/1] overflow-hidden">
                            {renderCardMedia(destination.id, isActiveDestination)}
                          </div>

                          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-12">
                            {renderCardFooterControls(destination.id, isActiveDestination)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8f96a3]">{destination.seasonLabel}</span>
                          </div>
                          <button
                            className="group flex items-center gap-2 rounded-full border border-[#e1e3e8] bg-white px-5 py-3 text-[13px] font-medium text-[#40434c] shadow-[0_8px_20px_-16px_rgba(0,0,0,0.18)] transition hover:border-[#d0d4da]"
                            onClick={destination.onExplore}
                            type="button"
                          >
                            {destination.exploreLabel}
                            <IconArrowRight />
                          </button>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#f6f5f2] via-[#f6f5f2] to-transparent px-5 pb-28 pt-10">
            <div className="pointer-events-auto mx-auto max-w-[360px]">
              <WeavePromptBar
                className="rounded-[20px] border border-[#ececf0] bg-white px-1 py-1 shadow-[0_14px_30px_-22px_rgba(0,0,0,0.18)]"
                compact
                inputClassName="text-[15px] placeholder:text-[#a3a9b5]"
                modelName="Weave"
                onChange={setFollowUpValue}
                onSubmit={submitFollowUp}
                placeholder={searchUiLabels.replyPlaceholder}
                showUtilityChips
                showWebSearchChip={false}
                theme="light"
                value={followUpValue}
                generateTravelMemoryLabel={searchUiLabels.generateTravelMemory}
                webSearchLabel={searchUiLabels.webSearch}
              />
              <div className="mt-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#afb4bf]">{searchUiLabels.discoveryDisclaimer}</p>
              </div>
            </div>
          </div>
        </div>
        )}

        <nav className="pointer-events-auto fixed inset-x-0 bottom-7 z-40 flex justify-center px-6 md:hidden">
          <div className="flex w-full max-w-[376px] items-center rounded-[32px] border border-[#d9dde6] bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(246,245,242,0.92)_100%)] px-4 py-3 backdrop-blur-2xl shadow-[0_22px_50px_-28px_rgba(15,23,42,0.24)]">
            <button className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-[#a6acb7]" onClick={() => setActiveNav("home")} style={{ touchAction: "manipulation" }} type="button">
              <div className={`flex h-11 w-11 items-center justify-center rounded-[18px] transition-colors ${activeNav === "home" ? "border border-[#d9dde6] bg-white text-[#202228] shadow-[0_10px_20px_-16px_rgba(0,0,0,0.18)]" : "text-[#a6acb7]"}`}>
                <IconSearch />
              </div>
              <span className={`text-[10px] font-medium ${activeNav === "home" ? "text-[#202228]" : "text-[#a6acb7]"}`}>{searchUiLabels.nav.home}</span>
            </button>
            <button className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-[#a6acb7]" onClick={() => setActiveNav("saved")} style={{ touchAction: "manipulation" }} type="button">
              <div className={`flex h-11 w-11 items-center justify-center rounded-[18px] transition-colors ${activeNav === "saved" ? "border border-[#d9dde6] bg-white text-[#202228] shadow-[0_10px_20px_-16px_rgba(0,0,0,0.18)]" : "text-[#a6acb7]"}`}>
                <IconStar />
              </div>
              <span className={`text-[10px] font-medium ${activeNav === "saved" ? "text-[#202228]" : "text-[#a6acb7]"}`}>{searchUiLabels.nav.saved}</span>
            </button>
            <button className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-[#a6acb7]" onClick={() => setActiveNav("discover")} style={{ touchAction: "manipulation" }} type="button">
              <div className={`flex h-11 w-11 items-center justify-center rounded-[18px] transition-colors ${activeNav === "discover" ? "border border-[#d9dde6] bg-white text-[#202228] shadow-[0_10px_20px_-16px_rgba(0,0,0,0.18)]" : "text-[#a6acb7]"}`}>
                <IconCompass />
              </div>
              <span className={`text-[10px] font-medium ${activeNav === "discover" ? "text-[#202228]" : "text-[#a6acb7]"}`}>{searchUiLabels.nav.discover}</span>
            </button>
            <Link
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-[#a6acb7]"
              href="/home"
              onClick={() => {
                setHomeChats(addNewSidebarChat());
              }}
              style={{ touchAction: "manipulation" }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] text-[#a6acb7] transition-colors">
                <IconUser />
              </div>
              <span className="text-[10px] font-medium text-[#a6acb7]">Profile</span>
            </Link>
          </div>
        </nav>
      </div>

      {fullscreenDestination && activeFullscreenDossier ? (
        <>
          {/* ── Desktop fullscreen dossier (md and above) ── */}
          <div className="fixed inset-0 z-[80] hidden overflow-hidden bg-[#020305] text-white md:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(82,110,255,0.22),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(108,92,255,0.16),transparent_24%),linear-gradient(180deg,rgba(2,4,8,0.76)_0%,rgba(2,3,5,0.94)_100%)]" />

          <button
            aria-label="Close destination dossier"
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-white/72 transition hover:bg-white/[0.08] hover:text-white"
            onClick={() => {
              setFullscreenDestination(null);
            }}
            type="button"
          >
            <IconClose />
          </button>

          <div className="relative z-10 grid h-full w-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="relative flex min-h-0 flex-col border-r border-white/8">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(1,2,4,0.32)_0%,rgba(1,2,4,0.04)_24%,rgba(1,2,4,0.42)_100%)]" />

              <div className="absolute left-6 top-6 z-10 flex items-center gap-3">
                <span className="rounded-full border border-white/12 bg-black/24 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/54 backdrop-blur-md">
                  {activeFullscreenDossier.series}
                </span>
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/32">
                  {activeFullscreenDossier.episode}
                </span>
              </div>

              <div className="absolute bottom-8 left-8 z-10 max-w-[520px]">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/42">
                  {activeFullscreenDossier.title}
                </div>
                  <h2 className="max-w-[460px] [font-family:var(--font-search-serif),serif] text-[28px] leading-[1.04] tracking-tight text-white md:text-[36px]">
                  {activeFullscreenDossier.headline}
                </h2>
                <p className="mt-3 max-w-[460px] text-[13px] leading-6 text-white/58">
                  {activeFullscreenDossier.intro}
                </p>
              </div>

              <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3">
                <button
                  className="rounded-full border border-white/12 bg-black/24 px-4 py-2 text-[12px] font-medium text-white/72 backdrop-blur-md transition hover:bg-white/[0.08] hover:text-white"
                  onClick={() => setFullscreenMuted((value) => !value)}
                  type="button"
                >
                  {fullscreenMuted ? dossierUiLabels.unmute : dossierUiLabels.mute}
                </button>
              </div>

              <video
                aria-label={`${activeFullscreenDossier.title} destination film`}
                autoPlay
                className="h-full w-full object-cover"
                controls
                muted={fullscreenMuted}
                playsInline
                preload="metadata"
                src={activeFullscreenDossier.src}
              />
            </section>

            <aside className="relative flex min-h-0 flex-col bg-[linear-gradient(180deg,rgba(7,9,14,0.98)_0%,rgba(6,8,12,0.98)_100%)]">
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-9 pb-8 pt-20">
                <div className="mb-6 border-b border-white/8 pb-6">
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/34">
                    {dossierUiLabels.guide}
                  </div>
                  <h3 className="mb-3 [font-family:var(--font-search-serif),serif] text-[24px] leading-[1.08] text-white">
                    {activeFullscreenDossier.title}
                  </h3>
                  <p className="text-[13px] leading-6 text-white/58">
                    {activeFullscreenDossier.intro}
                  </p>
                  {"introBody" in activeFullscreenDossier && typeof activeFullscreenDossier.introBody === "string" ? (
                    <p className="mt-4 text-[13px] leading-6 text-white/58">
                      {activeFullscreenDossier.introBody}
                    </p>
                  ) : null}
                </div>

                <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/28">
                  {dossierUiLabels.highlights}
                </div>
                <div className="space-y-5">
                  {activeFullscreenDossier.spots.map((item) => (
                    <article key={item.title} className="border-b border-white/8 pb-5 last:border-b-0 last:pb-0">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-white/30">{item.label}</div>
                      <div className="mb-3 overflow-hidden rounded-[16px] border border-white/8 bg-white/[0.03]">
                        <img alt={item.title} className="h-[138px] w-full object-cover" src={item.image} />
                      </div>
                      <h4 className="mb-2 text-[18px] font-medium text-white">{item.title}</h4>
                      <p className="text-[13px] leading-6 text-white/54">{item.description}</p>
                    </article>
                  ))}
                </div>

                {"routeSignal" in activeFullscreenDossier && typeof activeFullscreenDossier.routeSignal === "string" ? (
                  <div className="mt-7 border-t border-white/8 pt-6">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/28">{dossierUiLabels.routeSignal}</div>
                    <p className="text-[13px] leading-6 text-white/54">
                      {activeFullscreenDossier.routeSignal}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-white/8 px-9 py-6">
                <button
                  className="w-full rounded-full border border-white/12 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.09]"
                  onClick={() => {
                    setFullscreenDestination(null);
                    if (fullscreenDestination === "hokkaido") {
                      router.push("/home/guides/sapporo-otaru-winter-guide");
                      return;
                    }
                    if (fullscreenDestination === "finland") {
                      router.push("/home/guides/finland-winter-atmosphere-guide");
                    }
                  }}
                  type="button"
                >
                  {dossierUiLabels.openGuide}
                </button>
              </div>
            </aside>
          </div>
        </div>

          {/* ── Mobile fullscreen dossier (below md) ── */}
          <div className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#08090c] text-white md:hidden">
            {/* Hero video — top ~52% */}
            <div className="relative shrink-0" style={{ height: "52%" }}>
              <video
                ref={fullscreenVideoRef}
                aria-label={`${activeFullscreenDossier.title} destination film`}
                autoPlay
                className="h-full w-full object-cover"
                controls
                loop
                muted={fullscreenMuted}
                onLoadedData={(event) => primeVideoCover(event.currentTarget)}
                playsInline
                poster={activeFullscreenPoster}
                preload="metadata"
                src={activeFullscreenDossier.src}
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.54)_0%,rgba(0,0,0,0.02)_38%,rgba(0,0,0,0.64)_100%)]" />

              {/* Top bar */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-white/18 bg-black/32 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.26em] text-white/88 backdrop-blur-md">
                    {activeFullscreenDossier.series}
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
                    {activeFullscreenDossier.episode}
                  </span>
                </div>
                <button
                  aria-label="Close destination dossier"
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/28 text-white/72 backdrop-blur-md transition active:bg-white/10"
                  onClick={() => setFullscreenDestination(null)}
                  type="button"
                >
                  <IconClose />
                </button>
              </div>

              {/* Bottom overlay: title + headline + intro + unmute */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-5">
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/50">
                  {activeFullscreenDossier.title}
                </div>
                <h2 className="mb-2 max-w-[280px] [font-family:var(--font-search-serif),serif] text-[26px] leading-[1.06] tracking-tight text-white">
                  {activeFullscreenDossier.headline}
                </h2>
                <div className="flex items-end justify-between gap-3">
                  <p className="max-w-[210px] text-[12px] leading-[1.55] text-white/60">
                    {activeFullscreenDossier.intro}
                  </p>
                  <button
                    className="pointer-events-auto flex shrink-0 items-center gap-2 rounded-full border border-white/16 bg-black/32 px-4 py-2 text-[12px] font-medium text-white/84 backdrop-blur-md transition active:bg-white/10"
                    onClick={() => setFullscreenMuted((v) => !v)}
                    type="button"
                  >
                    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      {fullscreenMuted ? (
                        <>
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <line x1="23" y1="9" x2="17" y2="15" />
                          <line x1="17" y1="9" x2="23" y2="15" />
                        </>
                      ) : (
                        <>
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" />
                        </>
                      )}
                    </svg>
                    {fullscreenMuted ? dossierUiLabels.unmute : dossierUiLabels.mute}
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable guide content — bottom ~48% */}
            <div className="flex min-h-0 flex-1 flex-col bg-[#08090c]">
              <div className="flex-1 overflow-y-auto px-5 pb-28 pt-6">
                <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/32">
                  {dossierUiLabels.guide}
                </div>
                <h3 className="mb-1 [font-family:var(--font-search-serif),serif] text-[30px] leading-[1.04] text-white">
                  {activeFullscreenDossier.title}
                </h3>
                <p className="mb-4 text-[13px] font-medium text-[#7b9cff]">
                  {activeFullscreenDossier.intro}
                </p>
                {"introBody" in activeFullscreenDossier && typeof activeFullscreenDossier.introBody === "string" ? (
                  <p className="mb-7 text-[13px] leading-[1.7] text-white/52">
                    {activeFullscreenDossier.introBody}
                  </p>
                ) : null}
                <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/26">
                  {dossierUiLabels.highlights}
                </div>
                <div className="space-y-5">
                  {activeFullscreenDossier.spots.map((item) => (
                    <article key={item.title} className="border-b border-white/[0.07] pb-5 last:border-b-0 last:pb-0">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/28">{item.label}</div>
                      <div className="mb-3 overflow-hidden rounded-[14px] border border-white/[0.07] bg-white/[0.025]">
                        <img alt={item.title} className="h-[130px] w-full object-cover" src={item.image} />
                      </div>
                      <h4 className="mb-1.5 text-[17px] font-medium text-white">{item.title}</h4>
                      <p className="text-[13px] leading-[1.65] text-white/50">{item.description}</p>
                    </article>
                  ))}
                </div>
              </div>

              {/* Fixed-bottom Open Full Guide */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/95 to-transparent px-5 pb-8 pt-6">
                <button
                  className="w-full rounded-full bg-white px-5 py-4 text-[14px] font-semibold text-[#0a0a0d] transition active:opacity-90"
                  onClick={() => {
                    setFullscreenDestination(null);
                    if (fullscreenDestination === "hokkaido") {
                      router.push("/home/guides/sapporo-otaru-winter-guide");
                      return;
                    }
                    if (fullscreenDestination === "finland") {
                      router.push("/home/guides/finland-winter-atmosphere-guide");
                    }
                  }}
                  type="button"
                >
                  {dossierUiLabels.openGuide}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
