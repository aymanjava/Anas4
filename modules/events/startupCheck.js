module.exports.config = {
  name: "startupCheck",
  eventType: ["onLoad"], // أفضل استخدام onLoad للتشغيل عند انطلاق البوت
  version: "1.1.0",
  credits: "Ayman",
  description: "فحص النظام تلقائياً عند التشغيل وإرسال تقرير للمطور"
};

module.exports.onLoad = async function ({ api }) {
  try {
    const { commands, events } = global.client;
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY");
    
    const developerID = "61577861540407"; // معرف أيمن

    // إعداد التقرير
    let report = `🌸 ◈ ───『 Startup Report 』─── ◈ 🌸\n\n`;
    report += `✨ هـبة الآن قيد التشغيل\n`;
    report += `━━━━━━━━━━━━━━━━━━\n\n`;

    // فحص الأوامر الأساسية
    const essentials = ["رندر", "هبة", "الاوامر"];
    let cmdStatus = essentials.map(cmd => commands.has(cmd) ? `✅ ${cmd}` : `❌ ${cmd}`).join(" | ");

    // فحص الفعاليات الحرجة
    const criticalEvents = ["antiout", "autoReactButterfly"];
    let eventStatus = criticalEvents.map(ev => events.has(ev) ? `✅ ${ev}` : `⚠️ ${ev}`).join(" | ");

    report += `🛠️ الأوامر الأساسية: ${cmdStatus}\n`;
    report += `🎭 الفعاليات الحرجة: ${eventStatus}\n`;
    report += `🔢 إجمالي الأوامر: ${commands.size}\n`;
    report += `🔢 إجمالي الفعاليات: ${events.size}\n`;
    report += `⏰ التوقيت: ${time}\n\n`;
    report += `📡 الأنظمة تعمل بثبات وجاهزة للاستعمال!`;

    // إرسال التقرير
    api.sendMessage(report, developerID, (err) => {
      if (err) console.log("⚠️ فشل إرسال تقرير التشغيل للمطور.");
      else console.log("✅ تم إرسال تقرير التشغيل إلى أيمن بنجاح.");
    });
  } catch (e) {
    console.error("⚠️ خطأ أثناء تشغيل Startup Check:", e);
  }
};

module.exports.run = async function({}) {};
