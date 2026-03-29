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
  const hokkaidoVideoRef = useRef<HTMLVideoElement | null>(null);
  const finlandVideoRef = useRef<HTMLVideoElement | null>(null);
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

  const searchUiLabels = useMemo(() => {
    if (language === "JA") {
      return {
        nav: { home: "ホーム", saved: "保存", discover: "発見" },
        chats: "チャット",
        browseTitle: "冬の空気をめぐる",
        destinationTitles: {
          hokkaido: "北海道、日本",
          finland: "フィンランド",
        },
        locationLabels: {
          hokkaido: "小樽",
          finland: "フィンランド",
        },
        highSeason: "ハイシーズン",
        exploreDestination: "旅先を見る",
        replyPlaceholder: "返信する...",
        discoveryDisclaimer: "AI生成のディスカバリー • 不正確な内容を含む場合があります",
        generateTravelMemory: "旅の記憶を生成",
        webSearch: "ウェブ検索",
      } as const;
    }

    if (language === "ZH") {
      return {
        nav: { home: "主页", saved: "收藏", discover: "发现" },
        chats: "聊天",
        browseTitle: "浏览冬日氛围",
        destinationTitles: {
          hokkaido: "北海道，日本",
          finland: "芬兰",
        },
        locationLabels: {
          hokkaido: "小樽",
          finland: "芬兰",
        },
        highSeason: "旺季",
        exploreDestination: "查看目的地",
        replyPlaceholder: "回复...",
        discoveryDisclaimer: "AI 生成探索内容 • 可能包含不准确信息",
        generateTravelMemory: "生成旅行记忆",
        webSearch: "网页搜索",
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

  useEffect(() => {
    setLanguage(getStoredWeaveLanguage());

    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<WeaveLanguage>;
      setLanguage(customEvent.detail || getStoredWeaveLanguage());
    };

    window.addEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange as EventListener);
    return () => window.removeEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange as EventListener);
  }, []);

  const fullscreenDossiers = {
    hokkaido: {
      title: "Otaru",
      series: "Weave Dossier",
      episode: "Episode 01",
      headline: "Winter Rail & Canal Memory",
      intro:
        "The Winter Charm of Hokkaido: Sapporo & Otaru",
      introBody:
        "Otaru is one of Hokkaido’s most iconic port towns, known for its retro canal, stone warehouses, and nostalgic atmosphere. In winter, the city is wrapped in snow, creating a romantic mood, while at night it comes alive with dazzling illuminations and a food scene that rivals any major city.",
      src: "/api/media/hokkaido",
      spots: [
        {
          label: "Otaru City Center & Around Otaru Station",
          title: "Otaru Spot",
          description:
            "The snowy scenery and passing trains perfectly capture the winter spirit of Hokkaido. Around the historic JR Otaru Station, there is a nostalgic atmosphere that reflects the town’s slow pace and rich history.",
          image: "/dossier/otaru-spot.svg",
        },
        {
          label: "Funamizaka",
          title: "Funamizaka Spot",
          description:
            "One of Otaru’s most famous slopes, Funamizaka is also known as a filming location for the movie Love Letter. From the top of the hill, you can look straight down the road toward Otaru Port, with the town spreading out below. In winter, the snow-covered view feels almost cinematic.",
          image: "/dossier/funamizaka-spot.svg",
        },
        {
          label: "Susukino Intersection",
          title: "Susukino Intersection",
          description:
            "The heart of Susukino, Sapporo’s largest entertainment district. The iconic NIKKA WHISKY neon sign lights up the area, while countless restaurants, bars, and shops fill the surrounding streets. It is one of the best places to experience the lively energy of Sapporo at night.",
          image: "/dossier/susukino-intersection.svg",
        },
        {
          label: "Moiwa Night View",
          title: "Moiwa Night View",
          description:
            "The night view from Mount Moiwa is considered one of Japan’s “New Three Great Night Views.” After taking the ropeway to the summit, you can enjoy a 360-degree panorama of Sapporo, where the snow-covered city sparkles like jewels below.",
          image: "/dossier/moiwa-night-view.svg",
        },
        {
          label: "Shiroi Koibito Soft Serve",
          title: "Shiroi Koibito Soft Serve",
          description:
            "Shiroi Koibito is one of Hokkaido’s most famous souvenirs. The soft serve ice cream, made with the same white chocolate and Hokkaido milk, is known for its rich, smooth, and creamy flavor.",
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
      legacyBody:
        "Finland in winter offers a different kind of rhythm - quieter, colder, and more spacious. From snowy ski landscapes and northern lights to warm local dishes and festive city markets, it is a destination where winter feels both cinematic and deeply lived-in.",
      src: "/api/media/finland",
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

  useEffect(() => {
    setHomeChats(addSearchSidebarChat(normalizedQuery));
  }, [normalizedQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 40);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeDestinationIndex === 0) {
      setShouldLoadHokkaidoVideo(true);
      finlandVideoRef.current?.pause();
      setFinlandPlaying(false);
      return;
    }

    setShouldLoadFinlandVideo(true);
    hokkaidoVideoRef.current?.pause();
    setIsPlaying(false);
  }, [activeDestinationIndex]);

  useEffect(() => {
    const video = hokkaidoVideoRef.current;
    if (!video || !shouldLoadHokkaidoVideo) {
      return;
    }

    const handleLoadedMetadata = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setDuration(video.duration);
      }
      setIsMuted(video.muted);
      primeVideoCover(video);
    };
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);

    handleLoadedMetadata();
    if (activeDestinationIndex === 0 && video.paused) {
      void video.play().catch(() => {});
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [shouldLoadHokkaidoVideo, activeDestinationIndex]);

  useEffect(() => {
    const video = finlandVideoRef.current;
    if (!video || !shouldLoadFinlandVideo) {
      return;
    }

    const handleLoadedMetadata = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setFinlandDuration(video.duration);
      }
      setFinlandMuted(video.muted);
      primeVideoCover(video);
    };
    const handleTimeUpdate = () => setFinlandCurrentTime(video.currentTime);
    const handlePlay = () => setFinlandPlaying(true);
    const handlePause = () => setFinlandPlaying(false);
    const handleVolumeChange = () => setFinlandMuted(video.muted);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);

    handleLoadedMetadata();
    if (activeDestinationIndex === 1 && video.paused) {
      void video.play().catch(() => {});
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [shouldLoadFinlandVideo, activeDestinationIndex]);

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
      void video.play().catch(() => {});
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
      void video.play().catch(() => {});
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

  const localizedFullscreenDossiers = useMemo(() => {
    if (language === "EN") {
      return fullscreenDossiers;
    }

    if (language === "JA") {
      return {
        hokkaido: {
          ...fullscreenDossiers.hokkaido,
          title: "小樽",
          headline: "北海道の冬の魅力：札幌と小樽",
          intro: "小樽は北海道を代表する港町のひとつ。レトロな運河、石造倉庫、そして懐かしい街並みが、冬には静かな映画のような空気をつくります。",
          introBody:
            "札幌の夜景、あたたかな郷土料理、きらめくイルミネーションまで含めて、都市の華やかさと北国の静けさが同時に味わえる旅先です。",
          spots: [
            { ...fullscreenDossiers.hokkaido.spots[0], label: "小樽市街と小樽駅周辺", title: "小樽スポット", description: "雪景色と行き交う列車が、北海道の冬らしさをそのまま映し出します。歴史ある JR 小樽駅の周辺には、町のゆったりした時間と懐かしい空気が残っています。" },
            { ...fullscreenDossiers.hokkaido.spots[1], label: "船見坂", title: "船見坂スポット", description: "小樽を代表する坂のひとつで、映画『Love Letter』のロケ地としても知られています。坂の上から港へ伸びる一本道と街並みを見下ろす景色は、冬になるといっそう映画的です。" },
            { ...fullscreenDossiers.hokkaido.spots[2], label: "すすきの交差点", title: "すすきの交差点", description: "札幌最大の歓楽街すすきのの中心。象徴的な NIKKA WHISKY のネオンと、無数の飲食店やバー、ショップが並ぶ夜の賜わいを体感できる場所です。" },
            { ...fullscreenDossiers.hokkaido.spots[3], label: "藻岩山の夜景", title: "藻岩山の夜景", description: "藻岩山から望む夜景は『日本新三大夜景』のひとつ。ロープウェイで山頂へ上がると、雪をまとった札幌の街が宝石のようにきらめく 360 度の景色が広がります。" },
            { ...fullscreenDossiers.hokkaido.spots[4], label: "白い恋人ソフトクリーム", title: "白い恋人ソフトクリーム", description: "北海道を代表する銘菓『白い恋人』の風味を生かしたソフトクリーム。ホワイトチョコレートと北海道ミルクのなめらかな甘さが印象に残ります。" },
            { ...fullscreenDossiers.hokkaido.spots[5], label: "うな重", title: "うな重", description: "香ばしいタレで焼き上げたうなぎを温かいご飯に重ねた定番のごちそう。外は香ばしく、中はふっくらとした食感で、旅の疲れをやさしくほどいてくれます。" },
            { ...fullscreenDossiers.hokkaido.spots[6], label: "ジンギスカン", title: "ジンギスカン", description: "北海道を代表する郷土料理。特製鍋で焼いたラム肉と野菜はやわらかくジューシーで、香ばしいタレとの相性も抜群です。" },
            { ...fullscreenDossiers.hokkaido.spots[7], label: "元祖さっぽろラーメン横丁", title: "ラーメン横丁", description: "味噌ラーメンの街・札幌を象徴する細い路地。老舗が並ぶ昭和の空気の中で、雪の夜にすする熱い一杯は格別です。" },
            { ...fullscreenDossiers.hokkaido.spots[8], label: "大通公園とさっぽろテレビ塔", title: "大通公園とさっぽろテレビ塔", description: "札幌中心部を横切る大通公園は、市民の憩いの場であり冬の主要イベント会場でもあります。ホワイトイルミネーションの季節には公園全体が光に包まれ、テレビ塔が美しく浮かび上がります。" },
          ],
        },
        finland: {
          ...fullscreenDossiers.finland,
          title: "フィンランド",
          headline: "フィンランドの冬の空気：ラップランドとヘルシンキ",
          intro: "フィンランドの冬には、静けさ、冷たさ、そして余白の美しさがあります。雪景色、オーロラ、温かな料理、そして街の灯りが、落ち着いた冬の物語を形づくります。",
          legacyBody:
            "ラップランドの広い雪原からヘルシンキのクリスマスマーケットまで、北国らしい静かな高揚感が途切れず続く旅です。",
          spots: [
            { ...fullscreenDossiers.finland.spots[0], label: "スキーリゾートの風景", title: "フィンランドスポット", description: "雪に覆われた斜面、リフト、淡い北の光が、ラップランドらしい静かなリゾートの空気をつくります。広がる景色と澄んだ空気が、穏やかな冬の始まりを感じさせます。" },
            { ...fullscreenDossiers.finland.spots[1], label: "オーロラ", title: "オーロラスポット", description: "暗い北の空を横切る緑の光は、フィンランドを象徴する冬景色のひとつ。山並みや森の上を流れる光は、自然でありながらどこか幻想的です。" },
            { ...fullscreenDossiers.finland.spots[2], label: "サーモンスープ", title: "サーモンスープ料理", description: "サーモン、野菜、ディルで作る、やさしい味わいの定番料理。クリーミーであたたかな一杯が、寒い日の体をゆっくり温めてくれます。" },
            { ...fullscreenDossiers.finland.spots[3], label: "雪に包まれた村", title: "冬の村の風景", description: "日が落ちると、雪の上に村の灯りが静かににじみます。小屋、道、屋根の輪郭がやわらぎ、親密で静かな冬の情景が生まれます。" },
            { ...fullscreenDossiers.finland.spots[4], label: "サンタクロース村", title: "サンタクロース村", description: "ラップランドの人気スポット。雪景色とあたたかな灯り、祝祭的な装飾が合わさり、北国らしさと季節感が心地よく混ざり合います。" },
            { ...fullscreenDossiers.finland.spots[5], label: "ヘルシンキ・クリスマスマーケット", title: "ヘルシンキ・クリスマスマーケット", description: "ヘルシンキ大聖堂前で開かれる冬の市場。灯り、食べ物、ローカルクラフト、クラシックな回転木馬が集まり、首都でもっとも雰囲気のある季節の風景をつくります。" },
            { ...fullscreenDossiers.finland.spots[6], label: "冬のフェスティバル・パフォーマンス", title: "季節のセレブレーション", description: "公共のパフォーマンスや冬の集まりが、静かな季節にほどよい活気を添えます。北国らしい落ち着きを保ちながらも、祝祭のエネルギーが感じられます。" },
          ],
        },
      } as const;
    }

    return {
      hokkaido: {
        ...fullscreenDossiers.hokkaido,
        title: "小樽",
        headline: "北海道冬日魅力：札幌与小樽",
        intro: "小樽是北海道最具代表性的港町之一，复古运河、石造仓库与怀旧街景，让冬天自带安静而电影感的气氛。",
        introBody:
          "从札幌夜景到温热料理，再到发光的街道灯饰，这里把北方城市的浪漫和冬季生活感自然地放在一起。",
        spots: [
          { ...fullscreenDossiers.hokkaido.spots[0], label: "小樽市中心与小樽站周边", title: "小樽景点", description: "雪景与列车穿行的画面，几乎完整呈现了北海道冬天的气质。历史悠久的 JR 小樽站周边，也保留着这座城市缓慢而怀旧的节奏。" },
          { ...fullscreenDossiers.hokkaido.spots[1], label: "船见坂", title: "船见坂景点", description: "船见坂是小樽最有代表性的坡道之一，也是电影《Love Letter》的取景地。从坡顶向下望去，可以一直看到通往小樽港的道路与延展开来的城市景色，冬季尤其有电影感。" },
          { ...fullscreenDossiers.hokkaido.spots[2], label: "薄野十字路口", title: "薄野十字路口", description: "这里是札幌最大娱乐街区薄野的中心地带。醒目的 NIKKA WHISKY 需虹灯、密集的餐馆酒吧与商店，共同构成札幌夜生活最鲜明的一面。" },
          { ...fullscreenDossiers.hokkaido.spots[3], label: "藻岩山夜景", title: "藻岩山夜景", description: "藻岩山夜景被认为是日本“新三大夜景”之一。搭乘缆车登顶后，可以看到被白雪覆盖的札幌在脚下像珠宝一样发光。" },
          { ...fullscreenDossiers.hokkaido.spots[4], label: "白色恋人冰淇淋", title: "白色恋人冰淇淋", description: "白色恋人是北海道最著名的伴手礼之一。以同款白巧克力与北海道牛奶制成的冰淇淋，口感浓郁、顺滑而柔和。" },
          { ...fullscreenDossiers.hokkaido.spots[5], label: "鳗鱼饭", title: "鳗鱼饭", description: "鳗鱼饭是广受喜爱的经典日式料理。带着甜咸酱香的鳗鱼外层微脆、内部柔嫩，铺在热米饭上，是旅途中很有安慰感的一餐。" },
          { ...fullscreenDossiers.hokkaido.spots[6], label: "成吉思汗烤肉", title: "成吉思汗烤肉", description: "这是北海道代表性的地方料理之一。羊肉与蔬菜在圆顶铁盘上烤制，肉质鲜嫩多汁，与咸香酱汁非常搭配。" },
          { ...fullscreenDossiers.hokkaido.spots[7], label: "元祖札幌拉面横丁", title: "拉面横丁", description: "札幌被视为味噌拉面的发源地。狭窄的拉面横丁保留着昭和时代的怀旧气氛，在雪夜里吃上一碗热腾腾的拉面尤其难忘。" },
          { ...fullscreenDossiers.hokkaido.spots[8], label: "大通公园与札幌电视塔", title: "大通公园与札幌电视塔", description: "大通公园横贯札幌中心，是市民休息之地，也是许多大型活动的举办场所。白色灯饰季时整座公园被光包围，电视塔也在上方静静发亮。" },
        ],
      },
      finland: {
        ...fullscreenDossiers.finland,
        title: "芬兰",
        headline: "芬兰的冬季氛围：拉普兰与赫尔辛基",
        intro: "芬兰的冬天有另一种节奏：更安静、更寒冷，也更开阔。从雪地滑雪景观、极光，到温热料理与节日市集，这是一种既电影化又真实生活着的冬天。",
        legacyBody:
          "从拉普兰的雪原到赫尔辛基的圣诞市场，整个旅程都保持着北欧冬日特有的克制、安静与季节感。",
        spots: [
          { ...fullscreenDossiers.finland.spots[0], label: "滑雪度假风景", title: "芬兰景点", description: "雪坡、缆车与淡淡的北方光线，共同构成拉普兰安静的度假氛围。开阔的地景和清冷空气，让人以最平和的方式进入芬兰的冬季。" },
          { ...fullscreenDossiers.finland.spots[1], label: "极光", title: "极光景点", description: "极光是芬兰最具代表性的冬季景象之一。绿色光带越过北方夜空，在山脊与森林上方流动，既自然，又带着一点超现实感。" },
          { ...fullscreenDossiers.finland.spots[2], label: "三文鱼汤", title: "三文鱼汤料理", description: "三文鱼汤是经典的芬兰安慰料理。以三文鱼、蔬菜和莔萝慢慢炖煮，口感柔和、绵密，在寒冷天气里尤其让人满足。" },
          { ...fullscreenDossiers.finland.spots[3], label: "被雪覆盖的村庄", title: "冬日村庄景观", description: "当天色转暗，村庄里的灯光开始在雪面上慢慢亮起。小屋、道路与屋顶被柔化成安静而亲密的冬季场景。" },
          { ...fullscreenDossiers.finland.spots[4], label: "圣诞老人村", title: "圣诞老人村", description: "这是拉普兰最知名的停留点之一。雪景、暖光与节庆装饰交织在一起，形成轻快而难忘的冬季氛围。" },
          { ...fullscreenDossiers.finland.spots[5], label: "赫尔辛基圣诞市集", title: "赫尔辛基圣诞市集", description: "这座市集位于赫尔辛基大教堂前，集合了灯光、食物、手工艺品与经典旋转木马，是首都最有冬季氛围的场景之一。" },
          { ...fullscreenDossiers.finland.spots[6], label: "冬季节庆演出", title: "季节庆典", description: "公共演出和冬季聚会为寒冷季节带来流动感与活力，也让人看见芬兰冬天在安静之外，仍然保留着温和而节庆的一面。" },
        ],
      },
    } as const;
  }, [language, fullscreenDossiers]);

  const dossierUiLabels =
    language === "JA"
      ? {
          guide: "AIキュレーテッド・トラベルガイド",
          highlights: "キュレーテッド・ハイライト",
          routeSignal: "ルートシグナル",
          openGuide: "フルガイドを開く",
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

  const activeFullscreenDossier = fullscreenDestination ? localizedFullscreenDossiers[fullscreenDestination] : null;

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
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/preview/hokkaido-first-frame.jpg"
              src="/api/media/hokkaido"
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
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/preview/finland-first-frame.jpg"
            src="/api/media/finland"
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

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-[#F8F9FA] antialiased"
    >
      <div className="flex text-gray-900" style={wrapperStyle}>
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

      {fullscreenDestination && activeFullscreenDossier ? (
        <div className="fixed inset-0 z-[80] overflow-hidden bg-[#020305] text-white">
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
      ) : null}
    </div>
  );
}
