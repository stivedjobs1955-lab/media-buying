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
  // 1. Meta In-Market Categories Testing
  {
    slug: 'fb-in-market-categories-testing',
    title: 'Facebook Ads batafsil targetlashda "In-market categories" funksiyasini test qilmoqda',
    excerpt: 'Meta ba\'zi reklama kabinetlarida batafsil targetlash ichida yangi "In-market categories" toifasini sinovdan o\'tkaza boshladi. Ayni paytda faol qidirayotgan va sotib olish niyatidagi issiq auditoriyani qamrab olish imkoniyati.',
    category: 'facebook',
    tags: ['Facebook', 'FacebookAds', 'Targeting', 'InMarket', 'MediaBuying'],
    image_url: 'https://cpa.rip/wp-content/uploads/2026/09/facebook_ads_payment_status_1200x5364.png',
    author: 'The Unique Media',
    read_time: '3 daqiqa',
    views: 89,
    created_at: '2026-09-10T09:56:14.000Z',
    content: `
      <p class="lead-paragraph">Facebook Ads reklama platformasining ayrim kabinetlarida Detailed Targeting (batafsil targetlash) bo‘limiga yangi imkoniyat — <strong>In-market categories</strong> (Bozordagi faol xaridorlar toifasi) qo‘shildi.</p>

      <h2>1. In-market toifalari nima va u qanday ishlaydi?</h2>
      <p>Ushbu toifa yordamida ayni vaqtda muayyan tovar yoki xizmatlarni faol qidirayotgan, taqqoslayotgan va xarid qilishni rejalashtirayotgan foydalanuvchilarga to‘g‘ridan-to‘g‘ri reklama ko‘rsatish mumkin. Aslida bu xarid niyati yuqori bo‘lgan eng "issiq" va konversiyaga moyil auditoriya segmentidir.</p>

      <div class="article-callout note">
        <strong>💡 Google Ads mexanikasiga o‘xshashlik:</strong>
        <p>Mexanika jihatidan bu yangilik Google Ads’dagi <em>In-market audiences</em> tizimiga juda o‘xshaydi. Tizim foydalanuvchilarning so‘nggi paytlardagi brauzer harakatlari, qidiruvlari va platformadagi xatti-harakat signallari asosida ularning qaysi mahsulotni sotib olishga tayyorlanayotganini aniqlaydi.</p>
      </div>

      <h2>2. Qaysi toifalar mavjud?</h2>
      <p>In-market categories ichida alohida yo‘nalishlar taqdim etilmoqda:</p>
      <ul>
        <li><strong>Avtomobillar va transport vositalari</strong> (sotib olish va lizing)</li>
        <li><strong>Elektronika va maishiy texnika</strong></li>
        <li><strong>Ta’lim, professional kurslar va universitetlar</strong></li>
        <li><strong>Ko‘ngilochar xizmatlar va tadbirlar</strong></li>
        <li><strong>Kiyim-kechak, poyabzal va moda</strong></li>
        <li><strong>Oziq-ovqat va yetkazib berish xizmatlari</strong></li>
        <li><strong>Salomatlik, sport va go‘zallik</strong></li>
        <li><strong>Uy, interyer va ta’mirlash mollari</strong></li>
      </ul>

      <h2>3. Media buyerlar va Targetologlar uchun amaliy xulosalar</h2>
      <ol class="article-key-takeaways">
        <li><strong>Keng (Broad) targetlash bilan taqqoslash:</strong> Ushbu yangi toifa broad targetlashga nisbatan issiqroq auditoriyani ajratib beradi, bu esa boshlang‘ich bosqichda CPA narxini pasaytirishga xizmat qiladi.</li>
        <li><strong>Sinov muddati:</strong> Funksiya hozircha barcha kabinetlarda emas, test rejimida ishlamoqda. Mavjud kabinetlarda ushbu toifalarni <strong>2026-yil 2-noyabrgacha</strong> test qilish imkoniyati berilgan.</li>
        <li><strong>Kreativ moslashuvi:</strong> In-market auditoriyasi allaqachon mahsulot haqida biladi, shuning uchun ularga taqdimot emas, aniq chegirma, tez yetkazib berish yoki ustunlik taklif etilgan "hard-offer" kreativlar ko‘rsatish tavsiya etiladi.</li>
      </ol>
    `
  },

  // 2. Meta Moderation Report
  {
    slug: 'facebook-instagram-moderation-report-2026',
    title: '2026-yilning birinchi yarmi bo‘yicha Facebook va Instagram kontent moderatsiyasi hisoboti',
    excerpt: 'Meta kompaniyasi 2026-yil H1 bo‘yicha kontent moderatsiyasi, o‘chirishlar, apellatsiyalar, soxta akkauntlar va spamga qarshi kurash bo‘yicha rasmiy statistikasini taqdim etdi.',
    category: 'facebook',
    tags: ['Facebook', 'Instagram', 'Meta', 'Moderatsiya', 'Hisobot', 'MediaBuying'],
    image_url: 'https://cpa.rip/wp-content/uploads/2026/09/234512343-2.png',
    author: 'The Unique Media',
    read_time: '7 daqiqa',
    views: 142,
    created_at: '2026-09-14T09:00:00.000Z',
    content: `
      <p class="lead-paragraph">Meta kompaniyasi 2026-yilning birinchi yarim yilligi (H1 2026) bo‘yicha Facebook va Instagram platformalarida kontent moderatsiyasi, blokirovkalar, apellatsiyalar, soxta akkauntlar va spamga qarshi kurash bo‘yicha rasmiy hisobotini e’lon qildi. Quyida media buyerlar va targetologlar uchun eng muhim tahlillar keltirilgan.</p>

      <h2>1. Umumiy moderatsiya ko‘rsatkichlari</h2>
      <p>Meta moderatsiya tizimi bir vaqtning o‘zida bir nechta yo‘nalishda ishlaydi. 2026-yilning birinchi yarmida:</p>
      <ul>
        <li><strong>Facebook’da:</strong> 487 million ta kontent birligi o‘chirildi (2025-yilning 2-yarmiga nisbatan <strong>8.1% kamaygan</strong>).</li>
        <li><strong>Instagram’da:</strong> 213 million ta kontent birligi o‘chirildi (o‘tgan davrga nisbatan <strong>4.8% kamaygan</strong>).</li>
      </ul>

      <div class="table-responsive">
        <table class="article-table">
          <thead>
            <tr>
              <th>Davr (Period)</th>
              <th>Facebook (O‘chirilgan kontent)</th>
              <th>Instagram (O‘chirilgan kontent)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Q2 2026</strong></td>
              <td>259 mln</td>
              <td>102 mln</td>
            </tr>
            <tr>
              <td><strong>Q1 2026</strong></td>
              <td>228 mln</td>
              <td>111 mln</td>
            </tr>
            <tr>
              <td><strong>Q4 2025</strong></td>
              <td>271 mln</td>
              <td>137 mln</td>
            </tr>
            <tr>
              <td><strong>Q3 2025</strong></td>
              <td>259 mln</td>
              <td>86.8 mln</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>2. Xato blokirovkalar va Aniqlik darajasi</h2>
      <p>Moderatsiya algoritmlarining aniqlik darajasi ko‘p hollarda 90% atrofida saqlanib qolmoqda. Biroq 2026-yilning 1-choragida (Q1) Facebook’da aniqlik darajasi <strong>85.19% – 87.02%</strong> gacha pasaygan.</p>
      
      <div class="article-callout note">
        <strong>💡 Soxta signallar (False positives — nohaq bloklar):</strong>
        <p>2026-yilning birinchi yarmida tizim xatoligi sababli Facebook’da <strong>57.9 – 59.2 million</strong>, Instagram’da esa <strong>18.5 – 19.3 million</strong> kontent adashib cheklovga uchragan.</p>
      </div>

      <h2>3. Apellatsiyalar va qayta tiklash statistikasi</h2>
      <div class="table-responsive">
        <table class="article-table">
          <thead>
            <tr>
              <th>Davr</th>
              <th>Platforma</th>
              <th>Apellatsiya berildi</th>
              <th>Qayta tiklandi</th>
              <th>Muvaffaqiyat ulushi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>H1 2026</strong></td>
              <td><strong>Facebook</strong></td>
              <td>1.32 mln</td>
              <td>229 ming</td>
              <td><span class="badge badge-warning">17.3%</span></td>
            </tr>
            <tr>
              <td><strong>H1 2026</strong></td>
              <td><strong>Instagram</strong></td>
              <td>1.89 mln</td>
              <td>266 ming</td>
              <td><span class="badge badge-warning">14.1%</span></td>
            </tr>
            <tr>
              <td>H2 2025</td>
              <td>Facebook</td>
              <td>2.09 mln</td>
              <td>989 ming</td>
              <td><span class="badge">47.3%</span></td>
            </tr>
            <tr>
              <td>H1 2025</td>
              <td>Facebook</td>
              <td>4.90 mln</td>
              <td>3.17 mln</td>
              <td><span class="badge badge-success">64.7%</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="article-callout alert">
        <strong>⚠️ Muhim tendensiya:</strong>
        <p>2025-yilda shikoyatlarning 58–64% qismi ijobiy qanoatlantirilgan bo‘lsa, 2026-yilda bu ko‘rsatkich <strong>14–17% gacha tushib ketdi</strong>. Ya’ni Meta o‘z qarorlarini qayta ko‘rib chiqishda ancha qat’iy va kamdan-kam hollarda blokni yechmoqda.</p>
      </div>

      <h2>💡 Media Buyerlar uchun amaliy xulosalar</h2>
      <ol class="article-key-takeaways">
        <li><strong>Apellatsiyalarga ortiqcha umid bog‘lamang:</strong> Bloklangan akkaunt yoki reklamalarni apellatsiya orqali qaytarish imkoniyati 4 barobarga qisqardi. Zaxira akkauntlar tizimini yo‘lga qo‘yish lozim.</li>
        <li><strong>Sifatli farm va trust profillarga e’tibor bering:</strong> Meta AI algoritmlari feyk akkauntlarni inson shikoyatisiz 99.9% aniqlik bilan tutmoqda. Sifatli farm, trust va ishonchli rezident proksilar ahamiyati har qachongidan yuqori.</li>
        <li><strong>Kreativlarda qat’iy filtrlash:</strong> Trigger so‘zlar va agressiv va’dalar uchun neyrotarmoq tekshiruvi yanada kuchaytirilgan.</li>
      </ol>
    `
  },

  // 3. Google Ads PMax Guide
  {
    slug: 'google-ads-pmax-roas-optimization-guide-2026',
    title: 'Google Ads Performance Max 2026: ROAS\'ni 3.8x ga oshirish va byudjet isrofini to\'xtatish',
    excerpt: 'Auditoriya signallari, Brand Exclusion, nofaol joylashuvlarni filtrlash va Smart Bidding orqali konversiya narxini 45% ga tushirish bo\'yicha to\'liq qo\'llanma.',
    category: 'google',
    tags: ['GoogleAds', 'PMax', 'ROAS', 'PerformanceMax', 'PPC'],
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 118,
    created_at: '2026-08-28T14:30:00.000Z',
    content: `
      <p class="lead-paragraph">Google Ads Performance Max (PMax) kampaniyalari barcha Google kanallari (Search, YouTube, Display, Discover, Gmail, Maps) bo‘ylab yagona AI tizimi orqali ishlaydi. 2026-yilda ushbu tizim yanada avtomatlashgan bo‘lsa-da, nazoratsiz qoldirilsa byudjetni samarasiz sarflashi mumkin.</p>

      <h2>1. Brand Exclusion (Brend so‘rovlarini chiqarib tashlash)</h2>
      <p>Performance Max odatda o‘z natijalarini yaxshi ko‘rsatish uchun sizning brendingizni qidirgan tayyor mijozlarga reklama ko‘rsatadi. Bu esa sun’iy ravishda yuqori ROAS ko‘rsatadi, ammo yangi mijoz olib kelmaydi.</p>
      <ul>
        <li><strong>Yechim:</strong> Settings bo‘limida <em>Brand Lists</em> yarating va o‘z brendingiz nomini PMax kampaniyasidan chiqarib tashlang (Exclusion). Brend trafigi uchun alohida arzon Search kampaniyasi yuriting.</li>
      </ul>

      <h2>2. Auditoriya signallari (Audience Signals)ni to‘g‘ri sozlash</h2>
      <p>PMax algoritmiga kimni izlash kerakligini ko‘rsatish zarur:</p>
      <ul>
        <li><strong>Customer Match:</strong> Avval xarid qilgan eng yaxshi mijozlaringizning telefon va email ro‘yxatini yuklang.</li>
        <li><strong>Custom Intent:</strong> Raqobatchilaringizning veb-sayt manzillari va asosiy qidiruv kalit so‘zlarini kiritib maxsus segment tuzing.</li>
      </ul>

      <h2>3. Placement Report audit va nofaol ilovalarni bloklash</h2>
      <p>Ko‘pincha PMax byudjeti bolalar uchun mo‘ljallangan mobil o‘yinlar va keraksiz ilovalardagi tasodifiy kliklarga ketadi. Hisobot orqali mobil ilovalar kategoriyasini kampaniya darajasida chiqarib tashlang.</p>
    `
  },

  // 4. Telegram Ads Targeting
  {
    slug: 'telegram-ads-conversion-scaling-strategies',
    title: 'Telegram Ads 2026: Raqobatchilar kanallarini targetlash va arzon lid olish usullari',
    excerpt: 'Telegram rasmiy reklama platformasida kanallar tanlash, CPM nazorati va botlar orqali avtomatlashtirilgan funnel qurish bo\'yicha amaliy tajriba.',
    category: 'telegram',
    tags: ['TelegramAds', 'Target', 'Lidlar', 'Marketing', 'Telegram'],
    image_url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 135,
    created_at: '2026-08-18T11:15:00.000Z',
    content: `
      <p class="lead-paragraph">Telegram Ads platformasi 2026-yilda O‘zbekiston va xalqaro bozorlarda eng toza va to‘lov qobiliyatiga ega auditoriyaga chiqish uchun asosiy kanalga aylandi. Reklama 1000+ obunachisi bor barcha ommaviy kanallarda eng oxirgi post sifatida chiqadi.</p>

      <h2>1. Kanal va Mavzu bo‘yicha aniq targetlash</h2>
      <p>Telegram Ads ikkita asosiy nishonga olish usulini taklif qiladi:</p>
      <ul>
        <li><strong>Target Specific Channels:</strong> To‘g‘ridan-to‘g‘ri raqobatchilaringiz va sohangizdagi faol kanallar ro‘yxatini kiritish.</li>
        <li><strong>Target Topics:</strong> Muayyan mavzular (Moliya, Biznes, Ta’lim, Ko‘chmas mulk) bo‘yicha keng qamrovli ko‘rsatish.</li>
      </ul>

      <h2>2. 160 belgilik matnlar va Moderatsiya talablari</h2>
      <p>Telegram reklamalarida rasmlar yo‘q, faqat 160 ta belgigacha bo‘lgan matn va bitta havola (kanal, bot yoki veb-sayt) ishlatiladi:</p>
      <ul>
        <li>Qichqiruvchi sarlavhalar, CAPSLOCK, haddan ortiq emoji va noaniq va’dalar qat’iyan man etiladi.</li>
        <li>To‘g‘ridan-to‘g‘ri muammo va uning yechimini ko‘rsatuvchi sodda, ishonchli matnlar eng yuqori CTR beradi.</li>
      </ul>

      <h2>3. Funnel arxitekturasi: Kanalmi yoki Bot?</h2>
      <p>Agar maqsadingiz tezkor sotuv bo‘lsa, reklamani <strong>Telegram Bot / Mini App</strong>ga yo‘naltiring. Bot foydalanuvchiga darhol taklif beradi, telefon raqamini oladi va CRM tizimiga lid sifatida uzatadi.</p>
    `
  },

  // 5. Meta Conversions API (CAPI)
  {
    slug: 'meta-capi-server-side-tracking-2026',
    title: 'Meta Conversions API (CAPI) va Server-Side Tracking: Pixel ma\'lumotlarini 98% aniqlikda uzatish',
    excerpt: 'iOS blokirovkalari va brauzer cheklovlariga qaramay, xarid va lid hodisalarini yo\'qotmasdan Meta serverlariga to\'g\'ridan-to\'g\'ri uzatish arxitekturasi.',
    category: 'facebook',
    tags: ['Meta', 'CAPI', 'ConversionsAPI', 'Pixel', 'ServerSide'],
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 97,
    created_at: '2026-08-04T10:00:00.000Z',
    content: `
      <p class="lead-paragraph">An’anaviy brauzer Meta Pixel endilikda yetarli emas. AdBlocker dasturlari, iOS maxfiylik cheklovlari (ATT) va brauzer cookie cheklovlari tufayli reklamachilar real konversiyalarning 20% dan 40% gacha qismini yo‘qotmoqda.</p>

      <h2>1. CAPI qanday ishlaydi?</h2>
      <p>Conversions API foydalanuvchi brauzeriga tayanmasdan, to‘g‘ridan-to‘g‘ri sizning veb-saytingiz serveridan Meta serverlariga ma’lumot yuboradi. Har bir <code>Lead</code>, <code>Purchase</code> yoki <code>AddToCart</code> hodisasi backend orqali xavfsiz tarzda yetkaziladi.</p>

      <h2>2. Event Quality Score (Hodisalar sifati)ni 8.5+ ga ko‘tarish</h2>
      <p>Meta AI algoritmi xaridorni to‘g‘ri tanishi uchun hodisa bilan birga quyidagi parametrlarni uzatish zarur:</p>
      <ul>
        <li>Shifrlangan Email (SHA-256)</li>
        <li>Shifrlangan Telefon raqami</li>
        <li>IP manzil va User-Agent</li>
        <li>fbp (Facebook Browser ID) va fbc (Click ID) parametrlari</li>
      </ul>

      <h2>3. Deduplication (Dublikatlarni tozalash)</h2>
      <p>Agar siz ham Pixel, ham CAPI ishlatayotgan bo‘lsangiz, bir xil hodisa ikki marta hisoblanmasligi uchun har ikkala hodisaga bir xil <code>event_id</code> biriktirishingiz shart.</p>
    `
  },

  // 6. LinkedIn ABM Strategy
  {
    slug: 'linkedin-abm-b2b-strategy-2026',
    title: 'LinkedIn Account-Based Marketing (ABM): Yirik korporativ B2B mijozlarni jalb qilish',
    excerpt: 'Kompaniyalar ro\'yxati, lavozimlar (C-Level) va Lead Gen Forms orqali yuqori chekli B2B xizmatlarni sotish strategiyasi.',
    category: 'linkedin',
    tags: ['LinkedIn', 'ABM', 'B2B', 'LeadGen', 'Marketing'],
    image_url: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 82,
    created_at: '2026-07-22T08:45:00.000Z',
    content: `
      <p class="lead-paragraph">B2B sohasida bitim qiymati \$5,000 dan \$100,000 gacha bo‘lgan shartnomalarni yopishda LinkedIn reklama tizimi tengsiz vosita hisoblanadi. Ayniqsa, Account-Based Marketing (ABM) strategiyasi yordamida aniq kompaniyalarning qaror qabul qiluvchi shaxslarini nishonga olish mumkin.</p>

      <h2>1. Matched Audiences va Kompaniyalar ro‘yxati</h2>
      <p>O‘zingiz bilan ishlashini istagan 500-1000 ta yirik kompaniyalar ro‘yxatini (domenlari va nomlarini) LinkedIn kabinetiga yuklang. Tizim ushbu kompaniyalarning xodimlarini avtomatik ajratib beradi.</p>

      <h2>2. Job Title va Seniority bo‘yicha filtrlash</h2>
      <p>Kompaniya ichida barchaga emas, faqat shartnomani imzolaydigan shaxslarga reklama ko‘rsating:</p>
      <ul>
        <li><strong>Job Functions:</strong> Operations, Information Technology, Marketing, Finance.</li>
        <li><strong>Seniority Level:</strong> CXO, VP, Director, Owner, Partner.</li>
      </ul>

      <h2>3. LinkedIn Lead Gen Forms afzalligi</h2>
      <p>Foydalanuvchi tashqi saytga o‘tib o‘tirmaydi. Reklama tugmasi bosilganda forma uning profildagi rasmiy ismi, korporativ emaili va telefon raqami bilan avtomatik to‘ldiriladi. Bu esa konversiyani 3x barobarga oshiradi.</p>
    `
  },

  // 7. X (Twitter) Ads Strategy
  {
    slug: 'x-ads-algorithm-video-strategy-2026',
    title: 'X (Twitter) Ads 2026: Yangilangan algoritm va video reklama orqali xalqaro auditoriyaga chiqish',
    excerpt: 'Grok AI tavsiya algoritmlari davrida X Ads orqali Tech, SaaS va fintech loyihalarga arzon trafik va ro\'yxatdan o\'tishlarni yo\'naltirish.',
    category: 'x',
    tags: ['XAds', 'Twitter', 'VideoAds', 'TechMarketing', 'SaaS'],
    image_url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '4 daqiqa',
    views: 74,
    created_at: '2026-07-09T16:20:00.000Z',
    content: `
      <p class="lead-paragraph">X (Twitter) platformasi yangilangan algoritm va sun’iy intellekt integratsiyasidan so‘ng xalqaro auditoriyaga yo‘naltirilgan loyihalar uchun eng tezkor va arzon reklama kanallaridan biriga aylandi.</p>

      <h2>1. Kalit so‘zlar (Keywords) va Followers of Accounts targetlash</h2>
      <p>X tarmog‘ida auditoriyani nishonga olishning eng kuchli tomoni — foydalanuvchilarning ayni damda qaysi mavzularni muhokama qilayotgani va qaysi nufuzli shaxslarni (influencerlarni) kuzatib borayotganini aniqlashdir.</p>

      <h2>2. X Video Ads va Vertical Video formati</h2>
      <p>Immersive video formatlari X platformasida eng yuqori jalb qiluvchanlik (engagement) va minimal CPM narxini ta’minlamoqda. 15-30 soniyalik dinamik roliklar SaaS va fintech ilovalarni tanitishda eng yaxshi natijani bermoqda.</p>
    `
  },

  // 8. Google Demand Gen & Shorts
  {
    slug: 'google-demand-gen-youtube-shorts-ads',
    title: 'Google Demand Gen va YouTube Shorts Ads: Sovuq auditoriyadan issiq xaridor yaratish',
    excerpt: 'Qidiruv talabini kutmasdan, YouTube Shorts va Discover orqali yangi mahsulotlarga ommaviy qiziqish uyg\'otish va sotuvga aylantirish san\'ati.',
    category: 'google',
    tags: ['GoogleAds', 'DemandGen', 'YouTubeShorts', 'Discover', 'ECommerce'],
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 91,
    created_at: '2026-06-25T13:10:00.000Z',
    content: `
      <p class="lead-paragraph">Discovery kampaniyalari o‘rnini egallagan Google Demand Gen formati YouTube Shorts, YouTube In-Feed, Gmail va Google Discover tarmoqlarida vizual hikoya orqali talabni shakllantirish imkonini beradi.</p>

      <h2>1. Search va Demand Gen o‘rtasidagi farq</h2>
      <p>Google Search mavjud talabni ushlaydi (odamlar allaqachon qidirmoqda). Demand Gen esa hali mahsulotni qidirmagan, lekin qiziqishi mumkin bo‘lgan sovuq auditoriyaga vizual tarzda ko‘rsatilib, talabni noldan uyg‘otadi.</p>

      <h2>2. YouTube Shorts kreativlari qanday bo‘lishi kerak?</h2>
      <ul>
        <li><strong>Dastlabki 3 soniya (Hook):</strong> Tomoshabinni to‘xtatib qoluvchi kuchli vizual yoki savol.</li>
        <li><strong>Foyda va yechim:</strong> Mahsulot qanday muammoni hal qilishini real ko‘rsatish.</li>
        <li><strong>Aniq Call To Action:</strong> "Profilga o‘ting", "Hoziroq sinab ko‘ring".</li>
      </ul>
    `
  },

  // 9. Telegram Mini Apps Traffic
  {
    slug: 'telegram-mini-apps-tma-funnel-guide',
    title: 'Telegram Mini Apps (TMA) uchun trafik haydash: Liddan to\'lovgacha 1 bosqichli funnel',
    excerpt: 'WebApp botlariga to\'g\'ridan-to\'g\'ri reklama yoqish, Telegram ichida to\'lov qabul qilish va konversiyani 65% ga oshirish usullari.',
    category: 'telegram',
    tags: ['Telegram', 'MiniApps', 'TMA', 'WebApps', 'Funnel'],
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 104,
    created_at: '2026-06-11T15:40:00.000Z',
    content: `
      <p class="lead-paragraph">Telegram Mini Apps (TMA) — bu foydalanuvchini Telegram ilovasidan chiqarmasdan turib to‘liq interaktiv veb-sayt, do‘kon yoki xizmatni ochib beruvchi texnologiyadir.</p>

      <h2>1. Nega TMA oddiy saytlardan yaxshiroq konversiya beradi?</h2>
      <ul>
        <li><strong>Ro‘yxatdan o‘tish shart emas:</strong> Foydalanuvchining Telegram ID, ismi va tili avtomatik olinadi.</li>
        <li><strong>1-klikda to‘lov:</strong> Telegram Stars yoki Click/Payme/Stripe orqali to‘g‘ridan-to‘g‘ri to‘lov.</li>
        <li><strong>Push-bildirishnomalar:</strong> Bot foydalanuvchiga qayta eslatma xabarlarini bepul yuborishi mumkin.</li>
      </ul>
    `
  },

  // 10. Meta CBO vs ABO Scaling
  {
    slug: 'meta-cbo-vs-abo-scaling-strategy-2026',
    title: 'Meta CBO vs ABO: Kunlik $500+ byudjetni masshtablashda qaysi biri samaraliroq?',
    excerpt: 'Advantage Campaign Budget (CBO) va Ad Set Budget (ABO) strategiyalarini to\'g\'ri tanlash, test bosqichidan masshtabga o\'tish formulalari.',
    category: 'facebook',
    tags: ['Meta', 'CBO', 'ABO', 'Scaling', 'MediaBuying'],
    image_url: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 121,
    created_at: '2026-05-29T10:30:00.000Z',
    content: `
      <p class="lead-paragraph">Reklama byudjetini kuniga \$50 dan \$500-\$2,000 gacha oshirishda ko‘plab media buyerlar ROASning keskin tushib ketishiga duch kelishadi. Buning sababi noto‘g‘ri byudjet taqsimotidir.</p>

      <h2>1. ABO (Ad Set Budget) — Faqat test bosqichi uchun</h2>
      <p>Yangi kreativlar, gipotezalar va auditoriyalarni test qilayotganda ABO ishlating. Bu har bir adset o‘ziga ajratilgan byudjetni to‘liq sarflashini va adolatli test o‘tishini ta’minlaydi.</p>

      <h2>2. CBO (Advantage Campaign Budget) — Masshtablash uchun</h2>
      <p>G‘olib (winner) kreativlar va auditoriyalar aniqlangandan so‘ng, ularni bitta CBO kampaniyasiga birlashtiring. Meta AI byudjetni real vaqt rejimida eng arzon konversiya berayotgan adsetga yo‘naltiradi.</p>
    `
  },

  // 11. LinkedIn Thought Leader Ads
  {
    slug: 'linkedin-thought-leader-ads-executive-brand',
    title: 'LinkedIn Thought Leader Ads: Bosh direktor sahifasi orqali ishonchli B2B lidlar oqimi',
    excerpt: 'Shaxsiy brend postlarini reklama qilish orqali CPL (lid narxi)ni an\'anaviy korporativ bannerlarga nisbatan 2 barobar arzonlashtirish.',
    category: 'linkedin',
    tags: ['LinkedIn', 'ThoughtLeader', 'PersonalBrand', 'B2B', 'Executive'],
    image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '4 daqiqa',
    views: 79,
    created_at: '2026-05-14T09:15:00.000Z',
    content: `
      <p class="lead-paragraph">Odamlar kompaniya logotiplariga emas, tirik insonlarga ishonadi. LinkedIn Thought Leader Ads kompaniya rahbarlari va ekspertlarining shaxsiy postlarini maqsadli auditoriyaga reklama qilish imkonini beradi.</p>

      <h2>Nega bu format 2x samaraliroq?</h2>
      <p>Kompaniya sahifasidan berilgan reklama ko‘pincha quruq savdo xarakteriga ega bo‘ladi. Bosh direktor yoki yetakchi mutaxassisning real keysi va tahliliy posti esa yuqori ishonch uyg‘otadi va organik qamrov bilan birgalikda arzonroq lid olib keladi.</p>
    `
  },

  // 12. Google Consent Mode v2
  {
    slug: 'google-consent-mode-v2-enhanced-conversions',
    title: 'Google Consent Mode v2 va Enhanced Conversions: Reklamada yo\'qotilgan 30% konversiyalarni tiklash',
    excerpt: 'Maxfiylik qoidalari (GDPR/ePrivacy) kuchaygan davrda Google Tag Manager orqali modellashtirilgan konversiyalarni to\'g\'ri o\'lchash.',
    category: 'google',
    tags: ['GoogleAds', 'ConsentModeV2', 'EnhancedConversions', 'GTM', 'Analytics'],
    image_url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 86,
    created_at: '2026-04-28T11:00:00.000Z',
    content: `
      <p class="lead-paragraph">2026-yilda Google Ads platformasida samarali ishlash uchun Consent Mode v2 va Enhanced Conversions tizimini to‘g‘ri sozlash majburiy talabga aylandi.</p>

      <h2>1. Consent Mode v2 signallari: ad_user_data va ad_personalization</h2>
      <p>Yangi standartlar orqali foydalanuvchi cookie roziligini bermagan taqdirda ham, Google AI modellashtirish (conversion modeling) orqali yo‘qotilgan konversiyalarning 70% dan ortig‘ini hisobga oladi.</p>

      <h2>2. Enhanced Conversions sozlash</h2>
      <p>Xarid amalga oshirilganda mijozning emaili va telefoni xeshlangan holda Google Tag orqali uzatiladi. Bu qidiruv va YouTube kampaniyalarida ROAS hisob-kitobini aniq qiladi.</p>
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
