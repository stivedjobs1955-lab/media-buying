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
    author TEXT NOT NULL DEFAULT 'The Unique Media',
    read_time TEXT NOT NULL DEFAULT '7 daqiqa',
    views INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TEXT NOT NULL
  );
`);

// Migration for existing databases without status column
try {
  db.exec("ALTER TABLE articles ADD COLUMN status TEXT NOT NULL DEFAULT 'published'");
} catch (e) {
  // Column already exists
}

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
  // 1. Meta Moderation Report
  // ==========================================
  {
    slug: 'facebook-instagram-moderation-report-2026',
    title: '2026-yilning birinchi yarmi bo‘yicha Facebook va Instagram kontent moderatsiyasi hisoboti',
    excerpt: 'Meta kompaniyasi 2026-yil H1 bo‘yicha kontent moderatsiyasi, o‘chirishlar, apellatsiyalar, soxta akkauntlar va spamga qarshi kurash bo‘yicha rasmiy statistikasini taqdim etdi.',
    category: 'facebook',
    tags: ['Facebook', 'Instagram', 'Meta', 'Moderatsiya', 'Hisobot', 'MediaBuying'],
    image_url: 'https://cpa.rip/wp-content/uploads/2026/09/234512343-2.png',
    author: 'The Unique Media',
    read_time: '8 daqiqa',
    views: 312,
    created_at: '2026-09-14T09:00:00.000Z',
    content: `
      <p class="lead-paragraph">Meta kompaniyasi 2026-yilning birinchi yarim yilligi (H1 2026) bo‘yicha Facebook va Instagram platformalarida kontent moderatsiyasi, blokirovkalar, apellatsiyalar, soxta akkauntlar va spamga qarshi kurash bo‘yicha rasmiy hisobotini e’lon qildi. Quyida media buyerlar va targetologlar uchun eng muhim amaliy xulosalar va tahlillar keltirilgan.</p>

      <h2>1. Umumiy moderatsiya ko‘rsatkichlari</h2>
      <p>Meta moderatsiya tizimi bir vaqtning o‘zida bir nechta yo‘nalishda ishlaydi. 2026-yilning birinchi yarmida quyidagi hajmdagi kontent cheklandi va o‘chirildi:</p>
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

      <h2>2. Xato blokirovkalar (False positives) va Algoritm aniqligi</h2>
      <p>Moderatsiya algoritmlarining aniqlik darajasi ko‘p hollarda 90% atrofida saqlanib qolmoqda. Biroq 2026-yilning 1-choragida (Q1) Facebook’da aniqlik darajasi <strong>85.19% – 87.02%</strong> gacha pasaygan (Instagram’da esa 91%+ barqaror bo‘lgan).</p>
      
      <div class="article-callout note">
        <strong>💡 Tizim xatolari tufayli nohaq bloklar soni:</strong>
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

      <h2>4. Soxta (Feyk) akkauntlar bilan kurash</h2>
      <p>2026-yilning birinchi yarmida Meta Facebook’da <strong>2.02 milliard</strong> dona soxta akkauntni blokladi (H2 2025-dagi 1.80 milliarddan ko‘p).</p>
      <ul>
        <li>Akkauntlarning <strong>99.9%</strong> qismi Meta sun’iy intellekti va neyrotarmoqlari tomonidan avtomatik aniqlangan.</li>
        <li>Insoniy shikoyatlar ulushi esa bor-yo‘g‘i <strong>0.1%</strong> ni tashkil etgan.</li>
      </ul>

      <h2>💡 Media Buyerlar va Targetologlar uchun amaliy tavsiyalar</h2>
      <ol class="article-key-takeaways">
        <li><strong>Apellatsiyalarga ortiqcha umid bog‘lamang:</strong> Bloklangan akkaunt yoki reklamalarni apellatsiya orqali qaytarish imkoniyati 4 barobarga qisqardi. Zaxira akkauntlar tizimini yo‘lga qo‘yish lozim.</li>
        <li><strong>Sifatli farm va trust profillarga e’tibor bering:</strong> Meta AI algoritmlari feyk akkauntlarni inson shikoyatisiz 99.9% aniqlik bilan tutmoqda. Sifatli farm, trust va ishonchli rezident proksilar ahamiyati har qachongidan yuqori.</li>
        <li><strong>Kreativlarda trigger so‘zlardan qoching:</strong> Agressiv va’dalar, tibbiy da’volar va taqiqlangan trigger so‘zlar avtomatik ban olish xavfini oshiradi.</li>
      </ol>
    `
  },

  // ==========================================
  // 2. Meta In-Market Categories Testing
  // ==========================================
  {
    slug: 'fb-in-market-categories-testing',
    title: 'Facebook Ads batafsil targetlashda "In-market categories" funksiyasini test qilmoqda',
    excerpt: 'Meta reklama kabinetlarida Detailed Targeting ichida "In-market categories" toifasini sinovdan o‘tkazmoqda. Xarid niyati yuqori issiq auditoriyani qamrab olish imkoniyati.',
    category: 'facebook',
    tags: ['Facebook', 'FacebookAds', 'Targeting', 'InMarket', 'MediaBuying'],
    image_url: 'https://cpa.rip/wp-content/uploads/2026/09/facebook_ads_payment_status_1200x5364.png',
    author: 'The Unique Media',
    read_time: '4 daqiqa',
    views: 285,
    created_at: '2026-09-10T09:56:14.000Z',
    content: `
      <p class="lead-paragraph">Facebook Ads reklamachilar uchun ayni paytda muayyan tovar yoki xizmatlarni qidirayotgan va xarid qilishga tayyor bo‘lgan foydalanuvchilarni nishonga oluvchi yangi <strong>In-market categories</strong> (Bozordagi faol xaridorlar) funksiyasini test qilmoqda.</p>

      <h2>1. In-market toifalari qanday ishlaydi?</h2>
      <p>Oddiy qiziqishlar (Interests) foydalanuvchining umumiy qiziqishlarini ifodalasa, <em>In-market categories</em> uning aynan so‘nggi kunlardagi faol xarid niyatini ko‘rsatadi. Masalan, foydalanuvchi doimiy ravishda mashinalarga qiziqishi mumkin (Interest: Cars), ammo oxirgi 7 kunda u salonlarni ko‘rib chiqqan, narxlarni taqqoslagan bo‘lsa — u <strong>In-market: Auto Buyer</strong> toifasiga kiradi.</p>

      <h2>2. Qaysi toifalar mavjud?</h2>
      <ul>
        <li><strong>Avtomobillar va Transport:</strong> Yangi va ikkilamchi bozor, lizing xizmatlari.</li>
        <li><strong>Elektronika va Texnika:</strong> Smartfonlar, noutbuklar, maishiy texnika.</li>
        <li><strong>Ta’lim va Treninglar:</strong> Kasbiy kurslar, chet tillari, oliy ta’lim.</li>
        <li><strong>Ko‘chmas mulk va Qurilish:</strong> Kvartiralar, uylar, ta’mirlash xizmatlari.</li>
        <li><strong>Moda va Kiyim-kechak:</strong> Mavsumiy xaridlar, poyabzallar, aksessuarlar.</li>
        <li><strong>Salomatlik va Go‘zallik:</strong> Kosmetika, sport zallari, tibbiy ko‘riklar.</li>
      </ul>

      <div class="article-callout tip">
        <strong>🎯 Sinov muddati:</strong>
        <p>Funksiya hozircha barcha kabinetlarda emas, beta-test rejimida ishlamoqda. Mavjud kabinetlarda ushbu toifalarni <strong>2026-yil 2-noyabrgacha</strong> test qilish imkoniyati berilgan.</p>
      </div>

      <h2>3. Media Buyerlar uchun tavsiyalar</h2>
      <ol class="article-key-takeaways">
        <li><strong>Hard-Offer bilan kiring:</strong> In-market foydalanuvchilari mahsulot haqida biladi, shuning uchun ularga to‘g‘ridan-to‘g‘ri chegirma, bepul yetkazib berish yoki ustunlik taklifini bering.</li>
        <li><strong>Keng (Broad) targetlash bilan taqqoslang:</strong> 50% byudjetni Broad ga, 50% byudjetni In-market segmentiga ajratib, CPA/CPL narxini solishtiring.</li>
      </ol>
    `
  },

  // ==========================================
  // 3. Google PMax Guide 2026
  // ==========================================
  {
    slug: 'google-ads-pmax-roas-optimization-guide-2026',
    title: 'Google Ads Performance Max 2026: ROAS\'ni 3.8x ga oshirish va byudjet isrofini to\'xtatish',
    excerpt: 'Auditoriya signallari, Brand Exclusion, nofaol joylashuvlarni filtrlash va Smart Bidding orqali konversiya narxini 45% ga tushirish bo\'yicha to\'liq qo\'llanma.',
    category: 'google',
    tags: ['GoogleAds', 'PMax', 'ROAS', 'PerformanceMax', 'PPC'],
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '8 daqiqa',
    views: 340,
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

      <h2>4. Asset Group sifatini 'Excellent' darajaga yetkazish</h2>
      <p>Har bir Asset Group ichiga quyidagilarni to‘liq yuklang:</p>
      <ul>
        <li>Kamida 5 ta sarlavha (Headlines) va 5 ta uzun sarlavha (Long Headlines)</li>
        <li>Kamida 4 ta tavsif (Descriptions)</li>
        <li>Kamida 15 ta turli o‘lchamdagi rasm (1:1, 1.91:1, 4:5)</li>
        <li>Kamida 3 ta YouTube video (gorizontal va 9:16 Shorts)</li>
      </ul>
    `
  },

  // ==========================================
  // 4. Telegram Ads Targeting
  // ==========================================
  {
    slug: 'telegram-ads-conversion-scaling-strategies',
    title: 'Telegram Ads 2026: Raqobatchilar kanallarini targetlash va arzon lid olish usullari',
    excerpt: 'Telegram rasmiy reklama platformasida kanallar tanlash, CPM nazorati va botlar orqali avtomatlashtirilgan funnel qurish bo\'yicha amaliy tajriba.',
    category: 'telegram',
    tags: ['TelegramAds', 'Target', 'Lidlar', 'Marketing', 'Telegram'],
    image_url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '7 daqiqa',
    views: 310,
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

  // ==========================================
  // 5. Meta Advantage+ Shopping Campaigns
  // ==========================================
  {
    slug: 'meta-advantage-plus-shopping-catalog-guide',
    title: 'Meta Advantage+ Shopping va Catalog Ads: 2026-yilda E-Commerce savdosini 3x oshirish',
    excerpt: 'Sun\'iy intellektga asoslangan Advantage+ Shopping kampaniyalari (ASC) orqali katalog mahsulotlarini avtomatlashtirilgan tarzda sotish strategiyasi.',
    category: 'facebook',
    tags: ['Meta', 'AdvantagePlus', 'ASC', 'ECommerce', 'CatalogAds'],
    image_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '7 daqiqa',
    views: 260,
    created_at: '2026-08-24T12:00:00.000Z',
    content: `
      <p class="lead-paragraph">Advantage+ Shopping Campaigns (ASC) hozirda e-commerce loyihalarida an’anaviy qo‘lda boshqariladigan kampaniyalar o‘rnini to‘liq egallamoqda. Ushbu tizim sun’iy intellekt orqali eng ko‘p xarid ehtimoli bor foydalanuvchilarga mos mahsulotlarni avtomatik tavsiya qiladi.</p>

      <h2>1. Kreativlar xilma-xilligi (Creative Diversity)</h2>
      <p>Bitta ASC kampaniyasiga kamida 10-15 ta har xil formatdagi kreativlarni joylashtiring:</p>
      <ul>
        <li>Foydalanuvchilar sharhlari (UGC video)</li>
        <li>Mahsulot afzalliklari ko‘rsatilgan statik bannerlar</li>
        <li>Dinamik mahsulot karusellari (DABA/DPA)</li>
      </ul>

      <h2>2. Mavjud mijozlar ulushini (Existing Customer Cap) belgilash</h2>
      <p>Reklama byudjeti faqat sizdan avval xarid qilgan eski mijozlarga sarflanib ketmasligi uchun <em>Account Settings</em> bo‘limida eski xaridorlar bazasini belgilab, ularning ulushini <strong>10-15%</strong> dan oshirmaslikni sozlang.</p>
    `
  },

  // ==========================================
  // 6. LinkedIn ABM Strategy
  // ==========================================
  {
    slug: 'linkedin-abm-b2b-strategy-2026',
    title: 'LinkedIn Account-Based Marketing (ABM): Yirik korporativ B2B mijozlarni jalb qilish',
    excerpt: 'Kompaniyalar ro\'yxati, lavozimlar (C-Level) va Lead Gen Forms orqali yuqori chekli B2B xizmatlarni sotish strategiyasi.',
    category: 'linkedin',
    tags: ['LinkedIn', 'ABM', 'B2B', 'LeadGen', 'Marketing'],
    image_url: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 245,
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
      <p>Foydalanuvchi tashqi saytga o‘tib o‘tirmaydi. Reklama tugmasi bosilganda forma uning profildagi rasmiy ismi, korporativ emaili va telefon raqami bilan avtomatik to‘ldiriladi.</p>
    `
  },

  // ==========================================
  // 7. X (Twitter) Ads 2026 Strategy
  // ==========================================
  {
    slug: 'x-ads-algorithm-video-strategy-2026',
    title: 'X (Twitter) Ads 2026: Yangilangan algoritm va video reklama orqali xalqaro auditoriyaga chiqish',
    excerpt: 'Grok AI tavsiya algoritmlari davrida X Ads orqali Tech, SaaS va fintech loyihalarga arzon trafik va ro\'yxatdan o\'tishlarni yo\'naltirish.',
    category: 'x',
    tags: ['XAds', 'Twitter', 'VideoAds', 'TechMarketing', 'SaaS'],
    image_url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '5 daqiqa',
    views: 215,
    created_at: '2026-07-09T16:20:00.000Z',
    content: `
      <p class="lead-paragraph">X (Twitter) platformasi yangilangan algoritm va sun’iy intellekt integratsiyasidan so‘ng xalqaro auditoriyaga yo‘naltirilgan loyihalar uchun eng tezkor va arzon reklama kanallaridan biriga aylandi.</p>

      <h2>1. Kalit so‘zlar (Keywords) va Followers of Accounts targetlash</h2>
      <p>X tarmog‘ida auditoriyani nishonga olishning eng kuchli tomoni — foydalanuvchilarning ayni damda qaysi mavzularni muhokama qilayotgani va qaysi nufuzli shaxslarni (influencerlarni) kuzatib borayotganini aniqlashdir.</p>

      <h2>2. X Video Ads va Vertical Video formati</h2>
      <p>Immersive video formatlari X platformasida eng yuqori jalb qiluvchanlik (engagement) va minimal CPM narxini ta’minlamoqda. 15-30 soniyalik dinamik roliklar SaaS va fintech ilovalarni tanitishda eng yaxshi natijani bermoqda.</p>
    `
  },

  // ==========================================
  // 8. Server-Side GTM Setup
  // ==========================================
  {
    slug: 'server-side-gtm-stape-cloud-setup-guide',
    title: 'Server-Side Google Tag Manager (sGTM): Tracking yo‘qotishlariga qarshi to‘liq infratuzilma',
    excerpt: 'Shaxsiy subdomen orqali birinchi tomonli (First-Party) ma\'lumotlar to‘plash va barcha reklama piksellarini yagona serverdan boshqarish.',
    category: 'google',
    tags: ['sGTM', 'ServerSide', 'Tracking', 'GoogleTagManager', 'Analytics'],
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '8 daqiqa',
    views: 290,
    created_at: '2026-08-31T15:00:00.000Z',
    content: `
      <p class="lead-paragraph">Server-Side Google Tag Manager (sGTM) veb-sayt va tahlil tizimlari o‘rtasida xavfsiz proksi-server vazifasini bajaradi. Bu esa mijozlar ma’lumotlarini uchinchi shaxslardan himoyalaydi va brauzer cheklovlarini to‘liq aylanib o‘tadi.</p>

      <h2>1. Nega sGTM 2026-yilda standartga aylandi?</h2>
      <ul>
        <li><strong>Cookie muddati uzaytiriladi:</strong> Safari ITP cheklovlari (7 kunlik cookie) o‘rniga shaxsiy subdomen orqali 1-2 yillik First-Party cookie saqlash imkoniyati.</li>
        <li><strong>Sayt yuklanish tezligi oshadi:</strong> O‘nlab og‘ir JavaScript skriptlar brauzerda emas, serverda ishlanadi.</li>
        <li><strong>AdBlocker filtrlaridan o‘tish:</strong> Shaxsiy subdomen orqali uzatilgan so‘rovlar hech qanday reklama blokerlarida to‘xtatilmaydi.</li>
      </ul>
    `
  },

  // ==========================================
  // 9. Multi-Touch Attribution
  // ==========================================
  {
    slug: 'multi-touch-attribution-models-performance-marketing',
    title: 'Multi-Touch Attributsiya Modellari: Reklama byudjeti qaysi kanal hisobiga o‘zini oqlamoqda?',
    excerpt: 'Last-Click xatosidan qochish: Data-Driven, Linear va Time-Decay modellari yordamida kanal samaradorligini adolatli baholash.',
    category: 'google',
    tags: ['Attribution', 'DataDriven', 'LastClick', 'MarketingAnalytics'],
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '7 daqiqa',
    views: 220,
    created_at: '2026-06-29T10:15:00.000Z',
    content: `
      <p class="lead-paragraph">Mijoz birinchi marta reklamani ko‘rganidan xarid qilgunicha 4-5 ta teginish nuqtasidan o‘tadi. Agar faqat oxirgi bosishga (Last-Click) qarab byudjet ajratilsa, sovuq auditoriyani jalb qilayotgan yuqori voronka (Top of Funnel) kanallari adashib o‘chirib qo‘yiladi.</p>

      <h2>Attributsiya turlari taqqoslanishi:</h2>
      <ul>
        <li><strong>Data-Driven Attribution (DDA):</strong> Sun’iy intellekt har bir kanalning real hissasini baholaydi (eng tavsiya etiladigan model).</li>
        <li><strong>Linear Attribution:</strong> Barcha teginish nuqtalariga teng foiz beradi.</li>
        <li><strong>Time-Decay:</strong> Xaridga yaqinroq bo‘lgan harakatlarga ko‘proq vazn beradi.</li>
      </ul>
    `
  },

  // ==========================================
  // 10. Meta Reels Video Ads
  // ==========================================
  {
    slug: 'meta-reels-9-16-video-ads-framework',
    title: 'Instagram Reels va TikTok uslubidagi Video Reklama: 2026-yilgi 3 soniyalik Hook formulalari',
    excerpt: 'Reels va Stories formatida qisqa video reklamalarning ushlab qolish darajasini (Hold Rate) 45% ga oshirish va CTRni 2.5x ga ko‘tarish sirlari.',
    category: 'facebook',
    tags: ['Reels', 'InstagramAds', 'VideoCreatives', 'HookRate', 'Target'],
    image_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 275,
    created_at: '2026-07-17T14:15:00.000Z',
    content: `
      <p class="lead-paragraph">9:16 vertikal video formatlari hozirda Meta tarmog‘idagi umumiy ko‘rishlarning 60% dan ortig‘ini tashkil qilmoqda. Muvaffaqiyatli videoning kaliti — dastlabki 3 soniyada yotadi.</p>

      <h2>1. Hook (0–3 soniya):</h2>
      <p>Muammoni kutilmagan savol yoki vizual harakat bilan boshlang. Masalan: "Agar siz hali ham reklama byudjetini shunday sarflayotgan bo‘lsangiz..."</p>

      <h2>2. Retensiya va Dinamika (3–15 soniya):</h2>
      <p>Har 2 soniyada kadr o‘zgarishi va subtitrlar (Captions) mavjud bo‘lishi shart, chunki foydalanuvchilarning 70% qismi videoni ovozsiz tomosha qiladi.</p>

      <h2>3. Aniq CTA (15–25 soniya):</h2>
      <p>Oxirida ikkilanmasdan aniq bitta harakatga chaqiring: "Hoziroq profilga o‘ting va chegirmaga ega bo‘ling".</p>
    `
  },

  // ==========================================
  // 11. Telegram Mini Apps (TMA)
  // ==========================================
  {
    slug: 'telegram-mini-apps-tma-funnel-guide',
    title: 'Telegram Mini Apps (TMA) uchun trafik haydash: Liddan to\'lovgacha 1 bosqichli funnel',
    excerpt: 'WebApp botlariga to\'g\'ridan-to\'g\'ri reklama yoqish, Telegram ichida to\'lov qabul qilish va konversiyani 65% ga oshirish usullari.',
    category: 'telegram',
    tags: ['Telegram', 'MiniApps', 'TMA', 'WebApps', 'Funnel'],
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '6 daqiqa',
    views: 298,
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

  // ==========================================
  // 12. Unit Economics in Performance Marketing
  // ==========================================
  {
    slug: 'unit-economics-cac-ltv-payback-period-media-buying',
    title: 'Media Buyingda Unit-Iqtisodiyot: CAC, LTV va O‘zini Oqlash Davri (Payback Period) formulalari',
    excerpt: 'Faqat ROASga qarab emas, mijozning umrbod qiymati (LTV) va qayta xaridlarini hisobga olgan holda byudjetni agressiv masshtablash.',
    category: 'facebook',
    tags: ['UnitEconomics', 'CAC', 'LTV', 'PaybackPeriod', 'Moliya'],
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    author: 'The Unique Media',
    read_time: '8 daqiqa',
    views: 260,
    created_at: '2026-03-27T09:00:00.000Z',
    content: `
      <p class="lead-paragraph">Ko‘plab media buyerlar birinchi xariddan foyda ko‘rmasa kampaniyani to‘xtatadi. Aslida esa obuna, qayta xarid va xizmatlar sohasida asosiy foyda mijozning 2-va 3-oylik to‘lovlaridan olinadi.</p>

      <h2>Asosiy formulalar:</h2>
      <ul>
        <li><strong>CAC (Customer Acquisition Cost):</strong> Jami reklama xarajati / Yangi mijozlar soni</li>
        <li><strong>LTV (Lifetime Value):</strong> Mijozning butun hamkorlik davomida keltirgan sof foydasi</li>
        <li><strong>LTV / CAC Nisbati:</strong> Sog‘lom biznesda bu ko‘rsatkich <strong>3.0x yoki undan yuqori</strong> bo‘lishi lozim.</li>
      </ul>
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
