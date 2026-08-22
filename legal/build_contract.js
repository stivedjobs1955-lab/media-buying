const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign,
} = require('docx');
const fs = require('fs');

const FONT = 'Times New Roman';
const PAGE = { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1701, right: 850 } };

function h(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, bold: true, font: FONT, size: 24 })],
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 300 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: FONT, size: 22, bold: !!opts.bold, italics: !!opts.italics })],
  });
}
function title(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text, bold: true, font: FONT, size: 28 })],
  });
}

const dateLine = new Paragraph({
  spacing: { after: 300 },
  children: [
    new TextRun({ text: '«____» ______________ 20____ y.', font: FONT, size: 22 }),
    new TextRun({ text: '\t\t\t\t\t\t', font: FONT, size: 22 }),
    new TextRun({ text: 'Toshkent shahri', font: FONT, size: 22 }),
  ],
});

const noticeBox = new Paragraph({
  spacing: { before: 300, after: 200 },
  border: { top: { style: BorderStyle.SINGLE, size: 6, color: '999999' }, bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999' }, left: { style: BorderStyle.SINGLE, size: 6, color: '999999' }, right: { style: BorderStyle.SINGLE, size: 6, color: '999999' } },
  children: [new TextRun({
    text: "MUHIM ESLATMA: Ushbu hujjat AI yordamida tayyorlangan andoza (shablon) bo'lib, O'zbekiston Respublikasi Fuqarolik Kodeksining umumiy qoidalariga (jumladan 369, 370, 382, 703-moddalariga) tayanadi. Imzolashdan oldin, ayniqsa aniq raqamli shartlar (foizlar, muddatlar, STIR/hisob raqamlari) va joriy qonunchilikka muvofiqligini litsenziyalangan yurist bilan ko'rib chiqish tavsiya etiladi.",
    italics: true, font: FONT, size: 18, color: '555555',
  })],
});

function sigCell(text, opts = {}) {
  return new TableCell({
    width: { size: 4500, type: WidthType.DXA },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    verticalAlign: VerticalAlign.TOP,
    children: [new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text, font: FONT, size: 21, bold: !!opts.bold })] })],
  });
}

function sigRow(leftText, rightText, opts = {}) {
  return new TableRow({ children: [sigCell(leftText, opts), sigCell(rightText, opts)] });
}

const sigTable = new Table({
  width: { size: 9000, type: WidthType.DXA },
  columnWidths: [4500, 4500],
  rows: [
    sigRow('IJROCHI:', 'BUYURTMACHI:', { bold: true }),
    sigRow('"The Unique" media-baying agentligi', '_________________________________'),
    sigRow('Asoschi: Ramazonov Otabek', 'Rahbar/vakil: _____________________'),
    sigRow('Telegram: @otabek_insights', 'Telefon: __________________________'),
    sigRow('Telefon: +998 77 531 08 08', 'Manzil: ___________________________'),
    sigRow('STIR: ____________________________', 'STIR: _____________________________'),
    sigRow('H/r: _____________________________', 'H/r: ______________________________'),
    sigRow(' ', ' '),
    sigRow('_______________ / Ramazonov O. /', '_______________ / _______________ /'),
    sigRow('(imzo, muhr o\'rni)', '(imzo, muhr o\'rni)'),
  ],
});

