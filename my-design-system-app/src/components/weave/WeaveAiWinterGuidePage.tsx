"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  clearGuideOpenTransition,
  clearGuideReturnTarget,
  readGuideOpenTransition,
  readGuideReturnTarget,
  type GuideOpenTransitionPayload,
} from "@/components/weave/guideOpenTransition";
import {
  WEAVE_LANGUAGE_EVENT,
  WeaveLanguage,
  getStoredWeaveLanguage,
} from "@/components/weave/weaveLanguage";
import { useAdaptivePageScale } from "@/components/weave/useAdaptivePageScale";

const WINTER_GUIDE_COPY: Record<
  WeaveLanguage,
  {
    rail: { saved: string; home: string; discover: string };
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
      location: string;
      headline: string;
      subtitle: string;
      compactBody: string;
      guideLabel: string;
      curatedHighlights: string;
      openGuide: string;
      spots: Array<{ label: string; title: string; description: string }>;
    };
  }
> = {
  EN: {
    rail: { saved: "Saved", home: "Home", discover: "Discover" },
    top: { badge: "Destination Guide", updated: "Updated 2 days ago", share: "Share", saveGuide: "Save Guide" },
    hero: {
      route: "Featured Winter Route",
      title: "Otaru, Hokkaido",
      subtitle: "A quiet luxury guide through snow-lit canals, seafood rituals, and calm winter movement.",
    },
    summary: {
      badge: "Weave Summary",
      title: "Sapporo & Otaru, composed for a slower winter rhythm.",
      body: "This guide is designed to reduce decision fatigue. It focuses on where to stay, how to move, what winter actually feels like on the ground, and how to keep the trip elegant instead of exhausting.",
      streetMood: "Street Mood",
      streetCaption: "Historical center walking route, best entered before sunset.",
    },
    metrics: {
      duration: "Duration",
      atmosphere: "Atmosphere",
      idealBase: "Ideal Base",
      bestMoment: "Best Moment",
      values: ["5 Days", "Quiet Snow", "Sapporo", "Blue Hour"],
    },
    arrival: {
      eyebrow: "Arrival",
      title: "How to enter the trip without friction",
      body: "New Chitose is the cleanest entry point. The ideal move is to keep the first transfer simple, reduce luggage drag, and decide early whether you want Sapporo as a base or one night inside Otaru for atmosphere.",
      rows: [["Tokyo to CTS", "Approx. 1h 30m to 1h 40m"], ["Airport to Sapporo", "Rapid Airport train, 37 to 40 min"], ["Airport to Otaru", "Direct rail, about 75 min total"]],
      note: "Winter weather can compress options fast. If timing matters, avoid over-optimistic connections and build in softness on arrival day.",
    },
    stay: {
      eyebrow: "Stay",
      title: "Three bases, three different emotional tempos",
      areas: [
        { title: "Sapporo Station", description: "Best if you want frictionless transfers, winter shopping, and fast access to day trips." },
        { title: "Odori Park", description: "The most balanced base during festival season, with calm mornings and strong city access." },
        { title: "Otaru Canal", description: "For the most cinematic evenings, after the day crowd leaves and the snow starts glowing." },
      ],
    },
    budget: {
      eyebrow: "Budget",
      title: "A premium winter range, not a backpacker spreadsheet",
      rows: [["Flights", "JPY 25k to 50k", "Festival peaks can push it far higher"], ["Hotel", "JPY 8k to 30k / night", "Business hotels stay efficient; Otaru mood stays pricier"], ["Daily food", "JPY 3k to 15k", "Seafood indulgence changes the curve quickly"]],
      estimate: "Weave Estimate",
      estimateRange: "JPY 60k to 120k",
      estimateBody: "A realistic 3-day range for comfort, movement, and one memorable dinner.",
    },
    protocol: {
      eyebrow: "Winter Protocol",
      title: "What keeps the trip graceful instead of draining",
      layerTitle: "Layering Logic",
      layers: ["Base", "Mid", "Outer"],
      gear: [["Snow Boots", "Absolute must"], ["Thermal Base Layer", "Daily essential"], ["Insulated Gloves", "Prefer waterproof"], ["Neck Warmer", "Cuts wind fatigue"], ["Heat Packs", "Buy locally"], ["Sunglasses", "Useful for snow glare"]],
      note: "Watch for black ice in the evening. If needed, buy anti-slip attachments locally instead of overpacking from day one.",
    },
    guidance: {
      badge: "Weave Guidance",
      title: "Preparation is the luxury layer.",
      body: "Hokkaido in winter becomes exceptional when the logistics disappear into the background. Dress for calm, choose a base that matches your pace, and let Otaru work as a mood rather than a checklist.",
      cta: "Download Checklist",
    },
    fullscreen: {
      series: "Weave Dossier",
      episode: "Episode 01",
      location: "Otaru, Hokkaido",
      headline: "Winter Rail & Canal Memory",
      subtitle: "The Winter Charm of Hokkaido: Sapporo & Otaru",
      compactBody: "Otaru is one of Hokkaido’s most iconic port towns, known for its retro canal, stone warehouses, and nostalgic atmosphere. In winter, the city is wrapped in snow, creating a romantic mood, while at night it comes alive with dazzling illuminations and a food scene that rivals any major city.",
      guideLabel: "AI-Curated Travel Guide",
      curatedHighlights: "Curated Highlights",
      openGuide: "Open Full Guide",
      spots: [
        { label: "Otaru City Center & Around Otaru Station", title: "Otaru Spot", description: "The snowy scenery and passing trains perfectly capture the winter spirit of Hokkaido. Around the historic JR Otaru Station, there is a nostalgic atmosphere that reflects the town’s slow pace and rich history." },
        { label: "Funamizaka", title: "Funamizaka Spot", description: "One of Otaru’s most famous slopes, Funamizaka is also known as a filming location for the movie Love Letter. From the top of the hill, you can look straight down the road toward Otaru Port, with the town spreading out below. In winter, the snow-covered view feels almost cinematic." },
        { label: "Susukino Intersection", title: "Susukino Intersection", description: "The heart of Susukino, Sapporo’s largest entertainment district. The iconic NIKKA WHISKY neon sign lights up the area, while countless restaurants, bars, and shops fill the surrounding streets. It is one of the best places to experience the lively energy of Sapporo at night." },
        { label: "Moiwa Night View", title: "Moiwa Night View", description: "The night view from Mount Moiwa is considered one of Japan’s “New Three Great Night Views.” After taking the ropeway to the summit, you can enjoy a 360-degree panorama of Sapporo, where the snow-covered city sparkles like jewels below." },
        { label: "Shiroi Koibito Soft Serve", title: "Shiroi Koibito Soft Serve", description: "Shiroi Koibito is one of Hokkaido’s most famous souvenirs. The soft serve ice cream, made with the same white chocolate and Hokkaido milk, is known for its rich, smooth, and creamy flavor." },
        { label: "Unaju", title: "Unaju Dish", description: "Unaju is a beloved dish enjoyed throughout Japan. Grilled with a fragrant sweet-savory sauce, the eel is crispy on the outside and tender on the inside. Served over warm rice, it is a luxurious meal that gently restores your energy during a trip." },
        { label: "Jingisukan", title: "Jingisukan Dish", description: "A signature local dish of Hokkaido, Jingisukan features lamb and vegetables grilled on a special dome-shaped pan. The meat is tender and juicy, and pairs perfectly with the savory sauce. It is one of the must-try dishes when visiting Hokkaido." },
        { label: "Original Sapporo Ramen Alley", title: "Ramen Alley", description: "Sapporo is known as the birthplace of miso ramen. In the narrow lane known as Ramen Alley, long-established shops preserve a nostalgic Showa-era atmosphere. On a snowy night, a steaming hot bowl of ramen here feels especially unforgettable." },
        { label: "Odori Park & Sapporo TV Tower", title: "Odori Park and Sapporo TV Tower", description: "Stretching through the center of Sapporo, Odori Park is both a place of relaxation for locals and a venue for many major events. During the Sapporo White Illumination, the entire park glows with lights, and the TV Tower shines beautifully above the scene. In winter, the Sapporo Snow Festival is also held here, making it one of the most symbolic places to experience the season in Sapporo." },
      ],
    },
  },
  JA: {
    rail: { saved: "保存", home: "ホーム", discover: "発見" },
    top: { badge: "旅先ガイド", updated: "2日前に更新", share: "共有", saveGuide: "ガイドを保存" },
    hero: { route: "注目の冬ルート", title: "小樽、北海道", subtitle: "雪に照らされた運河、海鮮の時間、静かな冬の移動をめぐる穏やかなガイド。" },
    summary: { badge: "Weave Summary", title: "札幌と小樽を、よりゆるやかな冬のリズムに合わせて構成。", body: "このガイドは判断の疲れを減らすために作られています。どこに泊まるか、どう移動するか、冬が現地で実際にどう感じられるか、そして旅を消耗ではなく上質な体験にする方法に集中しています。", streetMood: "街のムード", streetCaption: "歴史地区の散策ルート。日没前の時間帯が最適。" },
    metrics: { duration: "日数", atmosphere: "空気感", idealBase: "拠点", bestMoment: "ベストタイム", values: ["5日間", "静かな雪景色", "札幌", "ブルーアワー"] },
    arrival: { eyebrow: "到着", title: "無理なく旅に入る方法", body: "新千歳空港が最もスムーズな入口です。最初の移動はできるだけシンプルにし、荷物の負担を減らし、札幌を拠点にするか、小樽に一泊して雰囲気を味わうかを早めに決めるのが理想です。", rows: [["東京→CTS", "約1時間30分〜1時間40分"], ["空港→札幌", "快速エアポートで約37〜40分"], ["空港→小樽", "直通列車で約75分"]], note: "冬の天候で選択肢はすぐ圧縮されます。時間が大事なら、楽観的すぎる乗り継ぎを避け、到着日は余白を持たせてください。" },
    stay: { eyebrow: "滞在", title: "感情のテンポが異なる3つの拠点", areas: [{ title: "札幌駅周辺", description: "乗り換えのしやすさ、冬の買い物、日帰り移動のしやすさを重視するなら最適。" }, { title: "大通公園周辺", description: "祭りの時期に最もバランスがよく、静かな朝と高い都市アクセスを両立。" }, { title: "小樽運河周辺", description: "人が引いた後、雪が光り始める時間の映画的な夜景を重視するならここ。" }] },
    budget: { eyebrow: "予算", title: "バックパッカー表ではない、上質な冬のレンジ", rows: [["航空券", "25,000〜50,000円", "繁忙期はさらに上がりやすい"], ["ホテル", "8,000〜30,000円 / 泊", "ビジネスホテルは効率的、小樽の雰囲気宿はやや高め"], ["食事", "3,000〜15,000円 / 日", "海鮮を楽しむほど上振れしやすい"]], estimate: "Weave Estimate", estimateRange: "60,000〜120,000円", estimateBody: "快適さ、移動、印象的な夕食を含む3日間の現実的な目安。" },
    protocol: { eyebrow: "冬のプロトコル", title: "旅を消耗ではなく優雅に保つポイント", layerTitle: "重ね着の考え方", layers: ["ベース", "ミドル", "アウター"], gear: [["スノーブーツ", "必須"], ["保温インナー", "毎日の基本"], ["断熱グローブ", "防水推奨"], ["ネックウォーマー", "風疲れを抑える"], ["カイロ", "現地購入で十分"], ["サングラス", "雪の照り返し対策"]], note: "夜はブラックアイスに注意。必要なら最初から持ち込むより、現地で滑り止めを買う方が軽やかです。" },
    guidance: { badge: "Weave Guidance", title: "準備こそがラグジュアリーです。", body: "北海道の冬は、移動の負担が背景に消えたときに本当に特別になります。静けさのために装い、ペースに合う拠点を選び、小樽をチェックリストではなくムードとして味わってください。", cta: "チェックリストを保存" },
    fullscreen: {
      series: "Weave Dossier", episode: "Episode 01", location: "小樽、北海道", headline: "冬の線路と運河の記憶", subtitle: "北海道冬の魅力：札幌＆小樽", compactBody: "小樽は、レトロな運河や石造りの倉庫群、どこか懐かしい空気で知られる北海道を代表する港町です。冬になると街は雪に包まれ、ロマンチックな雰囲気に変わり、夜には華やかなイルミネーションと豊かな食が街を明るくします。", guideLabel: "AI Curated Travel Guide", curatedHighlights: "Curated Highlights", openGuide: "Open Full Guide",
      spots: [
        { label: "小樽市街と小樽駅周辺", title: "小樽スポット", description: "雪景色と行き交う列車が、北海道の冬らしさを鮮やかに伝えます。歴史あるJR小樽駅の周辺には、この街のゆるやかな時間と記憶を映す懐かしい空気が漂っています。" },
        { label: "船見坂", title: "船見坂スポット", description: "船見坂は小樽を代表する坂のひとつで、映画『Love Letter』のロケ地としても知られています。坂の上からは小樽港へまっすぐ伸びる道と街並みを見下ろすことができ、冬の雪景色はまるで映画のワンシーンのようです。" },
        { label: "すすきの交差点", title: "すすきの交差点", description: "札幌最大の歓楽街・すすきのの中心。象徴的なNIKKA WHISKYのネオンが街を照らし、周囲には数えきれない飲食店やバー、ショップが並びます。札幌の夜のエネルギーを最も感じやすい場所です。" },
        { label: "藻岩山の夜景", title: "藻岩山の夜景", description: "藻岩山からの夜景は『新日本三大夜景』のひとつ。ロープウェイで山頂へ上がると、雪をまとった札幌の街が宝石のようにきらめく360度のパノラマが広がります。" },
        { label: "白い恋人ソフトクリーム", title: "白い恋人ソフト", description: "白い恋人は北海道を代表するお土産のひとつ。同じホワイトチョコレートと北海道産ミルクを使ったソフトクリームは、濃厚でなめらかな口当たりが魅力です。" },
        { label: "うな重", title: "うな重", description: "うな重は日本各地で愛される料理。甘辛いタレで香ばしく焼かれたうなぎは、外は香ばしく中はふっくら。温かいご飯の上で、旅の疲れを静かにほどいてくれます。" },
        { label: "ジンギスカン", title: "ジンギスカン", description: "北海道を代表する郷土料理。特製のドーム型鍋で焼くラム肉と野菜はやわらかくジューシーで、香ばしいタレとの相性も抜群です。北海道に来たら外せない一皿です。" },
        { label: "元祖さっぽろラーメン横丁", title: "ラーメン横丁", description: "札幌は味噌ラーメン発祥の地として知られています。ラーメン横丁と呼ばれる細い路地には昭和の空気を残す老舗が並び、雪の夜に食べる熱々の一杯は格別です。" },
        { label: "大通公園＆さっぽろテレビ塔", title: "大通公園とさっぽろテレビ塔", description: "札幌中心部を貫く大通公園は、市民の憩いの場であり、多くの催しの会場でもあります。さっぽろホワイトイルミネーションの時期には公園全体が光に包まれ、テレビ塔が美しく浮かび上がります。冬の札幌を象徴する場所です。" },
      ],
    },
  },
  ZH: {
    rail: { saved: "收藏", home: "主页", discover: "发现" },
    top: { badge: "目的地指南", updated: "2天前更新", share: "分享", saveGuide: "保存指南" },
    hero: { route: "冬季精选路线", title: "小樽，北海道", subtitle: "一份围绕雪中运河、海鲜节奏与平静冬日移动展开的安静奢华指南。" },
    summary: { badge: "Weave Summary", title: "札幌与小樽，为更缓慢的冬季节奏而编排。", body: "这份指南的目标是减少决策疲劳。它聚焦住在哪里、如何移动、冬天在现场究竟是什么感觉，以及如何让旅程保持优雅而不是耗人。", streetMood: "街区氛围", streetCaption: "历史街区步行路线，最适合在日落前进入。" },
    metrics: { duration: "时长", atmosphere: "氛围", idealBase: "理想据点", bestMoment: "最佳时段", values: ["5天", "安静雪景", "札幌", "蓝调时刻"] },
    arrival: { eyebrow: "抵达", title: "如何顺畅进入这段旅程", body: "新千岁机场是最干净利落的入口。理想的方式是让第一次转移尽量简单，减少行李拖累，并尽早决定以札幌为基地，还是在小樽住上一晚来换取气氛。", rows: [["东京 → CTS", "约1小时30分到1小时40分"], ["机场 → 札幌", "Rapid Airport 约37到40分钟"], ["机场 → 小樽", "直达铁路约75分钟"]], note: "冬季天气会迅速压缩选择空间。如果时间很关键，不要做过于乐观的衔接安排，抵达日尽量留出余量。" },
    stay: { eyebrow: "停留", title: "三种基地，三种不同的冬日节奏", areas: [{ title: "札幌站周边", description: "如果你更在意换乘效率、冬季购物和日间出行，这里最合适。" }, { title: "大通公园周边", description: "节庆时期最平衡的据点，安静的清晨和强城市通达性兼得。" }, { title: "小樽运河周边", description: "如果你想要更有电影感的夜晚，在人潮散去、雪面开始发光之后，这里最好。" }] },
    budget: { eyebrow: "预算", title: "这是一份高级冬季预算，不是背包客表格", rows: [["机票", "25,000 到 50,000 日元", "节庆高峰会明显抬高价格"], ["酒店", "8,000 到 30,000 日元 / 晚", "商务酒店更高效，小樽氛围型住宿更贵"], ["餐饮", "3,000 到 15,000 日元 / 天", "海鲜体验越多，预算越容易上浮"]], estimate: "Weave Estimate", estimateRange: "60,000 到 120,000 日元", estimateBody: "适合舒适出行、移动与一顿难忘晚餐的三日现实区间。" },
    protocol: { eyebrow: "冬季协议", title: "让旅程保持体面而不被消耗的关键", layerTitle: "穿搭逻辑", layers: ["内层", "中层", "外层"], gear: [["雪地靴", "绝对必备"], ["保暖底层", "每日基础"], ["保温手套", "建议防水"], ["脖套", "能有效减轻风寒疲劳"], ["暖宝宝", "本地购买即可"], ["太阳镜", "适合应对雪地反光"]], note: "傍晚要注意黑冰。如果需要，最好在当地购买防滑附件，而不是从第一天就把行李塞满。" },
    guidance: { badge: "Weave Guidance", title: "准备本身就是奢华层。", body: "北海道的冬天，在交通与后勤退到背景之后才真正显出魅力。为了平静而穿衣，选择与你节奏匹配的据点，把小樽当作一种氛围而不是待办清单。", cta: "下载清单" },
    fullscreen: {
      series: "Weave Dossier", episode: "Episode 01", location: "小樽，北海道", headline: "冬日铁路与运河记忆", subtitle: "北海道冬日魅力：札幌与小樽", compactBody: "小樽是北海道最具代表性的港町之一，以复古运河、石造仓库与怀旧氛围闻名。到了冬天，整座城市被白雪包裹，呈现出浪漫气息，而到了夜晚，璀璨灯饰与能与大城市匹敌的美食又让它重新鲜活起来。", guideLabel: "AI Curated Travel Guide", curatedHighlights: "Curated Highlights", openGuide: "Open Full Guide",
      spots: [
        { label: "小樽市中心与小樽站周边", title: "小樽景点", description: "雪景与穿行的列车精准地呈现了北海道冬日的气质。JR小樽站周边带着怀旧氛围，也映照出这座城市缓慢而有历史厚度的节奏。" },
        { label: "船见坂", title: "船见坂景点", description: "船见坂是小樽最著名的坡道之一，也因为电影《情书》的取景而被熟知。站在坡顶，可以一直望向通往小樽港的道路与下方街区。冬日覆雪后的视角几乎像电影镜头。" },
        { label: "薄野十字路口", title: "薄野十字路口", description: "这里是札幌最大娱乐区薄野的核心地带。标志性的 NIKKA WHISKY 霓虹点亮整片街区，四周布满餐厅、酒吧与商店，是感受札幌夜晚活力的最佳地点之一。" },
        { label: "藻岩山夜景", title: "藻岩山夜景", description: "藻岩山夜景被认为是日本“新三大夜景”之一。搭乘缆车上山后，可以俯瞰整个札幌，白雪覆盖的城市像珠宝一样在脚下闪耀。" },
        { label: "白色恋人冰淇淋", title: "白色恋人冰淇淋", description: "白色恋人是北海道最著名的伴手礼之一。用同样的白巧克力与北海道牛奶制成的冰淇淋口感浓郁、顺滑而细腻。" },
        { label: "鳗鱼饭", title: "鳗鱼饭", description: "鳗鱼饭是日本各地都喜爱的经典料理。带着甜咸酱香烤出的鳗鱼外层微脆、内部柔软，搭配热米饭，是旅途中能温柔补足能量的一餐。" },
        { label: "成吉思汗烤肉", title: "成吉思汗烤肉", description: "这是北海道代表性的地方料理之一。羊肉与蔬菜在特制圆顶锅上炙烤，肉质鲜嫩多汁，与酱汁的搭配非常出色，是到北海道必须尝的一道菜。" },
        { label: "元祖札幌拉面横丁", title: "拉面横丁", description: "札幌被视为味噌拉面的发源地。在被称作拉面横丁的狭窄巷道里，老店维持着昭和时代的气氛。雪夜里来一碗热气腾腾的拉面，格外难忘。" },
        { label: "大通公园与札幌电视塔", title: "大通公园与札幌电视塔", description: "贯穿札幌中心的大通公园既是市民休憩之地，也是许多大型活动的会场。白色灯饰节期间，整座公园都会被光包围，电视塔也在上方发亮。这里是体验札幌冬天最具象征性的地点之一。" },
      ],
    },
  },
};

