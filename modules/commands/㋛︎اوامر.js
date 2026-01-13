module.exports.config = {
  name: "الاوامر",
  version: "20.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "ديوان الأوامر الرسمي لإمبراطورية هبة",
  commandCategory: "النظام",
  usages: "[اسم الأمر]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const { commands } = global.client;
  const prefix = global.config.PREFIX;

  // --- حصرياً: الفئات السيادية المعتمدة ---
  const validCategories = ["المطور", "النظام", "خدمات", "صور", "العاب"];

  if (!args[0]) {
    let msg = `◈ ───『 ديـوان هـبـة الـمـلكي 』─── ◈\n\n`;
    const categories = {};

    // تصنيف الأوامر وتغيير الفئات الزائدة تلقائياً
    commands.forEach((cmd, name) => {
      let category = cmd.config.commandCategory || "خدمات";
      
      // إذا كانت الفئة غير معتمدة، يتم تحويلها للأقرب
      if (!validCategories.includes(category)) {
        if (category.includes("ادمن") || category.includes("تعديل")) category = "المطور";
        else if (category.includes("ترفيه") || category.includes("تسلية")) category = "العاب";
        else if (category.includes("معلومات")) category = "النظام";
        else category = "خدمات"; // الافتراضي
      }

      if (!categories[category]) categories[category] = [];
      categories[category].push(name);
    });

    for (const cat in categories) {
      msg += `📜 【 ${cat} 】\n`;
      msg += `← ${categories[cat].join(", ")}\n\n`;
    }

    msg += `————————————————\n`;
    msg += `💡 اكـتـب [ ${prefix}الاوامر + اسم الامر ] لـلتـفاصيـل.\n`;
    msg += `👑 الـسلطة الـمطلـقة: الـتـوب ايـمـن\n`;
    msg += `◈ ──────────────── ◈`;

    return api.sendMessage(msg, threadID, messageID);
  }

  // --- تفاصيل أمر محدد ---
  const command = commands.get(args[0].toLowerCase());
  if (!command) return api.sendMessage("⚠️ هذا الأمر غير موجود في أرشيفنا الملكي.", threadID, messageID);

  const { name, description, usages, cooldowns } = command.config;
  let detailMsg = `◈ ───『 وثـيـقـة الأمـر 』─── ◈\n\n` +
                  `🔹 الاسـم: ${name}\n` +
                  `📝 الـوصـف: ${description}\n` +
                  `🛠️ الاسـتـخدام: ${prefix}${name} ${usages}\n` +
                  `⏳ الانتظار: ${cooldowns} ثانية\n\n` +
                  `◈ ──────────────── ◈`;

  return api.sendMessage(detailMsg, threadID, messageID);
};