const doc = new Document({
  sections: [{
    properties: { page: PAGE },
    children: [
      title('MEDIA-BAYING XIZMATLARINI KO\'RSATISH TO\'G\'RISIDA\nSHARTNOMA № ____'),
      dateLine,

      p('"The Unique" media-baying agentligi nomidan, asoschi Ramazonov Otabek (keyingi o\'rinlarda — "Ijrochi") bir tomondan, va ____________________________ nomidan ____________________________ asosida ish yurituvchi ____________________________ (keyingi o\'rinlarda — "Buyurtmachi") ikkinchi tomondan, birgalikda "Tomonlar" deb ataluvchi, quyidagilar to\'g\'risida ushbu shartnomani (keyingi o\'rinlarda — "Shartnoma") tuzdilar:'),

      h('1. SHARTNOMA PREDMETI'),
      p('1.1. Ijrochi Buyurtmachiga O\'zbekiston Respublikasi Fuqarolik Kodeksining 703-moddasi va pullik xizmat ko\'rsatishga oid boshqa tegishli normalariga muvofiq media-baying xizmatlarini (Meta Ads, Google Ads, Yandex Direct, Telegram Ads platformalarida reklama kampaniyalarini sozlash, boshqarish va tahlil qilish) ko\'rsatadi, Buyurtmachi esa ko\'rsatilgan xizmat uchun haq to\'lash majburiyatini oladi.'),
      p('1.2. Xizmatning aniq ko\'lami, muddati va kelishilgan natija ko\'rsatkichlari (KPI) ushbu Shartnomaning 1-ilovasida (Texnik topshiriq) belgilanadi, u Shartnomaning ajralmas qismi hisoblanadi.'),

      h('2. SHARTNOMA SUMMASI VA TO\'LOV TARTIBI'),
      p('2.1. Shartnoma summasi (Ijrochining xizmat haqi, reklama byudjetisiz): ____________________________ so\'m.'),
      p('2.2. To\'lov tartibi: oldindan to\'lov (avans) — Shartnoma summasining ______ % (kamida 50 foiz) miqdorida, Shartnoma imzolangan kundan boshlab ______ kalendar kuni ichida; qolgan qism — xizmat ko\'rsatib bo\'lingandan yoki Tomonlar kelishgan bosqich yakunlangandan so\'ng ______ kalendar kuni ichida to\'lanadi.'),
      p('2.3. Reklama byudjeti (Meta, Google, Yandex, Telegram va boshqa platformalarga to\'lanadigan mablag\') ushbu Shartnoma summasiga kirmaydi va Buyurtmachi tomonidan alohida, to\'g\'ridan-to\'g\'ri tegishli platforma hisobiga yoki Ijrochi ko\'rsatgan usulda to\'lanadi.'),

      h('3. TOMONLARNING HUQUQ VA MAJBURIYATLARI'),
      p('3.1. Ijrochi majburiyatlari: xizmatlarni professional darajada, 1-ilovada belgilangan muddatlarda ko\'rsatish; kampaniyalar monitoringini muntazam yuritish; Buyurtmachiga haftalik yoki oylik hisobot taqdim etish; Buyurtmachining tijorat sirini saqlash.'),
      p('3.2. Buyurtmachi majburiyatlari: zarur ma\'lumot, kirish huquqlari (reklama hisob yozuvlari, brend materiallari) va reklama byudjetini o\'z vaqtida taqdim etish; Shartnoma summasini 2-bo\'limda belgilangan muddatlarda to\'lash; Ijrochining mahsulot sifati, sotuv sahifasi yoki narx siyosati bo\'yicha professional tavsiyalarini ko\'rib chiqish.'),

      h('4. NATIJA, SIFAT VA QISMAN QAYTARISH SHARTLARI'),
      p('4.1. Ijrochi 1-ilovada kelishilgan target ko\'rsatkichlarga (masalan, CPL, ROAS, konversiya darajasi) erishish yuzasidan zarur professional harakatlarni sidqidildan amalga oshirishga majburiy bo\'lib, biroq reklama platformalari algoritmlari, bozor sharoiti, Buyurtmachi mahsuloti yoki xizmati sifati, narxi va boshqa Ijrochiga bog\'liq bo\'lmagan omillarga bog\'liq bo\'lgan yakuniy tijorat natijasi (savdo hajmi, foyda) uchun kafolat bermaydi.'),
      p('4.2. Agar Ijrochi 1-ilovada yozma ravishda aniq kelishilgan minimal ko\'rsatkichlarni o\'z aybi bilan (masalan, kampaniyani ishga tushirmaslik, texnik topshiriqqa mos kelmaslik, monitoringni amalga oshirmaslik) bajarmasa, Buyurtmachi ko\'rsatilmagan yoki lozim darajada bajarilmagan xizmat qismiga to\'g\'ri keladigan xizmat haqini qisman qaytarishni talab qilishga haqli.'),
      p('4.3. Qaytariladigan summa faqat Ijrochining xizmat haqi qismiga tegishli bo\'lib, allaqachon reklama platformalariga sarflangan yoki band qilingan reklama byudjeti ushbu qoida doirasiga kirmaydi va qaytarilmaydi.'),
      p('4.4. Qisman qaytarish miqdori va tartibi Tomonlar o\'rtasida 10 (o\'n) ish kuni ichida ikki tomonlama dalolatnoma asosida kelishiladi. Kelishuvga erishilmagan taqdirda nizo ushbu Shartnomaning 7-bo\'limiga muvofiq hal etiladi. Ushbu bo\'lim FK 382-moddasi 2-qismi 1-bandiga muvofiq qo\'llaniladi.'),

      h('5. JAVOBGARLIK VA FORS-MAJOR'),
      p('5.1. Tomonlar ushbu Shartnoma bo\'yicha majburiyatlarni bajarmaganlik yoki lozim darajada bajarmaganlik uchun O\'zbekiston Respublikasining amaldagi qonunchiligiga muvofiq javobgar bo\'ladilar.'),
      p('5.2. Ijrochi uchinchi tomon reklama platformalarining hisob yozuvini bloklashi, siyosati yoki narxlarining o\'zgarishi, shuningdek Buyurtmachining o\'zi taqdim etgan noto\'g\'ri yoki to\'liq bo\'lmagan ma\'lumotlar natijasida yuzaga kelgan holatlar uchun javobgar emas.'),
      p('5.3. Fors-major holatlari yuzaga kelganda Tomonlar bu holatlar davom etgan muddat davomida majburiyatlarni bajarmaganlik uchun javobgarlikdan ozod etiladi.'),

      h('6. MAXFIYLIK'),
      p('6.1. Tomonlar bir-biridan olingan tijorat, moliyaviy va boshqa maxfiy ma\'lumotlarni uchinchi shaxslarga oshkor qilmaslikka majburdirlar. Ijrochi Buyurtmachining shaxsga doir ma\'lumotlarini "Shaxsga doir ma\'lumotlar to\'g\'risida"gi Qonunga muvofiq qayta ishlaydi.'),

      h('7. SHARTNOMANI BEKOR QILISH TARTIBI'),
      p('7.1. Shartnoma Tomonlarning o\'zaro yozma kelishuvi asosida istalgan vaqtda bekor qilinishi mumkin.'),
      p('7.2. Buyurtmachi Shartnomani bir tomonlama bekor qilishga haqli, biroq bu holda Ijrochi tomonidan bekor qilish kunigacha bajarilgan ish hajmiga to\'g\'ri keladigan xizmat haqi hamda sarflangan yoki band qilingan reklama byudjeti qaytarilmaydi.'),
      p('7.3. Ijrochi Buyurtmachi tomonidan to\'lov muddati 10 (o\'n) kundan ortiq kechiktirilgan taqdirda Shartnomani bir tomonlama bekor qilish yoki xizmat ko\'rsatishni to\'xtatib turish huquqiga ega.'),

      h('8. NIZOLARNI HAL QILISH VA YAKUNIY QOIDALAR'),
      p('8.1. Ushbu Shartnoma yuzasidan kelib chiqadigan barcha nizolar avvalo muzokaralar yo\'li bilan, kelishuvga erishilmagan taqdirda O\'zbekiston Respublikasining amaldagi qonunchiligiga muvofiq tegishli sud tartibida hal qilinadi.'),
      p('8.2. Shartnoma imzolangan kundan e\'tiboroan kuchga kiradi va Tomonlar o\'z majburiyatlarini to\'liq bajargunga qadar amal qiladi.'),
      p('8.3. Shartnoma ikki nusxada, har bir Tomon uchun bittadan, teng yuridik kuchga ega qilib tuzildi.'),

      h('9. TOMONLARNING MANZIL VA REKVIZITLARI'),
      sigTable,

      noticeBox,
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(__dirname + '/Xizmat_shartnomasi_Unique.docx', buf);
  console.log('written');
});
