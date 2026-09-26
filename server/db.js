const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'unique.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    salt TEXT NOT NULL,
    hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    budget TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'yangi',
    source TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pageviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    referrer TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    name TEXT NOT NULL,
    phone TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed',
    meet_link TEXT,
    calendar_event_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (lead_id) REFERENCES leads(id)
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT NOT NULL,
    image_url TEXT,
    author TEXT NOT NULL DEFAULT 'Unique Media Buying',
    read_time TEXT NOT NULL DEFAULT '5 daqiqa',
    views INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function ensureDefaultAdmin(email, password) {
  const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);
  if (existing) return;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  db.prepare('INSERT INTO admins (email, salt, hash, created_at) VALUES (?, ?, ?, ?)')
    .run(email, salt, hash, new Date().toISOString());
}

const SEED_ARTICLES = [
  // ==========================================
  // FACEBOOK & META ADS (10 Articles)
  // ==========================================
  {
    slug: 'facebook-instagram-moderation-report-2026',
    title: '2026-yilning birinchi yarmi bo‘yicha Facebook va Instagram kontent moderatsiyasi hisoboti',
    excerpt: 'Meta kompaniyasi 2026-yil H1 bo‘yicha kontent moderatsiyasi, o‘chirishlar, apellatsiyalar, soxta akkauntlar va spamga qarshi kurash bo‘yicha rasmiy statistikasini taqdim etdi.',
    category: 'facebook',
    tags: ['Facebook', 'Instagram', 'Meta', 'Moderatsiya', 'Hisobot', 'MediaBuying'],
    image_url: 'https://cpa.rip/wp-content/uploads/2026/09/234512343-2.png',
    author: 'The Unique Media',
    read_time: '7 daqiqa',
    views: 245,
    created_at: '2026-09-14T09:00:00.000Z',
    content: `
      <p class="lead-paragraph">Meta kompaniyasi 2026-yilning birinchi yarim yilligi (H1 2026) bo‘yicha Facebook va Instagram platformalarida kontent moderatsiyasi, blokirovkalar, apellatsiyalar, soxta akkauntlar va spamga qarshi kurash bo‘yicha rasmiy hisobotini e’lon qildi. Quyida media buyerlar va targetologlar uchun eng muhim tahlillar keltirilgan.</p>
      <h2>1. Umumiy moderatsiya ko‘rsatkichlari</h2>
      <p>2026-yilning birinchi yarmida Facebook’da 487 million, Instagram’da esa 213 million ta kontent birligi o‘chirildi.</p>
      <h2>2. Xato blokirovkalar (False positives)</h2>
      <p>Tizim xatoligi sababli Facebook’da 58 millionga yaqin, Instagram’da esa 19 million kontent adashib cheklovga uchragan.</p>
      <h2>3. Apellatsiyalar statistikasi</h2>
      <p>2025-yilda shikoyatlarning 60% qismi ijobiy hal bo‘lgan bo‘lsa, 2026-yilda bu ko‘rsatkich <strong>14–17% gacha tushib ketdi</strong>. Zaxira akkauntlar tizimi bilan ishlash shart.</p>
    `
  },
  {
    slug: 'fb-in-market-categories-testing',
    title: 'Facebook Ads batafsil targetlashda "In-market categories" funksiyasini test qilmoqda',
    excerpt: 'Meta reklama kabinetlarida Detailed Targeting ichida "In-market categories" toifasini sinovdan o‘tkazmoqda. Xarid niyati yuqori issiq auditoriyani qamrab olish imkoniyati.',
    category: 'facebook',
    tags: ['Facebook', 'FacebookAds', 'Targeting', 'InMarket', 'MediaBuying'],
    image_url: 'https://cpa.rip/wp-content/uploads/2026/09/facebook_ads_payment_status_1200x5364.png',
    author: 'The Unique Media',
    read_time: '3 daqiqa',
    views: 198,
    created_at: '2026-09-10T09:56:14.000Z',
    content: `
      <p class="lead-paragraph">Facebook Ads reklamachilar uchun ayni paytda muayyan tovar yoki xizmatlarni qidirayotgan va xarid qilishga tayyor bo‘lgan foydalanuvchilarni nishonga oluvchi yangi In-market toifalarini joriy etmoqda.</p>
      <h2>Google Ads analogiyasi</h2>
      <p>Ushbu vosita Google In-market segmentlariga o‘xshash ishlaydi: foydalanuvchining so‘nggi faolliklari asosida uning xarid niyati aniqlanadi.</p>
      <h2>Qaysi sohalar bor?</h2>
      <p>Avtomobillar, elektronika, ko‘chmas mulk, kiyim-kechak, ta’lim, salomatlik va uy-ro‘zg‘or mollari kabi asosiy toifalar mavjud.</p>
    `
  },
  {
    slug: 'meta-advantage-plus-shopping-catalog-guide',
    title: 'Meta Advantage+ Shopping va Catalog Ads: 2026-yilda E-Commerce savdosini 3x oshirish',
    excerpt: 'Sun\'iy intellektga asoslangan Advantage+ Shopping kampaniyalari (ASC) orqali katalog mahsulotlarini avtomatlashtirilgan tarzda sotish strategiyasi.',
    category: 'facebook',
    tags: ['Meta', 'AdvantagePlus', 'ASC', 'ECommerce', 'CatalogAds'],
    image_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 182,
    created_at: '2026-08-24T12:00:00.000Z',
    content: `
      <p class="lead-paragraph">Advantage+ Shopping Campaigns (ASC) hozirda e-commerce loyihalarida an’anaviy qo‘lda boshqariladigan kampaniyalar o‘rnini to‘liq egallamoqda.</p>
      <h2>1. Kreativlar xilma-xilligi (Creative Diversity)</h2>
      <p>Bitta ASC kampaniyasiga kamida 10-15 ta har xil formatdagi (statik rasm, video, karusel, katalog) kreativlarni joylashtiring. Meta AI har bir xaridorga mos vizualni o‘zi tanlaydi.</p>
      <h2>2. Mavjud mijozlar ulushini (Existing Customer Cap) belgilash</h2>
      <p>Reklama byudjeti faqat eski mijozlarga sarflanib ketmasligi uchun mavjud xaridorlar ulushini 10-15% dan oshirmaslikni sozlang.</p>
    `
  },
  {
    slug: 'meta-capi-server-side-tracking-2026',
    title: 'Meta Conversions API (CAPI) va Server-Side Tracking: Pixel ma\'lumotlarini 98% aniqlikda uzatish',
    excerpt: 'iOS blokirovkalari va brauzer cheklovlariga qaramay, xarid va lid hodisalarini yo\'qotmasdan Meta serverlariga to\'g\'ridan-to\'g\'ri uzatish arxitekturasi.',
    category: 'facebook',
    tags: ['Meta', 'CAPI', 'ConversionsAPI', 'Pixel', 'ServerSide'],
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 165,
    created_at: '2026-08-04T10:00:00.000Z',
    content: `
      <p class="lead-paragraph">Conversions API orqali hodisalarni server darajasida uzatish reklama samaradorligini va Event Match Quality ko‘rsatkichini maksimal darajaga olib chiqadi.</p>
      <h2>Parametrlarni boyitish</h2>
      <p>Har bir hodisa bilan mijozning xeshlangan emaili, telefon raqami, IP manzili va brauzer cookie IDlarini birga yuborish konversiya qayd etilishini 98%+ ga yetkazadi.</p>
    `
  },
  {
    slug: 'meta-reels-9-16-video-ads-framework',
    title: 'Instagram Reels va TikTok uslubidagi Video Reklama: 2026-yilgi 3 soniyalik Hook formulalari',
    excerpt: 'Reels va Stories formatida qisqa video reklamalarning ushlab qolish darajasini (Hold Rate) 45% ga oshirish va CTRni 2.5x ga ko‘tarish sirlari.',
    category: 'facebook',
    tags: ['Reels', 'InstagramAds', 'VideoCreatives', 'HookRate', 'Target'],
    image_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 177,
    created_at: '2026-07-17T14:15:00.000Z',
    content: `
      <p class="lead-paragraph">9:16 vertikal video formatlari hozirda Meta tarmog‘idagi umumiy ko‘rishlarning 60% dan ortig‘ini tashkil qilmoqda. Muvaffaqiyatli videoning kaliti — dastlabki 3 soniyada yotadi.</p>
      <h2>1. Hook (0–3 soniya):</h2>
      <p>Muammoni kutilmagan savol yoki vizual harakat bilan boshlang. Masalan: "Agar siz hali ham reklama byudjetini shunday sarflayotgan bo‘lsangiz..."</p>
      <h2>2. Retensiya va Dinamika (3–15 soniya):</h2>
      <p>Har 2 soniyada kadr o‘zgarishi va subtitrlar (Captions) mavjud bo‘lishi shart, chunki foydalanuvchilarning 70% qismi videoni ovozsiz tomosha qiladi.</p>
    `
  },
  {
    slug: 'meta-lead-ads-conditional-logic-instant-forms',
    title: 'Meta Instant Forms va Shartli Mantiq (Conditional Logic): Faqat sifatli lidlarni filtrlash',
    excerpt: 'Reklama formasida keraksiz murojaatlarni to‘xtatish, sifatli lid narxini barqarorlashtirish va sotuv bo‘limi yuklamasini yengillatish.',
    category: 'facebook',
    tags: ['Meta', 'LeadAds', 'InstantForms', 'B2B', 'Sotuv'],
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '4 daqiqa',
    views: 149,
    created_at: '2026-06-18T11:30:00.000Z',
    content: `
      <p class="lead-paragraph">Ko‘plab bizneslar Lead Ads formasidan kelgan lidlarning sifatsizligidan shikoyat qiladi. Meta Instant Forms’dagi yangi shartli savollar tizimi bu muammoni to‘liq hal qiladi.</p>
      <h2>Kvalifikatsiya savollari:</h2>
      <p>Byudjet yoki talabga mos kelmagan mijozlarni darhol minnatdorchilik sahifasiga o‘tkazib, faqat maqsadli mijozlarning kontaktlarini CRM tizimiga yo‘naltirish mumkin.</p>
    `
  },
  {
    slug: 'meta-cbo-vs-abo-scaling-strategy-2026',
    title: 'Meta CBO vs ABO: Kunlik $500+ byudjetni masshtablashda qaysi biri samaraliroq?',
    excerpt: 'Advantage Campaign Budget (CBO) va Ad Set Budget (ABO) strategiyalarini to\'g\'ri tanlash, test bosqichidan masshtabga o\'tish formulalari.',
    category: 'facebook',
    tags: ['Meta', 'CBO', 'ABO', 'Scaling', 'MediaBuying'],
    image_url: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 210,
    created_at: '2026-05-29T10:30:00.000Z',
    content: `
      <p class="lead-paragraph">Test bosqichida ABO (adset byudjeti) orqali har bir gipotezani tekshirib, g‘olib chiqqan kombinatsiyalarni CBO kampaniyalariga birlashtirish orqali byudjetni xavfsiz masshtablash mumkin.</p>
    `
  },
  {
    slug: 'facebook-ads-ban-prevention-antidetect-guide',
    title: 'Facebook va Instagram\'da cheklovlarsiz ishlash: 2026-yilgi trust va anti-detect strategiyasi',
    excerpt: 'Rezident proksilar, brauzer profillari va Business Manager strukturasini xavfsiz sozlash bo‘yicha qo‘llanma.',
    category: 'facebook',
    tags: ['Facebook', 'AntiDetect', 'Proksi', 'Arbitraj', 'Xavfsizlik'],
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '8 daqiqa',
    views: 230,
    created_at: '2026-04-15T09:00:00.000Z',
    content: `
      <p class="lead-paragraph">Meta algoritmlarining so‘nggi yangilanishlarida bitta qurilma yoki proksidagi shubhali harakat barcha bog‘langan hisoblarni bloklashi mumkin. Professional anti-detect va toza IP tarmog‘i bilan ishlash asosiy omildir.</p>
    `
  },
  {
    slug: 'lookalike-vs-broad-targeting-meta-2026',
    title: 'Lookalike vs Broad Targeting: 2026-yilda qaysi auditoriya strategiyasi g‘olib bo‘lmoqda?',
    excerpt: 'Meta AI rivojlanishi bilan keng qamrovli (Broad) targetlash LAL (o‘xshash) auditoriyalardan qanday qilib o‘zib ketgani va kreativalar qanday qilib yangi targetga aylangani.',
    category: 'facebook',
    tags: ['BroadTargeting', 'Lookalike', 'MetaAI', 'Auditoriya', 'Strategiya'],
    image_url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 164,
    created_at: '2026-03-20T15:20:00.000Z',
    content: `
      <p class="lead-paragraph">2026-yilda "Targeting is Creative" qoidasi to‘liq amal qilmoqda. Keng qamrovli (Broad) targetlashda Meta AI kreativdagi matn va vizual signallar orqali kerakli xaridorni o‘zi topib beradi.</p>
    `
  },
  {
    slug: 'meta-creative-fatigue-dynamic-creative-testing',
    title: 'Kreativlar charchashi (Creative Fatigue)ga qarshi tizimli Dynamic Creative Testing (DCT) usuli',
    excerpt: 'Reklama natijalari 2-3 haftadan keyin pasayib ketishining oldini olish va haftasiga 50+ yangi gipotezalarni avtomatik test qilish.',
    category: 'facebook',
    tags: ['DCT', 'CreativeTesting', 'Fatigue', 'ROAS', 'Kreativ'],
    image_url: 'https://images.unsplash.com/photo-1542744094-3a3172720a8a?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 153,
    created_at: '2026-02-12T10:45:00.000Z',
    content: `
      <p class="lead-paragraph">Dynamic Creative Testing (DCT) yordamida 3 ta sarlavha, 3 ta vizual va 2 ta matnni bitta adsetda birlashtirib, eng yuqori konversiya bergan kombinatsiyani 48 soat ichida aniqlash mumkin.</p>
    `
  },

  // ==========================================
  // GOOGLE ADS (8 Articles)
  // ==========================================
  {
    slug: 'google-ads-pmax-roas-optimization-guide-2026',
    title: 'Google Ads Performance Max 2026: ROAS\'ni 3.8x ga oshirish va byudjet isrofini to\'xtatish',
    excerpt: 'Auditoriya signallari, Brand Exclusion, nofaol joylashuvlarni filtrlash va Smart Bidding orqali konversiya narxini 45% ga tushirish bo\'yicha to\'liq qo\'llanma.',
    category: 'google',
    tags: ['GoogleAds', 'PMax', 'ROAS', 'PerformanceMax', 'PPC'],
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 220,
    created_at: '2026-08-28T14:30:00.000Z',
    content: `
      <p class="lead-paragraph">Google Ads Performance Max (PMax) kampaniyalari barcha Google kanallari bo‘ylab yagona AI tizimi orqali ishlaydi. Brand Exclusion va Auditoriya signallarini to‘g‘ri sozlash byudjet isrofining oldini oladi.</p>
    `
  },
  {
    slug: 'google-smart-bidding-tcpa-troas-control',
    title: 'Google Smart Bidding (tCPA va tROAS): AI algoritmlarini to‘g‘ri boshqarish va o‘rgatish',
    excerpt: 'Sun\'iy intellekt takliflarini nazorat qilish, konversiya oynasi (Conversion Lag)ni hisobga olish va takliflarni to‘satdan o‘zgartirish xatolaridan qochish.',
    category: 'google',
    tags: ['GoogleAds', 'SmartBidding', 'tCPA', 'tROAS', 'PPC'],
    image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 144,
    created_at: '2026-07-30T13:00:00.000Z',
    content: `
      <p class="lead-paragraph">Smart Bidding algoritmi kampaniyada kamida 30-50 ta konversiya to‘plangandan keyin eng yuqori aniqlikda ishlay boshlaydi. Target CPA va Target ROAS ko‘rsatkichlarini har safar 15% dan ortiq o‘zgartirmaslik kerak.</p>
    `
  },
  {
    slug: 'google-demand-gen-youtube-shorts-ads',
    title: 'Google Demand Gen va YouTube Shorts Ads: Sovuq auditoriyadan issiq xaridor yaratish',
    excerpt: 'Qidiruv talabini kutmasdan, YouTube Shorts va Discover orqali yangi mahsulotlarga ommaviy qiziqish uyg\'otish va sotuvga aylantirish san\'ati.',
    category: 'google',
    tags: ['GoogleAds', 'DemandGen', 'YouTubeShorts', 'Discover', 'ECommerce'],
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 167,
    created_at: '2026-06-25T13:10:00.000Z',
    content: `
      <p class="lead-paragraph">Google Demand Gen vizual hikoya orqali sovuq auditoriyada mahsulotga nisbatan talabni noldan uyg‘otadi va brend tanilishini keskin oshiradi.</p>
    `
  },
  {
    slug: 'google-search-match-types-exact-vs-phrase-2026',
    title: 'Google Search Ads 2026: Exact vs Phrase Match turlari va salbiy kalit so‘zlar arxitekturasi',
    excerpt: 'Google qidiruv reklamasida keraksiz qidiruv so‘rovlarini 90% ga qisqartirish va har bir bosilgan klik uchun sarflangan mablag‘ni qaytarish.',
    category: 'google',
    tags: ['GoogleSearch', 'MatchTypes', 'Keywords', 'NegativeKeywords', 'PPC'],
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 139,
    created_at: '2026-05-08T09:30:00.000Z',
    content: `
      <p class="lead-paragraph">Broad Match algoritmlarining kengayishi sababli qat’iy salbiy kalit so‘zlar (Negative Keywords) ro‘yxatini doimiy yangilab borish har bir so‘m byudjetni himoya qiladi.</p>
    `
  },
  {
    slug: 'google-consent-mode-v2-enhanced-conversions',
    title: 'Google Consent Mode v2 va Enhanced Conversions: Reklamada yo\'qotilgan 30% konversiyalarni tiklash',
    excerpt: 'Maxfiylik qoidalari (GDPR/ePrivacy) kuchaygan davrda Google Tag Manager orqali modellashtirilgan konversiyalarni to\'g\'ri o\'lchash.',
    category: 'google',
    tags: ['GoogleAds', 'ConsentModeV2', 'EnhancedConversions', 'GTM', 'Analytics'],
    image_url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 158,
    created_at: '2026-04-28T11:00:00.000Z',
    content: `
      <p class="lead-paragraph">Consent Mode v2 va Enhanced Conversions ma’lumotlar uzatilishini xavfsiz tiklab, konversiya hisob-kitobidagi uzilishlarni bartaraf etadi.</p>
    `
  },
  {
    slug: 'youtube-shorts-video-funnels-conversion',
    title: 'YouTube Shorts orqali B2B va Xizmatlar uchun Lid Yig‘ish: 15 soniyali konversiya skriptlari',
    excerpt: 'Qisqa videolardan to‘g‘ridan-to‘g‘ri lendlingga sifatli trafik jalb qilish va YouTube orqali CPL narxini pasaytirish formulasi.',
    category: 'google',
    tags: ['YouTubeAds', 'Shorts', 'VideoFunnels', 'LeadGen', 'Google'],
    image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 125,
    created_at: '2026-03-05T14:40:00.000Z',
    content: `
      <p class="lead-paragraph">YouTube Shorts reklamalari mobil auditoriyaga ta’sir o‘tkazishda eng arzon CPV (ko‘rish narxi) va yuqori CTR ko‘rsatkichlarini taqdim etmoqda.</p>
    `
  },
  {
    slug: 'google-shopping-feed-custom-labels-optimization',
    title: 'Google Shopping va Merchant Center: Custom Labels orqali eng ko‘p daromad keltiruvchi tovarlarni saralash',
    excerpt: 'Mahsulotlar ozuqasini (Feed) marjinallik, mavsumiylik va narx toifasi bo‘yicha guruhlash orqali ROASni 4.2x ga olib chiqish.',
    category: 'google',
    tags: ['GoogleShopping', 'MerchantCenter', 'FeedOptimization', 'ECommerce'],
    image_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '7 daqiqa',
    views: 141,
    created_at: '2026-02-22T11:10:00.000Z',
    content: `
      <p class="lead-paragraph">Custom Labels yordamida yuqori marjali (High Margin) tovarlarga ko‘proq byudjet, past marjali mahsulotlarga esa kamroq stavka belgilash orqali sof foyda keskin oshiriladi.</p>
    `
  },
  {
    slug: 'ga4-custom-funnels-exploration-ecommerce',
    title: 'GA4 (Google Analytics 4) Funnel Exploration: Foydalanuvchilar qayerda savdoni tark etmoqda?',
    excerpt: 'Savatdan to‘lovgacha bo‘lgan barcha bosqichlarni tahlil qilish, tashlab ketilgan savatlar sababini aniqlash va konversiya zanjirini optimallashtirish.',
    category: 'google',
    tags: ['GA4', 'GoogleAnalytics', 'Funnels', 'Cro', 'ECommerce'],
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 132,
    created_at: '2026-01-19T16:00:00.000Z',
    content: `
      <p class="lead-paragraph">GA4 Funnel Exploration hisobotlari yordamida checkout bosqichidagi to‘siqlarni aniqlab, sayt konversiya ko‘rsatkichini 1.8% dan 3.4% gacha ko‘tarish mumkin.</p>
    `
  },

  // ==========================================
  // TELEGRAM ADS (6 Articles)
  // ==========================================
  {
    slug: 'telegram-ads-conversion-scaling-strategies',
    title: 'Telegram Ads 2026: Raqobatchilar kanallarini targetlash va arzon lid olish usullari',
    excerpt: 'Telegram rasmiy reklama platformasida kanallar tanlash, CPM nazorati va botlar orqali avtomatlashtirilgan funnel qurish bo\'yicha amaliy tajriba.',
    category: 'telegram',
    tags: ['TelegramAds', 'Target', 'Lidlar', 'Marketing', 'Telegram'],
    image_url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 205,
    created_at: '2026-08-18T11:15:00.000Z',
    content: `
      <p class="lead-paragraph">Telegram Ads platformasida to‘g‘ridan-to‘g‘ri raqobatchi kanallarni nishonga olish va bot orqali lidlarni qabul qilish eng arzon CPL ko‘rsatkichini ta’minlaydi.</p>
    `
  },
  {
    slug: 'telegram-ads-copywriting-160-char-hacks',
    title: 'Telegram Ads Kopiraytingi: 160 ta belgida yuqori CTR va sotuvga erishish formulalari',
    excerpt: 'Qattiq moderatsiya qoidalaridan oson o‘tuvchi, klikbaysiz va to‘g‘ridan-to‘g‘ri muammoni hal qiluvchi professional reklama matnlari.',
    category: 'telegram',
    tags: ['TelegramAds', 'Kopirayting', 'CTR', 'Copywriting', 'Marketing'],
    image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '4 daqiqa',
    views: 184,
    created_at: '2026-07-04T10:00:00.000Z',
    content: `
      <p class="lead-paragraph">Telegram reklamalarida rasm bo‘lmagani sababli har bir so‘z maksimal yuklamaga ega bo‘lishi lozim. Muammo -> Aniq Yechim -> Aniq Harakat (CTA) formulasi eng yaxshi ishlaydi.</p>
    `
  },
  {
    slug: 'telegram-mini-apps-tma-funnel-guide',
    title: 'Telegram Mini Apps (TMA) uchun trafik haydash: Liddan to\'lovgacha 1 bosqichli funnel',
    excerpt: 'WebApp botlariga to\'g\'ridan-to\'g\'ri reklama yoqish, Telegram ichida to\'lov qabul qilish va konversiyani 65% ga oshirish usullari.',
    category: 'telegram',
    tags: ['Telegram', 'MiniApps', 'TMA', 'WebApps', 'Funnel'],
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 192,
    created_at: '2026-06-11T15:40:00.000Z',
    content: `
      <p class="lead-paragraph">Telegram Mini Apps foydalanuvchini ilovadan chiqarmasdan to‘liq xarid va to‘lov jarayonini yakunlashga imkon beradi.</p>
    `
  },
  {
    slug: 'telegram-stars-ton-official-ad-payments',
    title: 'Telegram Stars va TON orqali reklama to‘lovlari: Xarajatlarni 25% tejash usullari',
    excerpt: 'Telegram Ads kabinetini rasmiy to‘lov tizimlari orqali to‘ldirish, komissiyalarni kamaytirish va buxgalteriya hisobotlarini to‘g‘ri yuritish.',
    category: 'telegram',
    tags: ['TelegramStars', 'TON', 'Payments', 'TelegramAds', 'Byudjet'],
    image_url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 156,
    created_at: '2026-05-19T13:20:00.000Z',
    content: `
      <p class="lead-paragraph">Telegram rasmiy to‘lov usullari orqali reklama byudjetini to‘ldirish xalqaro konvertatsiya yo‘qotishlarining oldini oladi va hisob barqarorligini ta’minlaydi.</p>
    `
  },
  {
    slug: 'telegram-chatbots-lead-generation-automation',
    title: 'Telegram Chatbotlar orqali Lid Generatsiya: Reklamadan kelgan mijozni 2 daqiqada qizdirish',
    excerpt: 'Avtomatlashtirilgan savol-javob ssenariylari, audio/video xabarlar va CRM integratsiyasi orqali lidlarni xaridga aylantirish.',
    category: 'telegram',
    tags: ['Chatbot', 'TelegramBot', 'Automation', 'CRM', 'LeadGen'],
    image_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 147,
    created_at: '2026-04-02T16:50:00.000Z',
    content: `
      <p class="lead-paragraph">Trafikni shunchaki kanalga emas, malakali chatbotga yo‘naltirish orqali mijozning ehtiyojini darhol aniqlab, sotuv menejeriga tayyor buyurtmani topshirish mumkin.</p>
    `
  },
  {
    slug: 'telegram-topic-vs-channel-bidding-strategies',
    title: 'Telegram Ads: Topic vs Channel Bidding strategiyalari va CPM optimizatsiyasi',
    excerpt: 'Qaysi holatda keng mavzularni (Topics), qaysi holatda aniq kanallarni tanlash kerak? Byudjetni samarali taqsimlash algoritmi.',
    category: 'telegram',
    tags: ['TelegramAds', 'Bidding', 'CPM', 'Targeting', 'MediaBuying'],
    image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 138,
    created_at: '2026-02-27T11:00:00.000Z',
    content: `
      <p class="lead-paragraph">A/B testlar shuni ko‘rsatadiki, nish sohalarda aniq kanal targetlash, keng iste’mol tovarlarida esa Topic targetlash eng maqbul narx beradi.</p>
    `
  },

  // ==========================================
  // LINKEDIN ADS (5 Articles)
  // ==========================================
  {
    slug: 'linkedin-abm-b2b-strategy-2026',
    title: 'LinkedIn Account-Based Marketing (ABM): Yirik korporativ B2B mijozlarni jalb qilish',
    excerpt: 'Kompaniyalar ro\'yxati, lavozimlar (C-Level) va Lead Gen Forms orqali yuqori chekli B2B xizmatlarni sotish strategiyasi.',
    category: 'linkedin',
    tags: ['LinkedIn', 'ABM', 'B2B', 'LeadGen', 'Marketing'],
    image_url: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 173,
    created_at: '2026-07-22T08:45:00.000Z',
    content: `
      <p class="lead-paragraph">LinkedIn ABM strategiyasi orqali aniq kompaniyalarning qaror qabul qiluvchi shaxslarini nishonga olib, yuqori chekli B2B shartnomalarni yopish mumkin.</p>
    `
  },
  {
    slug: 'linkedin-lead-gen-forms-crm-sync-guide',
    title: 'LinkedIn Lead Gen Forms va CRM integratsiyasi: Saytga o‘tmasdan turib yuqori sifatli lid olish',
    excerpt: 'Foydalanuvchilarning tasdiqlangan telefon va korporativ emaillarini to‘g‘ridan-to‘g‘ri HubSpot va Bitrix24 ga yuklash.',
    category: 'linkedin',
    tags: ['LinkedIn', 'LeadGenForms', 'CRM', 'HubSpot', 'B2B'],
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 142,
    created_at: '2026-06-03T12:00:00.000Z',
    content: `
      <p class="lead-paragraph">LinkedIn avtomatik to‘ldiriluvchi shakllari konversiyani 3 barobarga oshiradi, chunki ma’lumotlar foydalanuvchining rasmiy profilidan olinadi.</p>
    `
  },
  {
    slug: 'linkedin-thought-leader-ads-executive-brand',
    title: 'LinkedIn Thought Leader Ads: Bosh direktor sahifasi orqali ishonchli B2B lidlar oqimi',
    excerpt: 'Shaxsiy brend postlarini reklama qilish orqali CPL (lid narxi)ni an\'anaviy korporativ bannerlarga nisbatan 2 barobar arzonlashtirish.',
    category: 'linkedin',
    tags: ['LinkedIn', 'ThoughtLeader', 'PersonalBrand', 'B2B', 'Executive'],
    image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '4 daqiqa',
    views: 161,
    created_at: '2026-05-14T09:15:00.000Z',
    content: `
      <p class="lead-paragraph">Kompaniya rahbarlarining shaxsiy ekspertlik postlarini maqsadli B2B auditoriyaga reklama qilish ishonch va sotuv konversiyasini keskin ko‘taradi.</p>
    `
  },
  {
    slug: 'linkedin-matched-audiences-job-title-targeting',
    title: 'LinkedIn Matched Audiences: Lavozimlar va Kompaniya hajmi bo‘yicha global bozorga chiqish',
    excerpt: 'AQSH, Yevropa va Yaqin Sharq bozorlaridagi yuqori to‘lov qobiliyatiga ega kompaniyalarni nishonga olish sirlari.',
    category: 'linkedin',
    tags: ['LinkedIn', 'MatchedAudiences', 'GlobalMarketing', 'B2B'],
    image_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 129,
    created_at: '2026-03-14T15:10:00.000Z',
    content: `
      <p class="lead-paragraph">LinkedIn filtrlari orqali 500+ xodimi bo‘lgan kompaniyalarning VP va C-Level rahbarlariga to‘g‘ridan-to‘g‘ri reklama ko‘rsatish mumkin.</p>
    `
  },
  {
    slug: 'linkedin-document-ads-whitepaper-funnel',
    title: 'LinkedIn Document Ads: PDF tahlillar va Whitepaper orqali organik lid yig‘ish funneli',
    excerpt: 'Foydalanuvchiga qimmatli hisobotni ko‘rsatish orqali uning korporativ emailini olish va keyingi bosqichda shartnomaga yetaklash.',
    category: 'linkedin',
    tags: ['DocumentAds', 'Whitepaper', 'LeadGeneration', 'LinkedInAds'],
    image_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 115,
    created_at: '2026-01-28T10:20:00.000Z',
    content: `
      <p class="lead-paragraph">Document Ads formatida foydalanuvchi PDF tahlilni to‘g‘ridan-to‘g‘ri LinkedIn lentasida o‘qiydi va to‘liq versiyani yuklab olish uchun kontaktini qoldiradi.</p>
    `
  },

  // ==========================================
  // X (TWITTER) ADS (4 Articles)
  // ==========================================
  {
    slug: 'x-ads-video-app-install-tech-saas',
    title: 'X (Twitter) Ads: Tech va SaaS loyihalar uchun Ilova O‘rnatish (App Install) kampaniyalari',
    excerpt: 'X platformasining video reklamalari orqali xalqaro IT va fintech mahsulotlariga arzon foydalanuvchilarni jalb qilish usuli.',
    category: 'x',
    tags: ['XAds', 'AppInstalls', 'TechMarketing', 'SaaS', 'Fintech'],
    image_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 134,
    created_at: '2026-08-11T14:50:00.000Z',
    content: `
      <p class="lead-paragraph">X platformasi IT, kiberxavfsizlik va moliyaviy texnologiyalar auditoriyasi eng zich to‘plangan maskan bo‘lib, ilova o‘rnatish kampaniyalarida arzon CPI ko‘rsatmoqda.</p>
    `
  },
  {
    slug: 'x-ads-algorithm-video-strategy-2026',
    title: 'X (Twitter) Ads 2026: Yangilangan algoritm va video reklama orqali xalqaro auditoriyaga chiqish',
    excerpt: 'Grok AI tavsiya algoritmlari davrida X Ads orqali Tech, SaaS va fintech loyihalarga arzon trafik va ro\'yxatdan o\'tishlarni yo\'naltirish.',
    category: 'x',
    tags: ['XAds', 'Twitter', 'VideoAds', 'TechMarketing', 'SaaS'],
    image_url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '4 daqiqa',
    views: 152,
    created_at: '2026-07-09T16:20:00.000Z',
    content: `
      <p class="lead-paragraph">X yangilangan sun’iy intellekt tavsiya mexanizmlari orqali reklamalarni real vaqt rejimida qiziqayotgan eng faol auditoriyaga yetkazmoqda.</p>
    `
  },
  {
    slug: 'x-trend-takeover-real-time-keyword-targeting',
    title: 'X Trend Takeover va Real-Time Keyword Targeting: Jonli voqealar orqali brendni tanitish',
    excerpt: 'Global konferensiyalar, yangiliklar va ommabop hashtaglar ichida o‘z brendini birinchi o‘rinda ko‘rsatish mexanikasi.',
    category: 'x',
    tags: ['TrendTakeover', 'KeywordTargeting', 'Branding', 'XAds'],
    image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 121,
    created_at: '2026-04-22T11:40:00.000Z',
    content: `
      <p class="lead-paragraph">Trend Takeover yordamida muayyan mamlakat yoki mintaqa bo‘yicha Explore bo‘limining tepasida turish va millionlab taassurotlarni yig‘ish mumkin.</p>
    `
  },
  {
    slug: 'x-conversion-pixel-web-attribution-models',
    title: 'X Conversion Tracking va Veb-Attributsiya: Reklama qaytimini to‘g‘ri o‘lchash',
    excerpt: 'X Pixel orqali ro‘yxatdan o‘tish va to‘lovlarni kuzatish, post-view va post-click konversiya oynalarini to‘g‘ri sozlash.',
    category: 'x',
    tags: ['XPixel', 'Attribution', 'ConversionTracking', 'Analytics'],
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '4 daqiqa',
    views: 110,
    created_at: '2026-02-06T09:15:00.000Z',
    content: `
      <p class="lead-paragraph">Post-view va post-click konversiyalarni aniq hisobga olish X reklamasining haqiqiy ROI ko‘rsatkichini ko‘rish imkonini beradi.</p>
    `
  },

  // ==========================================
  // ANALYTICS & STRATEGY (5 Articles)
  // ==========================================
  {
    slug: 'server-side-gtm-stape-cloud-setup-guide',
    title: 'Server-Side Google Tag Manager (sGTM): Tracking yo‘qotishlariga qarshi to‘liq infratuzilma',
    excerpt: 'Shaxsiy subdomen orqali birinchi tomonli (First-Party) ma\'lumotlar to‘plash va barcha reklama piksellarini yagona serverdan boshqarish.',
    category: 'google',
    tags: ['sGTM', 'ServerSide', 'Tracking', 'GoogleTagManager', 'Analytics'],
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '7 daqiqa',
    views: 188,
    created_at: '2026-08-31T15:00:00.000Z',
    content: `
      <p class="lead-paragraph">Server-Side GTM brauzer yuklanishini yengillashtiradi, AdBlocker to‘siqlarini aylanib o‘tadi va mijozlar ma’lumotlari xavfsizligini kafolatlaydi.</p>
    `
  },
  {
    slug: 'multi-touch-attribution-models-performance-marketing',
    title: 'Multi-Touch Attributsiya Modellari: Reklama byudjeti qaysi kanal hisobiga o‘zini oqlamoqda?',
    excerpt: 'Last-Click xatosidan qochish: Data-Driven, Linear va Time-Decay modellari yordamida kanal samaradorligini adolatli baholash.',
    category: 'google',
    tags: ['Attribution', 'DataDriven', 'LastClick', 'MarketingAnalytics'],
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 145,
    created_at: '2026-06-29T10:15:00.000Z',
    content: `
      <p class="lead-paragraph">Mijoz birinchi marta reklamani ko‘rganidan xarid qilgunicha 4-5 ta teginish nuqtasidan o‘tadi. Data-Driven attributsiya har bir kanalning real hissasini ko‘rsatadi.</p>
    `
  },
  {
    slug: 'utm-architecture-naming-conventions-7-figure-campaigns',
    title: 'Katta byudjetli kampaniyalar uchun UTM arxitekturasi va Naming Conventions standartlari',
    excerpt: 'Meta, Google va Telegram uchun yagona UTM makroslari tizimi, BI tahlillar va avtomatlashtirilgan hisobotlar uchun ma\'lumotlar gigiyenasi.',
    category: 'facebook',
    tags: ['UTM', 'Analytics', 'NamingConvention', 'MediaBuying', 'BI'],
    image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 168,
    created_at: '2026-05-02T14:30:00.000Z',
    content: `
      <p class="lead-paragraph">To‘g‘ri tuzilgan UTM arxitekturasi (masalan: <code>utm_source={{site_source_name}}&utm_campaign={{campaign.name}}</code>) xatolarni nolga tushiradi.</p>
    `
  },
  {
    slug: 'unit-economics-cac-ltv-payback-period-media-buying',
    title: 'Media Buyingda Unit-Iqtisodiyot: CAC, LTV va O‘zini Oqlash Davri (Payback Period) formulalari',
    excerpt: 'Faqat ROASga qarab emas, mijozning umrbod qiymati (LTV) va qayta xaridlarini hisobga olgan holda byudjetni agressiv masshtablash.',
    category: 'facebook',
    tags: ['UnitEconomics', 'CAC', 'LTV', 'PaybackPeriod', 'Moliya'],
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '7 daqiqa',
    views: 195,
    created_at: '2026-03-27T09:00:00.000Z',
    content: `
      <p class="lead-paragraph">LTV/CAC nisbati 3:1 dan yuqori bo‘lgan bizneslarda reklama byudjetini birinchi xaridda zararga kirishdan qo‘rqmasdan bemalol 5x oshirish mumkin.</p>
    `
  },
  {
    slug: 'creative-analytics-hook-rate-hold-rate-ctr-metrics',
    title: 'Kreativ Analitikasi: Hook Rate, Hold Rate va Click-to-Lead nisbatlarini to‘g‘ri tahlil qilish',
    excerpt: 'Reklama natijasi pasayganda muammo qayerda ekanligini 3 ta asosiy ko‘rsatkich orqali 5 daqiqada aniqlash usuli.',
    category: 'facebook',
    tags: ['HookRate', 'HoldRate', 'CreativeAnalytics', 'CTR', 'Kreativ'],
    image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 180,
    created_at: '2026-01-12T11:45:00.000Z',
    content: `
      <p class="lead-paragraph">Hook Rate (3s ko‘rishlar / Taassurotlar) 30% dan past bo‘lsa — videoning boshlanishini, Hold Rate past bo‘lsa — o‘rtasini, CTR past bo‘lsa — taklifni (Offer) o‘zgartirish kerak.</p>
    `
  }
];

function ensureSeedArticles() {
  const insertStmt = db.prepare(`
    INSERT INTO articles (slug, title, excerpt, content, category, tags, image_url, author, read_time, views, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateStmt = db.prepare(`
    UPDATE articles SET title = ?, excerpt = ?, content = ?, category = ?, tags = ?, image_url = ?, author = ?, read_time = ?, created_at = ?
    WHERE slug = ?
  `);

  for (const art of SEED_ARTICLES) {
    const existing = db.prepare('SELECT id FROM articles WHERE slug = ?').get(art.slug);
    const tagsStr = JSON.stringify(art.tags);
    if (!existing) {
      insertStmt.run(
        art.slug,
        art.title,
        art.excerpt,
        art.content.trim(),
        art.category,
        tagsStr,
        art.image_url,
        art.author,
        art.read_time,
        art.views || 0,
        art.created_at
      );
    } else {
      updateStmt.run(
        art.title,
        art.excerpt,
        art.content.trim(),
        art.category,
        tagsStr,
        art.image_url,
        art.author,
        art.read_time,
        art.created_at,
        art.slug
      );
    }
  }
}

ensureSeedArticles();

module.exports = { db, hashPassword, ensureDefaultAdmin, ensureSeedArticles };