function RailItem({
  active,
  label,
}: {
  active?: boolean;
  label: string;
}) {
  return (
    <button className="group flex w-full flex-col items-center gap-1.5 outline-none" type="button">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
          active
            ? "border border-white/12 bg-white/[0.06] text-white shadow-[0_8px_20px_-14px_rgba(0,0,0,0.22)] backdrop-blur-md"
            : "text-white/60 group-hover:bg-white/[0.045] group-hover:text-white/88"
        }`}
      />
      <span
        className={`text-[10px] tracking-wide ${
          active ? "font-semibold text-white/88" : "font-medium text-white/48 group-hover:text-white/76"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

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

export function WeaveAiWinterGuidePage() {
  const router = useRouter();
  const { wrapperStyle } = useAdaptivePageScale();
  const [language, setLanguage] = useState<WeaveLanguage>("EN");
  const [videoOpen, setVideoOpen] = useState(false);
  const [fullscreenMuted, setFullscreenMuted] = useState(true);
  const [openingPayload, setOpeningPayload] = useState<GuideOpenTransitionPayload | null>(null);
  const [openingExpanded, setOpeningExpanded] = useState(false);
  const [contentRevealStage, setContentRevealStage] = useState(4);
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [backHref, setBackHref] = useState("/home");
  const heroRef = useRef<HTMLElement | null>(null);
  const copy = WINTER_GUIDE_COPY[language];

  useEffect(() => {
    setLanguage(getStoredWeaveLanguage());

    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<WeaveLanguage>;
      setLanguage(customEvent.detail || getStoredWeaveLanguage());
    };

    window.addEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange as EventListener);
    return () => window.removeEventListener(WEAVE_LANGUAGE_EVENT, handleLanguageChange as EventListener);
  }, []);

  const stayAreas = [
    {
      title: copy.stay.areas[0].title,
      description: copy.stay.areas[0].description,
      image: "/guide/sapporostation.jpg",
    },
    {
      title: copy.stay.areas[1].title,
      description: copy.stay.areas[1].description,
      image: "/guide/odoripark.jpg",
    },
    {
      title: copy.stay.areas[2].title,
      description: copy.stay.areas[2].description,
      image: "/guide/otarucanal.jpg",
    },
  ];

  const winterGear = copy.protocol.gear;

  const fullscreenSpotlight = [
    {
      label: "Blue-hour entry",
      title: "Canal after dusk",
      description: "The city becomes quieter after 5pm, when reflections and snow light do most of the work.",
      image: "https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=800&q=80",
    },
    {
      label: "Rail texture",
      title: "Station district",
      description: "A better first impression than the canal if you want the working rhythm of winter Hokkaido.",
      image: "/dossier/otaru-spot.svg",
    },
    {
      label: "Dinner logic",
      title: "Seafood and warmth",
      description: "Keep one meal unscheduled and spend it on crab, uni, or a slower izakaya near the water.",
      image: "https://images.unsplash.com/photo-1542051812871-757508250f28?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const otaruDossierSections = [
    {
      sectionTitle: "Otaru City Center & Around Otaru Station",
      cardLabel: "Otaru Spot",
      cardTitle: "Otaru Spot",
      description:
        "The snowy scenery and passing trains perfectly capture the winter spirit of Hokkaido. Around the historic JR Otaru Station, there is a nostalgic atmosphere that reflects the town’s slow pace and rich history.",
      image: "https://images.unsplash.com/photo-1590403758838-89c568858e7d?auto=format&fit=crop&w=800&q=80",
    },
    {
      sectionTitle: "Funamizaka",
      cardLabel: "Funamizaka Spot",
      cardTitle: "Funamizaka Spot",
      description:
        "One of Otaru’s most famous slopes, Funamizaka is also known as a filming location for the movie Love Letter. From the top of the hill, you can look straight down the road toward Otaru Port, with the town spreading out below. In winter, the snow-covered view feels almost cinematic.",
      image: "/dossier/funamizaka-spot.svg",
    },
    {
      sectionTitle: "Susukino Intersection",
      cardLabel: "Susukino Intersection",
      cardTitle: "Susukino Intersection",
      description:
        "The heart of Susukino, Sapporo’s largest entertainment district. The iconic NIKKA WHISKY neon sign lights up the area, while countless restaurants, bars, and shops fill the surrounding streets. It is one of the best places to experience the lively energy of Sapporo at night.",
      image: "/dossier/susukino-intersection.svg",
    },
    {
      sectionTitle: "Moiwa Night View",
      cardLabel: "Moiwa Night View",
      cardTitle: "Moiwa Night View",
      description:
        "The night view from Mount Moiwa is considered one of Japan’s “New Three Great Night Views.” After taking the ropeway to the summit, you can enjoy a 360-degree panorama of Sapporo, where the snow-covered city sparkles like jewels below.",
      image: "/dossier/moiwa-night-view.svg",
    },
    {
      sectionTitle: "Shiroi Koibito Soft Serve",
      cardLabel: "Shiroi Koibito Soft Serve",
      cardTitle: "Shiroi Koibito Soft Serve",
      description:
        "Shiroi Koibito is one of Hokkaido’s most famous souvenirs. The soft serve ice cream, made with the same white chocolate and Hokkaido milk, is known for its rich, smooth, and creamy flavor.",
      image: "/dossier/shiroi-koibito-soft-serve.svg",
    },
    {
      sectionTitle: "Unaju",
      cardLabel: "Unaju Dish",
      cardTitle: "Unaju Dish",
      description:
        "Unaju is a beloved dish enjoyed throughout Japan. Grilled with a fragrant sweet-savory sauce, the eel is crispy on the outside and tender on the inside. Served over warm rice, it is a luxurious meal that gently restores your energy during a trip.",
      image: "/dossier/unaju-dish.svg",
    },
    {
      sectionTitle: "Jingisukan",
      cardLabel: "Jingisukan Dish",
      cardTitle: "Jingisukan Dish",
      description:
        "A signature local dish of Hokkaido, Jingisukan features lamb and vegetables grilled on a special dome-shaped pan. The meat is tender and juicy, and pairs perfectly with the savory sauce. It is one of the must-try dishes when visiting Hokkaido.",
      image: "/dossier/jingisukan-dish.svg",
    },
    {
      sectionTitle: "Original Sapporo Ramen Alley",
      cardLabel: "Ramen Alley",
      cardTitle: "Ramen Alley",
      description:
        "Sapporo is known as the birthplace of miso ramen. In the narrow lane known as Ramen Alley, long-established shops preserve a nostalgic Showa-era atmosphere. On a snowy night, a steaming hot bowl of ramen here feels especially unforgettable.",
      image: "/dossier/ramen-alley.svg",
    },
    {
      sectionTitle: "Odori Park & Sapporo TV Tower",
      cardLabel: "Odori Park and Sapporo TV Tower",
      cardTitle: "Odori Park and Sapporo TV Tower",
      description:
        "Stretching through the center of Sapporo, Odori Park is both a place of relaxation for locals and a venue for many major events. During the Sapporo White Illumination, the entire park glows with lights, and the TV Tower shines beautifully above the scene. In winter, the Sapporo Snow Festival is also held here, making it one of the most symbolic places to experience the season in Sapporo.",
      image: "/dossier/odori-park-and-sapporo-tv-tower.svg",
    },
  ];

  const localizedOtaruDossierImages = [
    "/dossier/otaru-spot.svg",
    "/dossier/funamizaka-spot.svg",
    "/dossier/susukino-intersection.svg",
    "/dossier/moiwa-night-view.svg",
    "/dossier/shiroi-koibito-soft-serve.svg",
    "/dossier/unaju-dish.svg",
    "/dossier/jingisukan-dish.svg",
    "/dossier/ramen-alley.svg",
    "/dossier/odori-park-and-sapporo-tv-tower.svg",
  ] as const;

  const localizedOtaruDossierSections = copy.fullscreen.spots.map((spot, index) => ({
    sectionTitle: spot.label,
    cardLabel: spot.title,
    cardTitle: spot.title,
    description: spot.description,
    image: localizedOtaruDossierImages[index],
  }));

  useEffect(() => {
    const payload = readGuideOpenTransition("/home/guides/sapporo-otaru-winter-guide");
    const returnTarget = readGuideReturnTarget("/home/guides/sapporo-otaru-winter-guide");
    if (returnTarget) {
      setBackHref(returnTarget);
    }
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

  const handleBack = () => {
    if (backHref !== "/home") {
      clearGuideReturnTarget();
    }
    router.push(backHref);
  };

  return (
    <div
      className="h-screen w-full overflow-hidden bg-[#080913] antialiased selection:bg-indigo-400/20"
    >
      <div className="flex text-white" style={wrapperStyle}>
      <aside className="relative z-20 hidden h-full w-[90px] shrink-0 flex-col items-center border-r border-white/10 bg-[linear-gradient(180deg,rgba(34,38,46,0.48)_0%,rgba(26,30,38,0.40)_100%)] py-6 text-white backdrop-blur-xl shadow-[6px_0_28px_-20px_rgba(0,0,0,0.16)] md:flex">
        <div className="flex w-full flex-col items-center gap-3 px-4">
          <button
            aria-label="Back to home"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/[0.04] text-white/72 transition-colors hover:bg-white/[0.08] hover:text-white"
            onClick={handleBack}
            type="button"
          >
            <IconBack />
          </button>
        </div>

      </aside>

      <main className="relative flex-1 overflow-y-auto">
        <button
          aria-label="Back to home"
          className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-[rgba(15,18,30,0.72)] text-white/78 shadow-[0_14px_36px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-colors hover:bg-[rgba(24,29,46,0.9)] hover:text-white md:hidden"
          onClick={handleBack}
          type="button"
        >
          <IconBack />
        </button>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(76,66,170,0.28),transparent_22%),radial-gradient(circle_at_70%_14%,rgba(103,80,255,0.16),transparent_20%),radial-gradient(circle_at_60%_82%,rgba(120,150,255,0.10),transparent_24%),linear-gradient(180deg,#090a16_0%,#100f22_42%,#171734_100%)]"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(4,6,14,0.28)_58%,rgba(4,6,14,0.64)_100%)]"
        />
        <div className="weave-ai-grain absolute inset-0 opacity-[0.08]" />

        <div className="relative z-10 mx-auto max-w-[1380px] px-4 py-20 md:px-12 md:py-12 lg:px-16">
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
                <img
                  alt="Snowy Otaru Canal at night"
                  className="h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1800&q=80"
                />
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
                    <p className="mt-4 text-[13px] leading-6 text-white/58">{copy.fullscreen.compactBody}</p>
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
                    <img
                      alt="Historical center walking route"
                      className="h-[170px] w-full object-cover"
                      src="/discover/slope-street.jpg"
                    />
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
                <p className="max-w-[560px] text-[15px] leading-7 text-white/62">{copy.arrival.body}</p>

                <div className="space-y-3">
                  {copy.arrival.rows.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                      <span className="text-sm font-medium text-white/74">{label}</span>
                      <span className="text-sm text-white/52">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-amber-200/10 bg-amber-300/[0.06] px-4 py-4 text-[14px] leading-6 text-amber-100/82">{copy.arrival.note}</div>
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

              <div className="mt-5 rounded-2xl border border-sky-200/10 bg-sky-300/[0.05] px-4 py-4 text-[14px] leading-6 text-white/64">{copy.protocol.note}</div>
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
                  <p className="max-w-[820px] text-[15px] leading-7 text-white/58">{copy.guidance.body}</p>
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
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/42">{copy.fullscreen.location}</div>
                  <h2 className="max-w-[460px] [font-family:var(--font-guide-serif),serif] text-[28px] leading-[1.04] tracking-tight text-white md:text-[36px]">
                    {copy.fullscreen.headline}
                  </h2>
                  <p className="mt-3 max-w-[460px] text-[13px] leading-6 text-white/58">{copy.fullscreen.compactBody}</p>
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
                  aria-label="Hokkaido destination film"
                  autoPlay
                  className="h-full w-full object-cover"
                  controls={false}
                  muted={fullscreenMuted}
                  playsInline
                  preload="metadata"
                  src="/api/media/hokkaido"
                />
              </section>

              <aside className="relative flex min-h-0 flex-col bg-[linear-gradient(180deg,rgba(7,9,14,0.98)_0%,rgba(6,8,12,0.98)_100%)]">
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-9 pb-8 pt-20">
                  <div className="mb-6 border-b border-white/8 pb-6">
                    <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/34">{copy.fullscreen.guideLabel}</div>
                    <h3 className="mb-3 [font-family:var(--font-guide-serif),serif] text-[24px] leading-[1.08] text-white">
                      Otaru
                    </h3>
                    <p className="text-[13px] leading-6 text-white/58">
                      {copy.fullscreen.subtitle}
                    </p>
                    <p className="hidden mt-4 text-[13px] leading-6 text-white/58">
                      Otaru is one of Hokkaido’s most iconic port towns, known for its retro canal, stone warehouses, and nostalgic atmosphere. In winter, the city is wrapped in snow, creating a romantic mood, while at night it comes alive with dazzling illuminations and a food scene that rivals any major city.
                    </p>
                  </div>

                  <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/28">{copy.fullscreen.curatedHighlights}</div>
                  <div className="space-y-5">
                    {localizedOtaruDossierSections.map((item) => (
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
