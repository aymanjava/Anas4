module.exports.config = {
  name: "autoUpdate",
  eventType: ["log:ready"],
  version: "1.4.0",
  credits: "Ayman",
  description: "تحديث الجلسة وإرسال توثيق مزخرف لخاص الإمبراطور كل 15 دقيقة"
};

module.exports.run = async function ({ api }) {
  const fs = require("fs-extra");
  const moment = require("moment-timezone");
  
  // 🛡️ أيدي الإمبراطور أيمن
  const EMPEROR_ID = "61577861540407"; 

  // ضبط المؤقت: كل 15 دقيقة
  const interval = 15 * 60 * 1000;

  setInterval(async () => {
    try {
      const appState = api.getAppState();
      const data = JSON.stringify(appState, null, 2);
      
      // تحديث ملف الجلسة
      fs.writeFileSync("./appstate.json", data, 'utf8');
      
      // جلب الوقت الحالي بتوقيتك (مثلاً بتوقيت مكة المكرمة/بغداد)
      const time = moment.tz("Asia/Riyadh").format("HH:mm:ss");
      const date = moment.tz("Asia/Riyadh").format("YYYY/MM/DD");

      // صياغة الرسالة بالزخرفة الملكية
      const msg = `◈ ───『 تـحـديـث تـلـقـائـي 』─── ◈\n\n` +
                  `◯ الـحـمـدلله سـيـدي.\n` +
                  `◉ تـم تـأمـيـن الـجـلـسـة بـنـجـاح.\n` +
                  `———————————————\n` +
                  `📅 الـتـاريخ: ${date}\n` +
                  `⏰ الـتـوقـيت: ${time}\n` +
                  `———————————————\n` +
                  `│←› الـنـظـام: مـسـتـقـر ✅\n` +
                  `◈ ──────────────── ◈`;

      // إرسال التوثيق لخاص الإمبراطور
      api.sendMessage(msg, EMPEROR_ID, (err) => {
          if (err) console.error("⚠️ فشل الإرسال لخاص الإمبراطور:", err);
      });

      console.log(`◈ ──『 AUTO-UPDATE 』── ◈ تم التحديث في الساعة: ${time}`);
      
    } catch (err) {
      console.error("⚠️ فشل التحديث التلقائي:", err);
    }
  }, interval);
};
