"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { clearGuideOpenTransition, readGuideOpenTransition, type GuideOpenTransitionPayload } from "@/components/weave/guideOpenTransition";
import { WEAVE_LANGUAGE_EVENT, type WeaveLanguage, getStoredWeaveLanguage } from "@/components/weave/weaveLanguage";
import { useAdaptivePageScale } from "@/components/weave/useAdaptivePageScale";

const FINLAND_GUIDE_COPY: Record<
  WeaveLanguage,
  {
    top: { badge: string; updated: string; share: string; saveGuide: string };
    hero: { route: string; title: string; subtitle: string };
    summary: { badge: string; title: string; body: string; streetMood: string; streetCaption: string };
    metrics: { duration: string; atmosphere: string; idealBase: string; bestMoment: string; values: [string, string, string, string] };
    arrival: { eyebrow: string; title: string; body: string; rows: [string, string][]; note: string };
    stay: { eyebrow: string; title: string; areas: Array<{ title: string; description: string }> };
    budget: { eyebrow: string; title: string; rows: [string, string, string][]; estimate: string; estimateRange: string; estimateBody: string };
    protocol: { eyebrow: string; title: string; layerTitle: string; layers: [string, string, string]; gear: [string, string][]; note: string };
    guidance: { badge: string; title: string; body: string; cta: string };
    fullscreen: {
      series: string;
      episode: string;
      title: string;
      headline: string;
      compactBody: string;
      guideLabel: string;
      intro: string;
      introBody: string;
      curatedHighlights: string;
      openGuide: string;
      spots: Array<{ label: string; title: string; description: string }>;
    };
  }
