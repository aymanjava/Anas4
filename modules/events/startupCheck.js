module.exports.config = {
  name: "startupCheck",
  eventType: ["log:subscribe"], // سيعمل عند الإقلاع أيضاً عبر onLoad
  version: "1.0.0",
  credits: "Ayman",
  description: "فحص النظام تلقائياً عند التشغيل وإرسال تقرير للمطور"
};

module.exports.onLoad = async function ({ api }) {
  const { commands, events } = global.client;
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY");
  
  // الـ ID الخاص بك (أيمن) لكي تصلك الرسالة
  const developerID = "61577861540407"; 

  let report = `🌸 **صـباح الـخير سيدي أيـمن** 🌸\n`;
  report += `✨ **هـبة الآن قيد التشغيل**\n`;
  report += `━━━━━━━━━━━━━━━━━━\n\n`;
  
  // فحص سريع للأوامر الأساسية
  const essentials = ["رندر", "هبة", "الاوامر"];
  let cmdStatus = "";
  essentials.forEach(cmd => {
    cmdStatus += commands.has(cmd) ? `✅ ${cmd} | ` : `❌ ${cmd} | `;
  });

  // فحص الفعاليات الحساسة
  const eventStatus = (events.has("antiout") && events.has("autoReactButterfly")) ? "آمنة ✅" : "تحتاج فحص ⚠️";

  report += `🛠️ الأوامر الأساسية: ${cmdStatus}\n`;
  report += `🎭 حالة الفعاليات: ${eventStatus}\n`;
  report += `🔢 إجمالي الأوامر: ${commands.size}\n`;
  report += `🔢 إجمالي الفعاليات: ${events.size}\n`;
  report += `⏰ التوقيت: ${time}\n\n`;
  report += `📡 جـميع الأنظمة تـعمل بـثبات.. جـاهزة لخدمتك!`;

  // إرسال التقرير للمطور في الخاص عند بدء التشغيل
  api.sendMessage(report, developerID, (err) => {
    if (err) console.log("⚠️ تم تشغيل البوت، لكن لم أستطع إرسال رسالة التقرير للمطور.");
    else console.log("✅ تم إرسال تقرير التشغيل إلى أيمن بنجاح.");
  });
};

module.exports.run = async function({}) {};
