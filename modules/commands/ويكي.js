module.exports.config = {
  name: "ويكي",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "Ayman",
  description: "البحث عن المعلومات في ويكيبيديا (الموسوعة الحرة)",
  commandCategory: "الذكاء",
  usages: "[نص البحث] أو [en نص البحث]",
  cooldowns: 1,
  dependencies: {
    "wikijs": ""
  }
};

module.exports.languages = {
  "ar": {
    "missingInput": "◯ يرجى كتابة ما تريد البحث عنه!",
    "returnNotFound": "❌ لم أتمكن من العثور على معلومات حول: %1",
    "searching": "◈ جاري البحث في الموسوعة... [ ⏳ ]"
  },
  "en": {
    "missingInput": "◯ Please enter what you need to search for.",
    "returnNotFound": "❌ Can't find: %1",
    "searching": "◈ Searching in Wikipedia... [ ⏳ ]"
  }
};

module.exports.run = async ({ event, args, api, getText }) => {
  // التدقيق: استدعاء المكتبة بشكل يضمن عملها حتى لو كانت النسخة قديمة أو حديثة
  const wiki = require("wikijs").default; 
  const { threadID, messageID } = event;

  let content = args.join(" ");
  let url = 'https://ar.wikipedia.org/w/api.php'; 

  if (args[0] == "en") {
    url = 'https://en.wikipedia.org/w/api.php';
    content = args.slice(1).join(" ");
  }

  if (!content) return api.sendMessage(getText("missingInput"), threadID, messageID);

  api.sendMessage(getText("searching"), threadID, async (err, info) => {
    try {
      const page = await wiki({ apiUrl: url }).page(content);
      const summary = await page.summary();
      
      // التدقيق: منع تعليق البوت إذا كان النص ضخماً جداً
      const finalMsg = summary.length > 1200 ? summary.slice(0, 1200) + "..." : summary;

      let msg = `◈ ───『 الـموسوعة 』─── ◈\n\n`;
      msg += `${finalMsg}\n\n`;
      msg += `🔗 الرابط المباشر:\n${page.raw.fullurl}\n`;
      msg += `◈ ─────────────── ◈`;

      return api.sendMessage(msg, threadID, () => {
          if(info && info.messageID) api.unsendMessage(info.messageID);
      }, messageID);
    } catch (e) {
      return api.sendMessage(getText("returnNotFound", content), threadID, messageID);
    }
  }, messageID);
};
