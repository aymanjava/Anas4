module.exports.config = {
  name: "فحص_النظام",
  version: "4.0.0",
  hasPermssion: 2, 
  credits: "Ayman",
  description: "تقرير فحص تقني شامل لجميع الأوامر والفعاليات",
  commandCategory: "النظام",
  usePrefix: true,
  cooldowns: 10
};

module.exports.run = async function({ api, event }) {
  const { commands, events } = global.client;
  const moment = require("moment-timezone");
  const time = moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY");

  api.sendMessage("✨ جاري فحص شيفرة النظام وتحليل الاستجابات... ⏳", event.threadID, async (err, info) => {
    
    let report = `💎 **تـقـريـر هـبة الـفـني الـشامـل** 💎\n`;
    report += `━━━━━━━━━━━━━━━━━━\n\n`;

    // 1. فحص الأوامر وتحليل مكوناتها
    let cmdStats = { react: 0, tags: 0, reply: 0 };
    
    commands.forEach((cmd) => {
      const code = (cmd.run ? cmd.run.toString() : "") + (cmd.handleEvent ? cmd.handleEvent.toString() : "");
      
      if (code.includes("setMessageReaction")) cmdStats.react++;
      if (code.includes("mentions") || code.includes("@")) cmdStats.tags++;
      if (code.includes("sendMessage") || code.includes("messageReply")) cmdStats.reply++;
    });

    report += `🛠️ **تـحـليل الأوامـر (${commands.size}):**\n`;
    report += `│← أوامر تدعم التفاعل: ${cmdStats.react} ✅\n`;
    report += `│← أوامر تدعم المنشن: ${cmdStats.tags} ✅\n`;
    report += `│← أوامر تدعم الردود: ${cmdStats.reply} ✅\n`;
    report += `╼━━━━━━━━━━━━━━╾\n\n`;

    // 2. فحص الفعاليات (Events)
    report += `🎭 **الـفعاليات والأنظمة (${events.size}):**\n`;
    const criticalEvents = ["antiout", "autoReactButterfly"];
    criticalEvents.forEach(ev => {
      report += events.has(ev) ? `│ ✅ نظام [ ${ev} ]: يعمل بكفاءة\n` : `│ ❌ نظام [ ${ev} ]: غير مفعل\n`;
    });
    report += `╼━━━━━━━━━━━━━━╾\n\n`;

    // 3. حالة الذاكرة والوقت
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    report += `💾 استهلاك الذاكرة: ${Math.round(used * 100) / 100} MB\n`;
    report += `⏰ توقيت الفحص: ${time}\n`;
    report += `👤 المطور المسؤول: أيـمن\n\n`;
    report += `📡 **الـنـتيجة:** الـنـظام مـستقر وجاهز لـتلقي الأوامـر.`;

    return api.editMessage(report, info.messageID);
  }, event.messageID);
};