> = {
  EN: {
    top: { badge: "Destination Guide", updated: "Updated 2 days ago", share: "Share", saveGuide: "Save Guide" },
    hero: { route: "Featured Winter Route", title: "Finland", subtitle: "A quieter winter guide through Lapland stillness, Helsinki rituals, and colder northern light." },
    summary: {
      badge: "Weave Summary",
      title: "Lapland & Helsinki, composed for a calmer winter rhythm.",
      body: "This guide is designed to reduce decision fatigue. It focuses on where to stay, how to split the trip between city and northern atmosphere, what winter actually feels like on the ground, and how to keep the itinerary elegant instead of overfilled.",
      streetMood: "Street Mood",
      streetCaption: "Helsinki market and cathedral district, best entered before evening lights fully rise.",
    },
    metrics: { duration: "Duration", atmosphere: "Atmosphere", idealBase: "Ideal Base", bestMoment: "Best Moment", values: ["5 Days", "Quiet Cold", "Dual Base", "Blue Dusk"] },
    arrival: {
      eyebrow: "Arrival",
      title: "How to enter the trip without friction",
      body: "Helsinki works best as the clean entry point. The ideal move is to keep the first transfer simple, recover your rhythm in the city, and then decide whether Lapland is a rail extension or a short domestic flight for colder, quieter space.",
      rows: [["Tokyo to HEL", "Approx. 13h direct or one-stop"], ["Airport to Helsinki Center", "Train connection, about 30 min"], ["Helsinki to Lapland", "Domestic flight or overnight rail"]],
      note: "Finland feels best when you leave slack in the route. Keep transfer days light and avoid stacking late arrivals with long northern moves.",
    },
    stay: {
      eyebrow: "Stay",
      title: "Three bases, three different winter tempos",
      areas: [
        { title: "Helsinki Cathedral District", description: "Best if you want a composed city base with walkable markets, tram access, and cleaner winter pacing." },
        { title: "Market Square Waterfront", description: "Balanced for sea air, ferries, and holiday energy without losing that quieter Nordic mood." },
        { title: "Lapland Cabin Base", description: "For the most cinematic stillness: pale snow, open sky, and slower mornings around the resort landscape." },
      ],
    },
    budget: {
      eyebrow: "Budget",
      title: "A premium winter range with room for stillness",
      rows: [["Flights", "JPY 90k to 180k", "Lapland routing and seasonal demand change the curve quickly"], ["Hotel", "JPY 12k to 40k / night", "Helsinki stays efficient; Lapland atmosphere stays pricier"], ["Daily food", "JPY 4k to 18k", "Market meals stay light; northern dinners and seafood raise the range"]],
      estimate: "Weave Estimate",
      estimateRange: "JPY 120k to 240k",
      estimateBody: "A realistic 5-day range for comfort, movement, and one memorable northern stay.",
    },
    protocol: {
      eyebrow: "Winter Protocol",
      title: "What keeps the trip calm instead of draining",
      layerTitle: "Layering Logic",
      layers: ["Base", "Mid", "Outer"],
      gear: [["Snow Boots", "Absolute must"], ["Thermal Socks", "Double layer helps"], ["Insulated Gloves", "Prefer waterproof"], ["Wool Base Layer", "Daily essential"], ["Neck Warmer", "Cuts wind fatigue"], ["Hand Warmers", "Buy locally"]],
      note: "Daylight shortens fast in the north. Keep one warm indoor anchor each day so the trip keeps its shape instead of becoming only transit and cold.",
    },
    guidance: {
      badge: "Weave Guidance",
      title: "Stillness is the luxury layer.",
      body: "Finland in winter becomes exceptional when you stop over-scheduling it. Choose one city rhythm, one northern rhythm, and let the quieter spaces do the emotional work.",
      cta: "Download Checklist",
    },
    fullscreen: {
      series: "Weave Dossier",
      episode: "Episode 02",
      title: "Finland",
      headline: "The Winter Atmosphere of Finland",
      compactBody: "A calmer destination file composed around Lapland stillness, Baltic light, and colder market rituals.",
      guideLabel: "AI-Curated Travel Guide",
      intro: "The Winter Atmosphere of Finland: Lapland & Helsinki",
      introBody: "Finland in winter offers a different kind of rhythm — quieter, colder, and more spacious. From snowy ski landscapes and northern lights to warm local dishes and festive city markets, it is a destination where winter feels both cinematic and deeply lived-in.",
      curatedHighlights: "Curated Highlights",
      openGuide: "Open Full Guide",
      spots: [
        { label: "Ski Resort Landscape", title: "Finland Spot", description: "Snowy slopes, ski lifts, and pale northern light come together to create the calm resort atmosphere of Lapland. The open landscape and quiet air make it one of the most peaceful ways to enter the Finnish winter." },
        { label: "Northern Lights", title: "Aurora Spot", description: "The aurora is one of Finland's most iconic winter sights. Across the dark northern sky, waves of green light move over mountain ridges and forests, creating a view that feels both natural and surreal." },
        { label: "Salmon Soup", title: "Salmon Soup Dish", description: "A classic Finnish comfort food, salmon soup is known for its creamy texture and gentle flavor. Made with salmon, vegetables, and dill, it is a simple but deeply satisfying dish for cold days." },
        { label: "Snow-Covered Village", title: "Winter Village View", description: "As daylight fades, the village lights begin to glow across the snow. Cabins, roads, and rooftops soften into a quiet winter scene that feels intimate and still." },
        { label: "Santa Claus Village", title: "Santa Claus Village", description: "A well-known stop in Lapland, Santa Claus Village blends festive charm with northern winter scenery. Snow, warm lights, and holiday decoration create a cheerful and memorable seasonal atmosphere." },
        { label: "Helsinki Christmas Market", title: "Helsinki Christmas Market", description: "Held in front of Helsinki Cathedral, this Christmas market brings together lights, food, local crafts, and a classic carousel. It is one of the most atmospheric winter scenes in the capital." },
        { label: "Winter Festival Performance", title: "Seasonal Celebration", description: "Public performances and winter gatherings add movement and energy to Finland's colder season. They reflect a social side of winter that feels festive without losing its northern calm." },
      ],
    },
  },
  JA: {
    top: { badge: "旅先ガイド", updated: "2日前に更新", share: "共有", saveGuide: "ガイドを保存" },
    hero: { route: "注目の冬ルート", title: "フィンランド", subtitle: "ラップランドの静けさ、ヘルシンキの冬の習慣、北の冷たい光をめぐる落ち着いた冬のガイド。" },
    summary: { badge: "Weave Summary", title: "ラップランドとヘルシンキを、より静かな冬のリズムに合わせて構成。", body: "このガイドは判断疲れを減らすためのものです。どこに泊まるか、街と北部をどう分けるか、現地の冬がどのように感じられるか、そして旅程を詰め込みすぎず上質に保つ方法に焦点を当てています。", streetMood: "街のムード", streetCaption: "ヘルシンキのマーケットと大聖堂周辺。夕方の灯りが立ち上がる前の時間帯が最適。" },
    metrics: { duration: "日数", atmosphere: "空気感", idealBase: "拠点", bestMoment: "ベストタイム", values: ["5日間", "静かな寒さ", "二拠点", "ブルーダスク"] },
    arrival: { eyebrow: "到着", title: "無理なく旅に入る方法", body: "ヘルシンキは最もスムーズな入口です。最初の移動はできるだけ簡潔にして都市でリズムを整え、その後ラップランドへは鉄道で延ばすか、より静かな寒さのために国内線で入るかを決めるのが理想です。", rows: [["東京→HEL", "直行または1回乗継で約13時間"], ["空港→ヘルシンキ中心部", "鉄道で約30分"], ["ヘルシンキ→ラップランド", "国内線または夜行列車"]], note: "フィンランドは旅程に余白があるほど心地よく感じられます。移動日を軽く保ち、遅い到着と長い北部移動を重ねないようにしてください。" },
    stay: { eyebrow: "滞在", title: "冬のテンポが異なる3つの拠点", areas: [{ title: "ヘルシンキ大聖堂地区", description: "歩いて回れるマーケット、トラムアクセス、整った街のリズムを重視するなら最適。" }, { title: "マーケット広場ウォーターフロント", description: "海辺の空気、フェリー、祝祭の気配を保ちながら、北欧らしい静けさも失わないバランス型。" }, { title: "ラップランドのキャビンベース", description: "最も映画的な静けさのために。淡い雪景色、開けた空、ゆっくりした朝を味わえる。" }] },
    budget: { eyebrow: "予算", title: "静けさを含んだ上質な冬のレンジ", rows: [["航空券", "9万〜18万円", "ラップランドへの動線と季節需要で大きく変動"], ["ホテル", "1.2万〜4万円 / 泊", "ヘルシンキは効率的、ラップランドの雰囲気宿は高め"], ["食事", "4千〜1.8万円 / 日", "マーケットは軽め、北部ディナーや海産物で上振れ"]], estimate: "Weave Estimate", estimateRange: "12万〜24万円", estimateBody: "快適さ、移動、記憶に残る北部滞在を含む5日間の現実的な目安。" },
    protocol: { eyebrow: "冬のプロトコル", title: "旅を消耗ではなく穏やかに保つために", layerTitle: "重ね着の考え方", layers: ["ベース", "ミドル", "アウター"], gear: [["スノーブーツ", "必須"], ["サーマルソックス", "二重がおすすめ"], ["断熱グローブ", "防水推奨"], ["ウールのベースレイヤー", "毎日の基本"], ["ネックウォーマー", "風の疲れを減らす"], ["カイロ", "現地購入で十分"]], note: "北部では日照時間が急速に短くなります。毎日ひとつ暖かい屋内の拠点を決めておくと、旅が移動と寒さだけで埋まらず整います。" },
    guidance: { badge: "Weave Guidance", title: "静けさこそがラグジュアリーです。", body: "フィンランドの冬は、予定を詰め込みすぎないときにこそ特別になります。都市のリズムをひとつ、北部のリズムをひとつ選び、静かな余白に感情の仕事を任せてください。", cta: "チェックリストを保存" },
    fullscreen: {
      series: "Weave Dossier", episode: "Episode 02", title: "フィンランド", headline: "フィンランド冬景の気配", compactBody: "ラップランドの静けさ、バルト海の光、冬のマーケットの温度感を軸にまとめた落ち着いたデスティネーションファイル。", guideLabel: "AI Curated Travel Guide", intro: "フィンランド冬の空気感：ラップランドとヘルシンキ", introBody: "フィンランドの冬は、より静かで、より冷たく、より余白のあるリズムを持っています。雪のスキー景観やオーロラから、温かな郷土料理や祝祭のマーケットまで、冬が映画的でありながら暮らしの中に深く息づく旅先です。", curatedHighlights: "Curated Highlights", openGuide: "Open Full Guide",
      spots: [
        { label: "スキーリゾートの風景", title: "Finland Spot", description: "雪の斜面、リフト、淡い北の光が重なり、ラップランドの穏やかなリゾート空気を生み出します。開けた景色と静かな空気は、フィンランドの冬に入る最も平和な方法のひとつです。" },
        { label: "オーロラ", title: "Aurora Spot", description: "オーロラはフィンランド冬の象徴的な光景のひとつです。暗い北の空を横切る緑の波は、山並みや森の上を流れ、自然でありながらどこか超現実的に感じられます。" },
        { label: "サーモンスープ", title: "Salmon Soup Dish", description: "サーモンスープはフィンランドを代表する家庭的な冬の料理です。鮭、野菜、ディルで作られ、やさしい味わいとクリーミーな質感が寒い日に深い満足感を与えてくれます。" },
        { label: "雪に包まれた村", title: "Winter Village View", description: "日が落ち始めると、村の灯りが雪の上に静かに灯り始めます。キャビンや道、屋根はやわらかい冬景色の中に溶け込み、親密で静かな空気をつくります。" },
        { label: "サンタクロース村", title: "Santa Claus Village", description: "ラップランドの定番スポットであるサンタクロース村は、祝祭的な魅力と北の冬景色が溶け合う場所です。雪、あたたかな灯り、ホリデー装飾が、明るく記憶に残る季節感をつくります。" },
        { label: "ヘルシンキ・クリスマスマーケット", title: "Helsinki Christmas Market", description: "ヘルシンキ大聖堂前で開かれるこのマーケットには、灯り、食、クラフト、そしてクラシックな回転木馬が集まります。首都で最も冬らしい空気を感じられる場面のひとつです。" },
        { label: "冬のフェスティバル・パフォーマンス", title: "Seasonal Celebration", description: "冬のイベントやパフォーマンスは、寒い季節に動きとエネルギーをもたらします。北国らしい静けさを失わずに、祝祭性のある冬の社交的な一面を映し出します。" },
      ],
    },
  },
  ZH: {
    top: { badge: "目的地指南", updated: "2天前更新", share: "分享", saveGuide: "保存指南" },
    hero: { route: "精选冬季路线", title: "芬兰", subtitle: "一份围绕拉普兰静谧、赫尔辛基冬日仪式与北方冷光展开的安静冬季指南。" },
    summary: { badge: "Weave Summary", title: "拉普兰与赫尔辛基，为更平静的冬季节奏而编排。", body: "这份指南旨在减少决策疲劳。它关注住在哪里、如何在城市与北部之间分配时间、冬天在现场究竟是什么感受，以及如何让行程保持优雅而不过度拥挤。", streetMood: "街区氛围", streetCaption: "赫尔辛基市集与大教堂街区，最适合在傍晚灯光完全亮起前进入。" },
    metrics: { duration: "时长", atmosphere: "氛围", idealBase: "理想据点", bestMoment: "最佳时刻", values: ["5天", "安静寒冷", "双据点", "蓝调黄昏"] },
    arrival: { eyebrow: "抵达", title: "如何顺畅进入这段旅程", body: "赫尔辛基是最清爽的入口。理想做法是先保持第一次转移尽量简单，在城市里把节奏找回来，再决定前往拉普兰是坐夜车延伸，还是搭国内航班进入更冷更静的空间。", rows: [["东京 → HEL", "直飞或一次中转约13小时"], ["机场 → 赫尔辛基市中心", "火车约30分钟"], ["赫尔辛基 → 拉普兰", "国内航班或夜行列车"]], note: "芬兰的冬天在行程留有余白时最舒服。让转场日保持轻盈，不要把晚到与长距离北上叠在同一天。" },
    stay: { eyebrow: "停留", title: "三种据点，三种不同的冬日节奏", areas: [{ title: "赫尔辛基大教堂区", description: "如果你想要更整洁的城市据点、可步行市集与电车网络，这里最合适。" }, { title: "集市广场海滨", description: "适合海风、轮渡与节日气氛，同时保留更安静的北欧气质。" }, { title: "拉普兰木屋据点", description: "为了最电影化的静谧：淡雪、开阔天空，以及围绕雪场展开的缓慢清晨。" }] },
    budget: { eyebrow: "预算", title: "一份留有静谧空间的高品质冬季预算", rows: [["机票", "9万到18万日元", "拉普兰动线与季节需求会快速改变曲线"], ["酒店", "1.2万到4万日元 / 晚", "赫尔辛基更高效，拉普兰氛围住宿更贵"], ["每日餐饮", "4千到1.8万日元", "市集餐更轻，北部晚餐与海鲜会抬高区间"]], estimate: "Weave Estimate", estimateRange: "12万到24万日元", estimateBody: "适用于舒适出行、移动与一次难忘北部住宿的五日现实区间。" },
    protocol: { eyebrow: "冬季协议", title: "让旅程保持平静而不被消耗的关键", layerTitle: "穿搭逻辑", layers: ["内层", "中层", "外层"], gear: [["雪地靴", "绝对必备"], ["保暖袜", "双层更好"], ["保暖手套", "建议防水"], ["羊毛底层", "每日基础"], ["脖套", "减少风寒疲劳"], ["暖宝宝", "当地购买即可"]], note: "北方白昼会很快缩短。每天保留一个温暖的室内锚点，行程才不会只剩转场与寒冷。" },
    guidance: { badge: "Weave Guidance", title: "静谧本身就是奢华层。", body: "芬兰的冬天在你不再过度安排时才真正迷人。选择一种城市节奏和一种北部节奏，把情绪工作交给那些更安静的空间。", cta: "下载清单" },
    fullscreen: {
      series: "Weave Dossier", episode: "Episode 02", title: "芬兰", headline: "芬兰冬日气氛档案", compactBody: "一份围绕拉普兰静谧、波罗的海光线与冬季市集温度感展开的克制目的地档案。", guideLabel: "AI Curated Travel Guide", intro: "芬兰冬日氛围：拉普兰与赫尔辛基", introBody: "芬兰的冬天拥有另一种节奏——更安静、更寒冷，也更留白。从雪地滑雪景观与北极光，到温暖的本地料理和节庆市集，这里让冬天同时显得电影化又真实可居。", curatedHighlights: "Curated Highlights", openGuide: "Open Full Guide",
      spots: [
        { label: "滑雪度假景观", title: "Finland Spot", description: "雪坡、缆车与苍白北光共同组成拉普兰平静的度假氛围。开阔景色与安静空气，是进入芬兰冬天最平和的方式之一。" },
        { label: "北极光", title: "Aurora Spot", description: "极光是芬兰冬季最具代表性的景象之一。绿色光波掠过黑暗的北方天空、山脊与森林，既自然又带着超现实感。" },
        { label: "三文鱼汤", title: "Salmon Soup Dish", description: "三文鱼汤是经典的芬兰冬季安慰料理，以鲜鲑、蔬菜和莳萝制成，口感细腻柔和，在寒冷日子里尤其令人满足。" },
        { label: "雪覆村庄", title: "Winter Village View", description: "当白昼渐暗，村庄的灯光开始在雪地上亮起。木屋、道路与屋顶逐渐柔化成一幅安静而亲密的冬日场景。" },
        { label: "圣诞老人村", title: "Santa Claus Village", description: "作为拉普兰知名站点，圣诞老人村把节庆魅力与北方冬景结合在一起。雪地、暖灯与节日装饰共同营造出明亮难忘的季节氛围。" },
        { label: "赫尔辛基圣诞市集", title: "Helsinki Christmas Market", description: "这座位于赫尔辛基大教堂前的圣诞市集汇集了灯光、美食、手工艺与经典旋转木马，是首都最具冬日氛围的场景之一。" },
        { label: "冬季节庆演出", title: "Seasonal Celebration", description: "公共表演与冬季聚会为芬兰寒冷的季节带来流动感与能量，也展现出一种不失北国平静的节庆社交面。" },
      ],
    },
  },
};

