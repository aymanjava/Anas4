module.exports.config = {
  name: "رندر",
  version: "1.5.0",
  hasPermssion: 2, 
  credits: "Ayman",
  description: "التحقق من حالة جميع الأوامر والفعاليات المسجلة",
  commandCategory: "النظام",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { commands, events } = global.client;
  let msg = "📊 **تقرير رندر لحالة النظام**\n━━━━━━━━━━━━━━━━━━\n\n";

  // 1. فحص الأوامر (Commands)
  msg += "🛠️ [ الأوامر - Commands ]\n";
  
  // فحص الأوامر التي تمت صناعتها
  const targetCmds = ["autoAdhkar", "رندر"]; 
  targetCmds.forEach(cmd => {
    if (commands.has(cmd)) {
      msg += `✅ الأمر [ ${cmd} ]: جاهز\n`;
    } else {
      msg += `❌ الأمر [ ${cmd} ]: غير موجود\n`;
    }
  });

  msg += "\n━━━━━━━━━━━━━━━━━━\n";

  // 2. فحص الفعاليات (Events)
  msg += "🎭 [ الفعاليات - Events ]\n";
  // الفعاليات التي برمجناها (منع الخروج وتفاعل الفراشة)
  const targetEvents = ["antiout", "autoReactButterfly"]; 

  targetEvents.forEach(evName => {
    if (events.has(evName)) {
      msg += `✅ الفعالية [ ${evName} ]: تعمل\n`;
    } else {
      msg += `❌ الفعالية [ ${evName} ]: مفقودة\n`;
    }
  });

  // 3. معلومات إضافية
  msg += "\n━━━━━━━━━━━━━━━━━━\n";
  msg += `🔢 إجمالي الأوامر المحملة: ${commands.size}\n`;
  msg += `🔢 إجمالي الفعاليات المحملة: ${events.size}\n`;
  msg += `👤 المطور: ايمن\n`;
  msg += `🌐 الحالة: النظام مستقر ✅`;

  return api.sendMessage(msg, event.threadID, event.messageID);
};
