export type SidebarChatItem = {
  label: string;
  href: string;
};

const STORAGE_KEY = "weave-sidebar-home-chats";

const defaultChats: SidebarChatItem[] = [
  { label: "Overseas travel recs", href: "/search?q=overseas%20travel%20recs" },
  { label: "Kyoto autumn spots", href: "/search?q=kyoto%20autumn%20spots" },
  { label: "Paris cafe guide", href: "/search?q=paris%20cafe%20guide" },
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function dedupeChats(chats: SidebarChatItem[]) {
  const seen = new Set<string>();
  return chats.filter((chat) => {
    const key = `${chat.label}::${chat.href}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function getHomeSidebarChats() {
  if (!canUseStorage()) {
    return defaultChats;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultChats;
    }

    const parsed = JSON.parse(raw) as SidebarChatItem[];
    if (!Array.isArray(parsed)) {
      return defaultChats;
    }

    return dedupeChats(
      parsed.filter(
        (item): item is SidebarChatItem =>
          Boolean(item && typeof item.label === "string" && typeof item.href === "string")
      )
    ).slice(0, 8);
  } catch {
    return defaultChats;
  }
}

export function saveHomeSidebarChats(chats: SidebarChatItem[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupeChats(chats).slice(0, 8)));
}

export function addHomeSidebarChat(chat: SidebarChatItem) {
  const nextChats = [chat, ...getHomeSidebarChats()];
  saveHomeSidebarChats(nextChats);
  return getHomeSidebarChats();
}

export function addSearchSidebarChat(query: string) {
  const normalized = query.trim();
  if (!normalized) {
    return getHomeSidebarChats();
  }

  return addHomeSidebarChat({
    label: normalized,
    href: `/search?q=${encodeURIComponent(normalized)}`,
  });
}

export function addNewSidebarChat() {
  return addHomeSidebarChat({
    label: "New",
    href: "/home",
  });
}

export function removeHomeSidebarChat(chatToRemove: SidebarChatItem) {
  const nextChats = getHomeSidebarChats().filter(
    (chat) => !(chat.label === chatToRemove.label && chat.href === chatToRemove.href)
  );
  saveHomeSidebarChats(nextChats);
  return getHomeSidebarChats();
}
