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
    read_time TEXT NOT NULL DEFAULT '7 daqiqa',
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

function ensureSeedArticles() {
  const metaArticle = db.prepare('SELECT id FROM articles WHERE slug = ?').get('facebook-instagram-moderation-report-2026');
  if (!metaArticle) {
    const contentHtml = `
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

      <h2>2. Meta qoidalarni qanchalik aniq qo‘llamoqda? (Xato blokirovkalar)</h2>
      <p>Moderatsiya algoritmlarining aniqlik darajasi ko‘p hollarda 90% atrofida saqlanib qolmoqda. Biroq 2026-yilning 1-choragida (Q1) Facebook’da aniqlik darajasi <strong>85.19% – 87.02%</strong> gacha pasaygan (Instagram’da esa 91%+ barqaror bo‘lgan).</p>
      
      <div class="article-callout note">
        <strong>💡 Soxta signallar (False positives — nohaq bloklar):</strong>
        <p>2026-yilning birinchi yarmida tizim xatoligi sababli Facebook’da <strong>57.9 – 59.2 million</strong>, Instagram’da esa <strong>18.5 – 19.3 million</strong> kontent adashib cheklovga uchragan. Instagram’da noto‘g‘ri bloklashlar soni o‘tgan yilga nisbatan sezilarli darajada kamaygan.</p>
      </div>

      <h2>3. Adult (Kattalar uchun) kontent va apellatsiyalar</h2>
      <p>Meta jinsiy xarakterdagi va taqiqlangan adult-kontentga nisbatan choralarni kuchaytirdi:</p>
      <ul>
        <li><strong>Facebook:</strong> 44.4 mln kontentga chora ko‘rildi (+34% o‘sish).</li>
        <li><strong>Instagram:</strong> 24.2 mln kontentga chora ko‘rildi (+67% o‘sish).</li>
      </ul>
      <p>Ayniqsa, 2026-yilning 2-choragida keskin sakrash kuzatildi: birgina Q2 da Facebook’da 27.8 mln, Instagram’da 16.1 mln adult kontent cheklandi.</p>

      <h3>Apellatsiyalar va qayta tiklash (Restored) statistikasi:</h3>
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
              <td>H2 2025</td>
              <td>Instagram</td>
              <td>1.49 mln</td>
              <td>316 ming</td>
              <td><span class="badge">21.2%</span></td>
            </tr>
            <tr>
              <td>H1 2025</td>
              <td>Facebook</td>
              <td>4.90 mln</td>
              <td>3.17 mln</td>
              <td><span class="badge badge-success">64.7%</span></td>
            </tr>
            <tr>
              <td>H1 2025</td>
              <td>Instagram</td>
              <td>3.00 mln</td>
              <td>1.74 mln</td>
              <td><span class="badge badge-success">58.0%</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="article-callout alert">
        <strong>⚠️ Muhim tendensiya:</strong>
        <p>2025-yilda shikoyatlarning 58–64% qismi ijobiy qanoatlantirilgan bo‘lsa, 2026-yilda bu ko‘rsatkich <strong>14–17% gacha tushib ketdi</strong>. Ya’ni Meta o‘z qarorlarini qayta ko‘rib chiqishda ancha qat’iy va kamdan-kam hollarda blokni yechmoqda.</p>
      </div>

      <h2>4. Soxta (Feyk) akkauntlar</h2>
      <p>2026-yilning birinchi yarmida Meta Facebook’da <strong>2.02 milliard</strong> dona soxta akkauntni blokladi (H2 2025-dagi 1.80 milliarddan ko‘p).</p>
      <ul>
        <li>Akkauntlarning <strong>99.9%</strong> qismi Meta sun’iy intellekti va algoritmlari tomonidan avtomatik aniqlangan, insoniy shikoyatlar ulushi esa bor-yo‘g‘i <strong>0.1%</strong> ni tashkil etgan.</li>
        <li>Shuningdek, tizim har kuni ro‘yxatdan o‘tishga urinayotgan millionlab feyk akkauntlarni hali yaratilmasidanoq to‘xtatib qolmoqda.</li>
      </ul>

      <div class="article-callout tip">
        <strong>🔍 Qiziqarli keys:</strong>
        <p>Meta’ning <em>Adversarial Threat Report</em> hisobotida qayd etilishicha, Pokistonda 575 mingta oldindan tayyorlab qo‘yilgan nofaol akkauntlar "zaxirasi" fosh etilgan. Ular keyinchalik firibgarlik va noqonuniy sxemalarda foydalanish uchun saqlab kelingan.</p>
      </div>

      <h2>5. Spam bilan kurash</h2>
      <p>Spam — bu sun’iy ravishda qamrovni oshirish, botlar va ko‘p sonli akkauntlar orqali bir xil kontentni ommalashtirishga urinishdir.</p>
      <ul>
        <li>2026-yilning 1-yarmida <strong>Facebook’da 162.9 mln</strong>, <strong>Instagram’da esa 97.7 mln</strong> spam holatlariga cheklov qo‘yildi.</li>
        <li>Facebook’da o‘chirilgan spam hajmi 2025-yilning shu davriga nisbatan <strong>69% ga kamaygan</strong>.</li>
      </ul>

      <h2>💡 Arbitrajchilar va Media Buyerlar uchun amaliy xulosalar</h2>
      <ol class="article-key-takeaways">
        <li><strong>Apellatsiyalarga ortiqcha umid bog‘lamang:</strong> Bloklangan akkaunt yoki reklamalarni apellatsiya orqali qaytarish imkoniyati 4 barobarga qisqardi. Zaxira akkauntlar tizimini yo‘lga qo‘yish lozim.</li>
        <li><strong>Sifatli farm va trust profillarga e’tibor bering:</strong> Meta AI algoritmlari feyk akkauntlarni inson shikoyatisiz 99.9% aniqlik bilan tutmoqda. Sifatli farm, trust va ishonchli rezident proksilar ahamiyati har qachongidan yuqori.</li>
        <li><strong>Kreativlarda qat’iy filtrlash:</strong> Adult va trigger so‘zlarga ega kreativlar uchun neyrotarmoq tekshiruvi yanada kuchaytirilgan. Oq ro‘yxatdagi domenlar va toza lendlinglar ishlatilishi zarur.</li>
      </ol>
    `;

    db.prepare(`
      INSERT INTO articles (slug, title, excerpt, content, category, tags, image_url, author, read_time, views, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'facebook-instagram-moderation-report-2026',
      '2026-yilning birinchi yarmi bo‘yicha Facebook va Instagram kontent moderatsiyasi hisoboti',
      'Meta kompaniyasi 2026-yil H1 bo‘yicha kontent moderatsiyasi, o‘chirishlar, apellatsiyalar, soxta akkauntlar va spamga qarshi kurash bo‘yicha rasmiy statistikasini taqdim etdi.',
      contentHtml.trim(),
      'facebook',
      JSON.stringify(['Facebook', 'Instagram', 'Meta', 'Moderatsiya', 'Hisobot', 'MediaBuying']),
      'https://cpa.rip/wp-content/uploads/2026/09/234512343-2.png',
      'Unique Media Buying',
      '7 daqiqa',
      128,
      '2026-09-14T09:00:00.000Z'
    );
  }

  // Seed Article 2: Google Ads
  const googleArticle = db.prepare('SELECT id FROM articles WHERE slug = ?').get('google-ads-pmax-roas-optimization-guide-2026');
  if (!googleArticle) {
    db.prepare(`
      INSERT INTO articles (slug, title, excerpt, content, category, tags, image_url, author, read_time, views, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'google-ads-pmax-roas-optimization-guide-2026',
      'Google Ads Performance Max kampaniyalarida ROAS\'ni 3.8x ga ko‘tarish bo‘yicha qo‘llanma',
      'Smart bidding signallari, salbiy kalit so‘zlar va e-commerce loyihalarida konversiya narxini 45% ga tushirish usullari.',
      '<p class="lead-paragraph">Google Ads Performance Max kampaniyalari to‘g‘ri ma’lumotlar va aniq auditoriya signallari bilan oziqlantirilsa, an’anaviy qidiruv kampaniyalariga qaraganda ancha yuqori ROAS beradi.</p><h2>Asosiy optimallashtirish bosqichlari</h2><p>1. Konversiya qiymatini to‘g‘ri baholash.<br>2. First-party mijozlar bazasini yuklash.<br>3. Brand Exclusion ro‘yxatini yoqish.</p>',
      'google',
      JSON.stringify(['GoogleAds', 'PMax', 'ROAS', 'Performance', 'PPC']),
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      'Unique Media Buying',
      '6 daqiqa',
      94,
      '2026-09-10T12:00:00.000Z'
    );
  }

  // Seed Article 3: Telegram Ads
  const tgArticle = db.prepare('SELECT id FROM articles WHERE slug = ?').get('telegram-ads-conversion-scaling-strategies');
  if (!tgArticle) {
    db.prepare(`
      INSERT INTO articles (slug, title, excerpt, content, category, tags, image_url, author, read_time, views, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'telegram-ads-conversion-scaling-strategies',
      'Telegram Ads rasmiy platformasida konversiyani 2 barobarga oshirish sirlari',
      'Mavzuli kanallar bo‘yicha aniq target, bot orqali lidlarni qabul qilish va CPM narxini minimal ushlab turish bo‘yicha amaliy tajriba.',
      '<p class="lead-paragraph">Telegram Ads o‘zbek va MDH bozorida eng toza va yuqori niyatli organik auditoriyani jalb qilish uchun eng kuchli instrumentlardan biriga aylandi.</p><h2>Targeting va Formatlar</h2><p>Telegram kanal va botlarga to‘g‘ridan-to‘g‘ri trafik yo‘naltirish orqali CPA narxini minimal darajada ushlab turish mumkin.</p>',
      'telegram',
      JSON.stringify(['TelegramAds', 'Target', 'Lidlar', 'Marketing']),
      'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=800&q=80',
      'Unique Media Buying',
      '5 daqiqa',
      112,
      '2026-09-05T15:00:00.000Z'
    );
  }

  // Seed Article 4: Ban prevention
  const banArticle = db.prepare('SELECT id FROM articles WHERE slug = ?').get('facebook-ads-ban-prevention-antidetect-guide');
  if (!banArticle) {
    db.prepare(`
      INSERT INTO articles (slug, title, excerpt, content, category, tags, image_url, author, read_time, views, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'facebook-ads-ban-prevention-antidetect-guide',
      'Facebook va Instagram\'da cheklovlarsiz ishlash: 2026-yilgi trust va anti-detect strategiyasi',
      'Rezident proksilar, brauzer profillari va Business Manager strukturasini xavfsiz sozlash bo‘yicha qo‘llanma.',
      '<p class="lead-paragraph">Meta algoritmlarining 2026-yildagi so‘nggi yangilanishlarida bitta qurilma yoki proksidagi shubhali harakat zanjir bo‘ylab barcha bog‘langan hisoblarni bloklashi mumkin.</p><h2>Qanday himoyalanish kerak?</h2><p>1. Har bir profil uchun alohida toza rezident proksi.<br>2. Fingerprint va WebRTC izolatsiyasi.<br>3. Ikki bosqichli 2FA xavfsizlik.</p>',
      'facebook',
      JSON.stringify(['Facebook', 'AntiDetect', 'Proksi', 'Arbitraj', 'Xavfsizlik']),
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      'Unique Media Buying',
      '8 daqiqa',
      147,
      '2026-08-28T10:00:00.000Z'
    );
  }
}

ensureSeedArticles();

module.exports = { db, hashPassword, ensureDefaultAdmin, ensureSeedArticles };
