module.exports.config = {
  name: "dailyRemembrance",
  eventType: ["onload"], // يبدأ عند تشغيل البوت
  version: "1.0.0",
  credits: "عمر",
  description: "إرسال سجل الأيام تلقائياً لكل المجموعات كل 24 ساعة"
};

module.exports.run = async function({ api }) {
  const moment = require("moment-timezone");

  const sendRemembrance = async () => {
    try {
      const now = new Date();
      const date_i = new Date("March 16, 2017 00:00:00"); 
      const date_j = new Date("December 14, 2025 00:00:00"); 

      const getDays = (d1, d2) => Math.floor((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
      const days_i = getDays(date_i, now);
      const days_j = getDays(date_j, now);

      const msg = `◈ ───『 سِـجِـل الـذكـرى الـخـاص 』─── ◈\n\n` +
                  `🕊️ [ i ] : ${days_i} يوم\n` +
                  `🕊️ [ j ] : ${days_j} يوم\n\n` +
                  `◈ ─────────────── ◈\n` +
                  `│←› نتمنى لكم يوم مليء بالذكريات الجميلة ♡\n`;

      // جلب كل المجموعات المفتوحة
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      for (const thread of threads) {
        if (thread.isGroup) {
          await api.sendMessage(msg, thread.threadID);
        }
      }

      console.log(`✅ تم إرسال سجل الأيام لجميع المجموعات: ${moment().tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY")}`);
    } catch (e) {
      console.error("⚠️ خطأ في إرسال سجل الأيام:", e.message);
    }
  };

  // إرسال مباشر عند تشغيل البوت
  await sendRemembrance();

  // ضبط المؤقت: كل 24 ساعة (86400000 ملي ثانية)
  setInterval(sendRemembrance, 24 * 60 * 60 * 1000);
};
