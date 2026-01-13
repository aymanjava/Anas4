module.exports.config = {
  name: "هبة",
  version: "7.0.0",
  hasPermssion: 0,
  credits: "Ayman", 
  description: "ذكاء اصطناعي (هبة) يعمل بدون بادئة ويرد بمجرد مناداته",
  commandCategory: "الذكاء الاصطناعي",
  usages: "فقط نادِ باسم (هبة)",
  cooldowns: 2,
  dependencies: {
      "axios": ""
  }
};

async function hibaAI(message) {
  const axios = require("axios");
  try {
      // استخدام محرك ذكاء اصطناعي متطور (GPT-like) لردود ذكية
      // ملاحظة: هذا الرابط يوفر ردوداً ذكية جداً باللغة العربية
      const res = await axios.get(`https://api.simsimi.vn/v1/simtalk`, {
          params: { text: message, lc: 'ar' }
      });
      let reply = res.data.message;
      return reply.replace(/سمسمي/g, "هبة").replace(/انا بوت/g, "أنا هبة ذكاء اصطناعي");
  } catch (err) {
      return "سيدي، هبة مشغولة قليلاً بتنظيف القصر، سأرد عليك لاحقاً! ✨";
  }
}

module.exports.handleEvent = async function ({ api, event, Users }) {
  const { threadID, messageID, senderID, body } = event;
  if (!body) return;

  const EMPEROR_ID = "61577861540407"; // أيدي الإمبراطور أيمن
  const input = body.toLowerCase();

  // التحقق إذا كان المستخدم ينادي "هبة" أو "هب" أو "هبتي" بدون الحاجة لنقطة أو بادئة
  if (input.includes("هبة") || input.includes("هب") || input.includes("هبه")) {
      
      api.sendTypingIndicator(threadID); // إظهار أن هبة تكتب...
      
      const response = await hibaAI(body);
      const nameUser = await Users.getNameUser(senderID);

      // تخصيص الرد للإمبراطور أيمن
      if (senderID == EMPEROR_ID) {
          return api.sendMessage(`◯ تـأمـرنـي يـا مـلكـي أيـمـن؟ 🌸\n\n${response}`, threadID, messageID);
      } else {
          return api.sendMessage(`${response} ✨`, threadID, messageID);
      }
  }
};

module.exports.run = async function ({ api, event, args }) {
  // هذا القسم سيعمل إذا كتب المستخدم ".هبة" مع أمر معين
  const { threadID, messageID } = event;
  
  if (args[0] == "من" && args[1] == "انت") {
      return api.sendMessage("◈ ───『 الـآنـسـة هـبـة 🎀 』─── ◈\n\n◯ أنـا هـبـة، ذكاء اصـطناعي مـطـور بـأوامـر مـن الإمـبـراطـور أيـمـن الـتـوب.\n◉ مـهـمـتـي خـدمـتـكـم والـترفـيـه عـنـكـم ✨.", threadID, messageID);
  }
  
  if (args[0] == "كيف" && args[1] == "نستخدم") {
      return api.sendMessage("◯ سـهـل جـداً! فـقـط نـادِ بـاسـمـي (هـبـة) فـي أي جـمـلـة وسـأرد عـلـيـك فـوراً بـدون حـاجـة لـنـقـطـة أو شـرطـة.", threadID, messageID);
  }

  return api.sendMessage("◯ نـعـم سـيـدي؟ أنـا أسـمـعـك، نـادِ بـاسـمـي فـقـط وسـأجـيـب 🌸", threadID, messageID);
};