function IconBack() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
      <path d="M15 19 8 12l7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="18" cy="5" r="2" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="m8 11 8-5M8 13l8 5" strokeLinecap="round" />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 3.8A1.8 1.8 0 0 0 5.2 5.6v14.6l6.8-4.3 6.8 4.3V5.6A1.8 1.8 0 0 0 17 3.8H7Z" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg aria-hidden="true" className="ml-1 h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5.5v13l10-6.5-10-6.5Z" />
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

function SoftCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[28px] border border-white/8 bg-white/[0.045] p-7 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.6)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

function GuideSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <SoftCard className="h-full">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-100/80">
          {eyebrow}
        </span>
      </div>
      <h3 className="mb-5 text-[24px] font-semibold leading-tight text-white">{title}</h3>
      {children}
    </SoftCard>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
      <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-white/40">{label}</div>
      <div className="text-[22px] font-semibold text-white">{value}</div>
    </div>
  );
}

export function WeaveAiFinlandGuidePage() {
  const { wrapperStyle } = useAdaptivePageScale();
  const [language, setLanguage] = useState<WeaveLanguage>("EN");
  const [videoOpen, setVideoOpen] = useState(false);
  const [fullscreenMuted, setFullscreenMuted] = useState(true);
  const [openingPayload, setOpeningPayload] = useState<GuideOpenTransitionPayload | null>(null);
  const [openingExpanded, setOpeningExpanded] = useState(false);
  const [contentRevealStage, setContentRevealStage] = useState(4);
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const copy = FINLAND_GUIDE_COPY[language];

  const stayAreas = [
    {
      title: copy.stay.areas[0].title,
      description: copy.stay.areas[0].description,
      image: "/guide/finland-scene-05.jpg",
    },
    {
      title: copy.stay.areas[1].title,
      description: copy.stay.areas[1].description,
      image: "/guide/finland-scene-06.jpg",
    },
    {
      title: copy.stay.areas[2].title,
      description: copy.stay.areas[2].description,
      image: "/guide/finland-scene-01.jpg",
    },
  ];

  const winterGear = copy.protocol.gear;

  const finlandDossierImages = [
    "/guide/finland-scene-06.jpg",
    "/guide/finland-scene-03.jpg",
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
    "/guide/winter-village-view.jpg",
    "/guide/santa-claus-village.png",
    "/guide/helsinki-christmas-market.jpg",
    "/guide/seasonal-celebration.jpg",
  ];

  const finlandDossierSections = copy.fullscreen.spots.map((spot, index) => ({
    sectionTitle: spot.label,
    cardLabel: spot.title,
    cardTitle: spot.title,
    description: spot.description,
    image: finlandDossierImages[index],
  }));

  useEffect(() => {
    setLanguage(getStoredWeaveLanguage());

    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<WeaveLanguage>;
      setLanguage(customEvent.detail || getStoredWeaveLanguage());
    };

    window.addEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange as EventListener);
    return () => window.removeEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange as EventListener);
  }, []);

  useEffect(() => {
    const payload = readGuideOpenTransition("/home/guides/finland-winter-atmosphere-guide");
    if (!payload) {
      setContentRevealStage(4);
      return;
    }

    setOpeningPayload(payload);
    setContentRevealStage(0);
  }, []);

  useEffect(() => {
    if (!openingPayload || !heroRef.current) {
      return;
    }

    const rect = heroRef.current.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    const frame = window.requestAnimationFrame(() => setOpeningExpanded(true));
    const timers = [
      window.setTimeout(() => setContentRevealStage(1), 220),
      window.setTimeout(() => setContentRevealStage(2), 560),
      window.setTimeout(() => setContentRevealStage(3), 780),
      window.setTimeout(() => setContentRevealStage(4), 980),
      window.setTimeout(() => {
        clearGuideOpenTransition();
        setOpeningPayload(null);
      }, 1180),
    ];

    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [openingPayload]);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#080913] antialiased selection:bg-indigo-400/20">
      <div className="flex text-white" style={wrapperStyle}>
        <aside className="relative z-20 flex h-full w-[90px] shrink-0 flex-col items-center border-r border-white/10 bg-[linear-gradient(180deg,rgba(34,38,46,0.48)_0%,rgba(26,30,38,0.40)_100%)] py-6 text-white backdrop-blur-xl shadow-[6px_0_28px_-20px_rgba(0,0,0,0.16)]">
          <div className="flex w-full flex-col items-center gap-3 px-4">
            <Link
              aria-label="Back to home"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/[0.04] text-white/72 transition-colors hover:bg-white/[0.08] hover:text-white"
              href="/home"
            >
              <IconBack />
            </Link>
          </div>
        </aside>

        <main className="relative flex-1 overflow-y-auto">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(76,66,170,0.28),transparent_22%),radial-gradient(circle_at_70%_14%,rgba(103,80,255,0.16),transparent_20%),radial-gradient(circle_at_60%_82%,rgba(120,150,255,0.10),transparent_24%),linear-gradient(180deg,#090a16_0%,#100f22_42%,#171734_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(4,6,14,0.28)_58%,rgba(4,6,14,0.64)_100%)]" />
          <div className="weave-ai-grain absolute inset-0 opacity-[0.08]" />

          <div className="relative z-10 mx-auto max-w-[1380px] px-8 py-10 md:px-12 md:py-12 lg:px-16">
            {openingPayload && targetRect ? (
              <div className="pointer-events-none fixed inset-0 z-[140]">
                <div className="absolute inset-0 bg-[rgba(7,9,18,0.18)] backdrop-blur-[3px]" />
                <div
                  className="absolute overflow-hidden rounded-[30px] border border-white/12 bg-[#0d1120] shadow-[0_40px_120px_-36px_rgba(0,0,0,0.68)] transition-all duration-[980ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    height: `${openingExpanded ? targetRect.height : openingPayload.rect.height}px`,
                    left: `${openingExpanded ? targetRect.left : openingPayload.rect.left}px`,
                    top: `${openingExpanded ? targetRect.top : openingPayload.rect.top}px`,
                    width: `${openingExpanded ? targetRect.width : openingPayload.rect.width}px`,
                  }}
                >
                  <div className="relative h-full w-full overflow-hidden">
                    <img alt={openingPayload.title} className="h-full w-full object-cover" src={openingPayload.image} />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,18,0.05),rgba(8,10,18,0.4))]" />
                  </div>
                </div>
              </div>
            ) : null}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-100/85">
                  {copy.top.badge}
                </span>
                <span className="text-sm text-white/35">{copy.top.updated}</span>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.09] hover:text-white" type="button">
                  <IconShare />
                  {copy.top.share}
                </button>
                <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100" type="button">
                  <IconBookmark />
                  {copy.top.saveGuide}
                </button>
              </div>
            </div>

            <section
              ref={heroRef}
              className={`relative mb-10 overflow-hidden rounded-[36px] border border-white/8 bg-white/[0.04] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-[860ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                contentRevealStage >= 1 ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-[8px]"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr]">
                <div className="relative min-h-[420px] lg:min-h-[620px]">
                  <img alt="Finland winter skyline" className="h-full w-full object-cover" src="/guide/finland-scene-02.jpg" />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,18,0.16)_0%,rgba(7,9,18,0.08)_30%,rgba(7,9,18,0.38)_100%),linear-gradient(180deg,rgba(6,8,16,0.05)_0%,rgba(6,8,16,0.52)_100%)]" />
                  <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                    <div>
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/78 backdrop-blur-sm">
                        {copy.hero.route}
                      </div>
                      <h1 className="max-w-[620px] [font-family:var(--font-guide-serif),serif] text-[54px] leading-[0.95] tracking-tight text-white md:text-[72px]">
                        {copy.hero.title}
                      </h1>
                      <p className="mt-4 max-w-[520px] text-lg text-white/72 md:text-[21px]">
                        {copy.hero.subtitle}
                      </p>
                    </div>

                    <button
                      className="hidden h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-white/16 lg:flex"
                      onClick={() => setVideoOpen(true)}
                      type="button"
                    >
                      <IconPlay />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-8 p-8 md:p-10">
                  <div>
                    <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/42">{copy.summary.badge}</div>
                    <h2 className="mb-4 text-[30px] font-semibold leading-tight text-white">
                      {copy.summary.title}
                    </h2>
                    <p className="text-[15px] leading-7 text-white/62">
                      {copy.summary.body}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Metric label={copy.metrics.duration} value={copy.metrics.values[0]} />
                    <Metric label={copy.metrics.atmosphere} value={copy.metrics.values[1]} />
                    <Metric label={copy.metrics.idealBase} value={copy.metrics.values[2]} />
                    <Metric label={copy.metrics.bestMoment} value={copy.metrics.values[3]} />
                  </div>

                  <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                    <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-white/42">{copy.summary.streetMood}</div>
                    <div className="overflow-hidden rounded-[20px]">
                      <img alt="Helsinki winter route" className="h-[170px] w-full object-cover" src="/guide/finland-scene-06.jpg" />
                    </div>
                    <p className="mt-3 text-sm text-white/56">{copy.summary.streetCaption}</p>
                  </div>
                </div>
              </div>
            </section>

            <div
              className={`mb-8 grid grid-cols-1 gap-6 transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:grid-cols-[1.1fr_0.9fr] ${
                contentRevealStage >= 2 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <GuideSection eyebrow={copy.arrival.eyebrow} title={copy.arrival.title}>
                <div className="space-y-5">
                  <p className="max-w-[560px] text-[15px] leading-7 text-white/62">
                    {copy.arrival.body}
                  </p>

                  <div className="space-y-3">
                    {copy.arrival.rows.map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                        <span className="text-sm font-medium text-white/74">{label}</span>
                        <span className="text-sm text-white/52">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-amber-200/10 bg-amber-300/[0.06] px-4 py-4 text-[14px] leading-6 text-amber-100/82">
                    {copy.arrival.note}
                  </div>
                </div>
              </GuideSection>

              <GuideSection eyebrow={copy.stay.eyebrow} title={copy.stay.title}>
                <div className="space-y-4">
                  {stayAreas.map((area) => (
                    <div
                      key={area.title}
                      className="group flex items-center gap-4 rounded-[24px] border border-white/6 bg-black/18 p-3 transition hover:border-white/12 hover:bg-white/[0.05]"
                    >
                      <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[18px]">
                        <img alt={area.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={area.image} />
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-1 text-[17px] font-semibold text-white">{area.title}</h4>
                        <p className="text-[13px] leading-6 text-white/54">{area.description}</p>
                      </div>
                      <span className="text-white/28 transition group-hover:text-white/56">›</span>
                    </div>
                  ))}
                </div>
              </GuideSection>
            </div>

            <div
              className={`mb-8 grid grid-cols-1 gap-6 transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:grid-cols-[0.92fr_1.08fr] ${
                contentRevealStage >= 3 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <GuideSection eyebrow={copy.budget.eyebrow} title={copy.budget.title}>
                <div className="space-y-3">
                  {copy.budget.rows.map(([label, value, note]) => (
                    <div key={label} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-white/74">{label}</span>
                        <span className="text-sm font-semibold text-white">{value}</span>
                      </div>
                      <p className="text-[13px] leading-6 text-white/46">{note}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[22px] bg-white px-5 py-5 text-slate-950">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{copy.budget.estimate}</div>
                  <div className="text-[28px] font-semibold">{copy.budget.estimateRange}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{copy.budget.estimateBody}</p>
                </div>
              </GuideSection>

              <GuideSection eyebrow={copy.protocol.eyebrow} title={copy.protocol.title}>
                <div className="mb-5 rounded-[24px] border border-white/8 bg-black/20 p-5">
                  <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/42">{copy.protocol.layerTitle}</div>
                  <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/8">
                    <div className="bg-white/6 px-3 py-4 text-center text-[12px] font-medium text-white/64">{copy.protocol.layers[0]}</div>
                    <div className="bg-white/10 px-3 py-4 text-center text-[12px] font-medium text-white/72">{copy.protocol.layers[1]}</div>
                    <div className="bg-white/16 px-3 py-4 text-center text-[12px] font-medium text-white">{copy.protocol.layers[2]}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {winterGear.map(([title, note]) => (
                    <div key={title} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                      <div className="mb-1 text-sm font-medium text-white/78">{title}</div>
                      <div className="text-[12px] uppercase tracking-[0.18em] text-white/36">{note}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-sky-200/10 bg-sky-300/[0.05] px-4 py-4 text-[14px] leading-6 text-white/64">
                  {copy.protocol.note}
                </div>
              </GuideSection>
            </div>

            <SoftCard
              className={`overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] transition-all duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                contentRevealStage >= 4 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/14 bg-white/[0.08] text-[30px] text-amber-300 shadow-lg">
                  ✦
                </div>

                <div className="flex-1">
                  <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/40">{copy.guidance.badge}</div>
                  <h3 className="mb-3 text-[30px] font-semibold leading-tight text-white">{copy.guidance.title}</h3>
                  <p className="max-w-[820px] text-[15px] leading-7 text-white/58">
                    {copy.guidance.body}
                  </p>
                </div>

                <button className="shrink-0 rounded-full border border-white/12 bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-100" type="button">
                  {copy.guidance.cta}
                </button>
              </div>
            </SoftCard>

            <div className="h-24" />
          </div>

          {videoOpen ? (
            <div className="fixed inset-0 z-50 overflow-hidden bg-[#020305] text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(82,110,255,0.22),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(108,92,255,0.16),transparent_24%),linear-gradient(180deg,rgba(2,4,8,0.76)_0%,rgba(2,3,5,0.94)_100%)]" />

              <button
                aria-label="Close destination dossier"
                className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-white/72 transition hover:bg-white/[0.08] hover:text-white"
                onClick={() => setVideoOpen(false)}
                type="button"
              >
                <IconClose />
              </button>

              <div className="relative z-10 grid h-full w-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="relative flex min-h-0 flex-col border-r border-white/8">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(1,2,4,0.32)_0%,rgba(1,2,4,0.04)_24%,rgba(1,2,4,0.42)_100%)]" />

                  <div className="absolute left-6 top-6 z-10 flex items-center gap-3">
                    <span className="rounded-full border border-white/12 bg-black/24 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/54 backdrop-blur-md">
                      {copy.fullscreen.series}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.22em] text-white/32">{copy.fullscreen.episode}</span>
                  </div>

                  <div className="absolute bottom-8 left-8 z-10 max-w-[520px]">
                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/42">{copy.fullscreen.title}</div>
                  <h2 className="max-w-[460px] [font-family:var(--font-guide-serif),serif] text-[28px] leading-[1.04] tracking-tight text-white md:text-[36px]">
                      {copy.fullscreen.headline}
                    </h2>
                    <p className="mt-3 max-w-[460px] text-[13px] leading-6 text-white/58">
                      {copy.fullscreen.compactBody}
                    </p>
                  </div>

                  <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3">
                    <button
                      className="rounded-full border border-white/12 bg-black/24 px-4 py-2 text-[12px] font-medium text-white/72 backdrop-blur-md transition hover:bg-white/[0.08] hover:text-white"
                      onClick={() => setFullscreenMuted((value) => !value)}
                      type="button"
                    >
                      {fullscreenMuted ? (language === "JA" ? "ミュート解除" : language === "ZH" ? "取消静音" : "Unmute") : language === "JA" ? "ミュート" : language === "ZH" ? "静音" : "Mute"}
                    </button>
                  </div>

                  <video
                    aria-label="Finland destination film"
                    autoPlay
                    className="h-full w-full object-cover"
                    controls={false}
                    muted={fullscreenMuted}
                    playsInline
                    preload="metadata"
                    src="/api/media/finland"
                  />
                </section>

                <aside className="relative flex min-h-0 flex-col bg-[linear-gradient(180deg,rgba(7,9,14,0.98)_0%,rgba(6,8,12,0.98)_100%)]">
                  <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-9 pb-8 pt-20">
                    <div className="mb-6 border-b border-white/8 pb-6">
                      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/34">{copy.fullscreen.guideLabel}</div>
                      <h3 className="mb-3 [font-family:var(--font-guide-serif),serif] text-[24px] leading-[1.08] text-white">{copy.fullscreen.title}</h3>
                      <p className="text-[13px] leading-6 text-white/58">{copy.fullscreen.intro}</p>
                      <p className="mt-4 text-[13px] leading-6 text-white/58">
                        {copy.fullscreen.introBody}
                      </p>
                    </div>

                    <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/28">{copy.fullscreen.curatedHighlights}</div>
                    <div className="space-y-5">
                      {finlandDossierSections.map((item) => (
                        <article key={item.cardTitle} className="border-b border-white/8 pb-5 last:border-b-0 last:pb-0">
                          <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-white/30">{item.sectionTitle}</div>
                          <div className="mb-3 overflow-hidden rounded-[16px] border border-white/8 bg-white/[0.03]">
                            <img alt={item.cardTitle} className="h-[138px] w-full object-cover" src={item.image} />
                          </div>
                          <h4 className="mb-2 text-[18px] font-medium text-white">{item.cardLabel}</h4>
                          <p className="text-[13px] leading-6 text-white/54">{item.description}</p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/8 px-9 py-6">
                    <button className="w-full rounded-full border border-white/12 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.09]" type="button">
                      {copy.fullscreen.openGuide}
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
