const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle,
} = require('docx');
const fs = require('fs');

const FONT = 'Times New Roman';
const PAGE = { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1701, right: 850 } }; // A4, DXA

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
    spacing: { after: 300 },
    children: [new TextRun({ text, bold: true, font: FONT, size: 30 })],
  });
}
function sub(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [new TextRun({ text, font: FONT, size: 22, italics: true })],
  });
}

const noticeBox = new Paragraph({
  spacing: { before: 300, after: 200 },
  border: { top: { style: BorderStyle.SINGLE, size: 6, color: '999999' }, bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999' }, left: { style: BorderStyle.SINGLE, size: 6, color: '999999' }, right: { style: BorderStyle.SINGLE, size: 6, color: '999999' } },
  children: [new TextRun({
    text: "MUHIM ESLATMA: Ushbu hujjat AI yordamida tayyorlangan andoza (shablon) bo'lib, O'zbekiston Respublikasi Fuqarolik Kodeksining umumiy qoidalariga (jumladan 369, 370, 382, 703-moddalariga) tayanadi. Amaliyotda qo'llashdan oldin, ayniqsa aniq raqamli shartlar (foizlar, muddatlar, STIR/hisob raqamlari) va joriy qonunchilikka muvofiqligini litsenziyalangan yurist bilan ko'rib chiqish tavsiya etiladi.",
    italics: true, font: FONT, size: 18, color: '555555',
  })],
});

const doc = new Document({
  sections: [{
    properties: { page: PAGE },
    children: [
      title(`"THE UNIQUE" MEDIA-BAYING AGENTLIGINING\nXIZMAT KO'RSATISH BO'YICHA OMMAVIY OFERTASI`),
      sub('(Ommaviy taklif — O\'zbekiston Respublikasi Fuqarolik Kodeksining 369, 370-moddalariga muvofiq)'),

      p('Ushbu hujjat O\'zbekiston Respublikasi Fuqarolik Kodeksining 369 va 370-moddalariga muvofiq "The Unique" media-baying agentligi (asoschisi — Ramazonov Otabek, keyingi o\'rinlarda — "Ijrochi") tomonidan noaniq doiradagi shaxslarga qaratilgan rasmiy taklif (ommaviy oferta) hisoblanadi. Ushbu ofertada ko\'rsatilgan shartlarni to\'liq va so\'zsiz qabul qilgan (aksept etgan) har qanday jismoniy yoki yuridik shaxs (keyingi o\'rinlarda — "Buyurtmachi") Ijrochi bilan quyida belgilangan shartlarda shartnoma tuzgan tomon hisoblanadi.'),

      h('1. UMUMIY QOIDALAR'),
      p('1.1. Ushbu Ommaviy oferta (keyingi o\'rinlarda — "Oferta") Ijrochining media-baying va targetli reklama xizmatlarini ko\'rsatish shartlarini belgilaydi.'),
      p('1.2. Oferta aksepti quyidagi harakatlardan biri orqali amalga oshiriladi: (a) Ijrochi taqdim etgan hisob-fakturaga (invoysga) asosan to\'lovni amalga oshirish; (b) tomonlar tomonidan alohida xizmat ko\'rsatish shartnomasiga imzo chekish; (v) Ijrochiga texnik topshiriqni yozma shaklda (shu jumladan elektron pochta yoki messenjer orqali) tasdiqlash.'),
      p('1.3. Oferta aksept etilgan kundan boshlab Tomonlar o\'rtasida ushbu hujjatda belgilangan shartlarda shartnoma tuzilgan hisoblanadi (FK 370-modda).'),

      h('2. OFERTA PREDMETI'),
      p('2.1. Ijrochi Buyurtmachiga quyidagi xizmat turlaridan bir yoki bir nechtasini ko\'rsatadi: Meta Ads (Instagram/Facebook), Google Ads, Yandex Direct, Telegram Ads platformalarida reklama kampaniyalarini sozlash va boshqarish, target auditoriyani belgilash, reklama byudjetini taqsimlash hamda natijalarni tahlil qilish (performance marketing).'),
      p('2.2. Xizmatning aniq ko\'lami, muddati, narxi va kelishilgan natija ko\'rsatkichlari (KPI — masalan CPL, ROAS, konversiya darajasi) har bir Buyurtmachi uchun alohida Texnik topshiriqda yoki Shartnoma ilovasida (Ilova №1) yozma ravishda kelishiladi.'),
      p('2.3. Ijrochi uchinchi tomon reklama platformalari (Meta, Google, Yandex, Telegram va boshqalar)ning agenti yoki vakili emas — u ushbu platformalarda Buyurtmachi nomidan yoki o\'zining professional hisob yozuvlari orqali reklama joylashtirish bo\'yicha xizmat ko\'rsatuvchi mustaqil ijrochi (pudratchi) hisoblanadi.'),

      h('3. XIZMAT NARXI VA TO\'LOV TARTIBI'),
      p('3.1. Xizmat narxi (Ijrochining xizmat haqi) Ilova №1da yoki tomonlar kelishuviga ko\'ra invoysda belgilanadi va reklama platformalariga to\'lanadigan reklama byudjetini o\'z ichiga olmaydi — reklama byudjeti alohida, Buyurtmachi tomonidan yoki uning topshirig\'iga ko\'ra to\'g\'ridan-to\'g\'ri tegishli platformaga to\'lanadi.'),
      p('3.2. Ijrochi xizmat ko\'rsatishni boshlashdan oldin xizmat haqining kamida 50 (ellik) foizi miqdorida oldindan to\'lov (avans) talab qilishga haqli. Qolgan qism ishlar yakunlangach yoki Tomonlar kelishgan bosqichlarda to\'lanadi.'),
      p('3.3. To\'lovlar Ijrochining bank hisob raqamiga yoki Tomonlar kelishgan boshqa naqd bo\'lmagan usulda amalga oshiriladi.'),

      h('4. NATIJA, SIFAT VA QISMAN QAYTARISH SHARTLARI'),
      p('4.1. Ijrochi kelishilgan target ko\'rsatkichlarga (masalan, CPL, ROAS, konversiya darajasi) erishish yuzasidan zarur professional harakatlarni sidqidildan amalga oshirishga majburiy bo\'lib, biroq reklama platformalari algoritmlari, bozor sharoiti, Buyurtmachining mahsulot yoki xizmati sifati, narxi va boshqa Ijrochiga bog\'liq bo\'lmagan omillarga bog\'liq bo\'lgan yakuniy tijorat natijasi (savdo hajmi, foyda) uchun kafolat bermaydi.'),
      p('4.2. Agar Ijrochi Ilova №1da yozma ravishda aniq kelishilgan minimal ko\'rsatkichlarni o\'z aybi bilan (masalan, kampaniyani ishga tushirmaslik, texnik topshiriqqa mos kelmaslik, monitoringni amalga oshirmaslik) bajarmasa, Buyurtmachi ko\'rsatilmagan yoki lozim darajada bajarilmagan xizmat qismiga to\'g\'ri keladigan Ijrochi xizmat haqini qisman qaytarishni talab qilishga haqli.'),
      p('4.3. Qaytariladigan summa faqat Ijrochining xizmat haqi qismiga tegishli bo\'lib, allaqachon reklama platformalariga sarflangan yoki band qilingan reklama byudjeti (masalan, Meta, Google hisob yozuvlariga o\'tkazilgan mablag\') ushbu qoida doirasiga kirmaydi va qaytarilmaydi, chunki bu mablag\' uchinchi tomon platformalari tomonidan sarflab bo\'lingan hisoblanadi.'),
      p('4.4. Qisman qaytarish miqdori va tartibi Tomonlar o\'rtasida 10 (o\'n) ish kuni ichida muzokaralar yo\'li bilan kelishiladi. Kelishuvga erishilmagan taqdirda nizo ushbu Ofertaning 8-bo\'limiga muvofiq hal etiladi.'),
      p('4.5. Ushbu bo\'lim Fuqarolik Kodeksining 382-moddasi 2-qismi 1-bandiga (Tomonlardan biri tomonidan shartnoma shartlarining sezilarli darajada buzilishi natijasida ikkinchi Tomon amalda shartnoma tuzishda ko\'zlagan natijadan mahrum bo\'lishi) hamda pullik xizmat ko\'rsatish shartnomasiga oid boshqa tegishli normalarga muvofiq qo\'llaniladi.'),

      h('5. TOMONLARNING HUQUQ VA MAJBURIYATLARI'),
      p('5.1. Ijrochi majburiyatlari: xizmatlarni professional darajada, belgilangan muddatlarda ko\'rsatish; kampaniyalar monitoringini muntazam yuritish; Buyurtmachiga davriy hisobot taqdim etish; Buyurtmachining tijorat sirini saqlash.'),
      p('5.2. Buyurtmachi majburiyatlari: zarur ma\'lumot, kirish huquqlari (reklama hisob yozuvlari, brend materiallari) va reklama byudjetini o\'z vaqtida taqdim etish; xizmat haqini belgilangan muddatlarda to\'lash; Ijrochining mahsulot sifati, sotuv sahifasi (landing) yoki narx siyosati bo\'yicha professional tavsiyalarini ko\'rib chiqish.'),

      h('6. JAVOBGARLIK VA JAVOBGARLIKDAN OZOD QILISH'),
      p('6.1. Tomonlar ushbu Oferta bo\'yicha majburiyatlarni bajarmaganlik yoki lozim darajada bajarmaganlik uchun O\'zbekiston Respublikasining amaldagi qonunchiligiga muvofiq javobgar bo\'ladilar.'),
      p('6.2. Ijrochi quyidagi holatlar uchun javobgar emas: uchinchi tomon platformalari (Meta, Google, Yandex, Telegram va h.k.) tomonidan reklama hisob yozuvini bloklash yoki cheklash, ularning siyosati yoki narxlarining o\'zgarishi, texnik nosozliklar; Buyurtmachining o\'zi taqdim etgan noto\'g\'ri yoki to\'liq bo\'lmagan ma\'lumotlar; Buyurtmachi mahsuloti yoki xizmatining sifati, narxi yoki bozordagi obro\'siga bog\'liq yakuniy tijorat natijalari.'),
      p('6.3. Fors-major holatlari (tabiiy ofatlar, urush harakatlari, favqulodda holat, davlat organlarining internet yoki reklama platformalari faoliyatiga cheklov qo\'yish qarorlari va boshqa oldindan bilib va oldini olib bo\'lmaydigan holatlar) yuzaga kelganda, Tomonlar ushbu holatlar davom etgan muddat davomida majburiyatlarni bajarmaganlik uchun javobgarlikdan ozod etiladi.'),

      h('7. MAXFIYLIK VA SHAXSIY MA\'LUMOTLAR'),
      p('7.1. Tomonlar bir-biridan olingan tijorat, moliyaviy va boshqa maxfiy ma\'lumotlarni uchinchi shaxslarga oshkor qilmaslikka majburdirlar.'),
      p('7.2. Ijrochi Buyurtmachidan olingan shaxsga doir ma\'lumotlarni (ism, telefon raqami va boshqalar) faqat xizmat ko\'rsatish maqsadida, "Shaxsga doir ma\'lumotlar to\'g\'risida"gi O\'zbekiston Respublikasi Qonuniga muvofiq qayta ishlaydi va saqlaydi.'),

      h('8. NIZOLARNI HAL QILISH'),
      p('8.1. Ushbu Oferta yuzasidan kelib chiqadigan barcha nizo va kelishmovchiliklar avvalo muzokaralar yo\'li bilan, kelishuvga erishilmagan taqdirda esa O\'zbekiston Respublikasining amaldagi qonunchiligiga muvofiq tegishli sud tartibida hal qilinadi.'),

      h('9. AMAL QILISH MUDDATI VA O\'ZGARTIRISH TARTIBI'),
      p('9.1. Oferta cheklanmagan muddatga amal qiladi. Ijrochi Oferta shartlarini bir tomonlama o\'zgartirish yoki bekor qilish huquqiga ega, biroq bu allaqachon aksept etilgan va bajarilayotgan shartnomalar shartlariga ta\'sir etmaydi.'),
      p('9.2. Oferta matnining joriy tahriri Ijrochining rasmiy veb-sayti va/yoki Telegram kanalida e\'lon qilinadi.'),

      h('10. IJROCHINING REKVIZITLARI'),
      p('"The Unique" media-baying agentligi', { align: AlignmentType.LEFT }),
      p('Asoschi: Ramazonov Otabek', { align: AlignmentType.LEFT }),
      p('Telegram: @otabek_insights', { align: AlignmentType.LEFT }),
      p('Telefon: +998 77 531 08 08', { align: AlignmentType.LEFT }),
      p('STIR / Hisob raqami / Yuridik manzil: ____________________________ (to\'ldirilishi kerak)', { align: AlignmentType.LEFT }),

      noticeBox,
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(__dirname + '/Ommaviy_oferta_Unique.docx', buf);
  console.log('written');
});
