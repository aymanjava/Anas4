const axios = require("axios");

module.exports.config = {
  name: "اسلاميات",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "فئة شاملة (قصص، أحاديث، تفسير، سور)",
  commandCategory: "〘 اسلاميات 〙",
  usages: "[النوع] [البحث]",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const type = args[0];
  const query = args.slice(1).join(" ");

  const menu = `◈ ───『 𝑯𝑬𝑩𝑨 - قسم الاسلاميات 』─── ◈
أهلاً بك في قسم الإسلاميات 📖
يمكنك استخدام الأوامر كما يلي:

◯ حديث ⟢ جلب حديث شريف
◯ قصة ⟢ قصص أنبياء وصحابة
◯ تفسير [اسم السورة] ⟢ تفسير السورة
◯ معنى [الكلمة] ⟢ معنى الكلمة
◯ سورة [اسم السورة] ⟢ نص السورة الكريم

مثال: اسلاميات حديث
◈ ──────────────── ◈`;

  if (!type) return api.sendMessage(menu, threadID, messageID);

  try {
    // إضافة رد فعل جميل
    api.setMessageReaction("✨", messageID, () => {}, true);

    let response = "";

    switch (type) {
      case "حديث":
        {
          const res = await axios.get("https://api.ahadith.co.uk/api/hadith/random/ar");
          response = res.data.hadith.arabic || "لم أتمكن من جلب الحديث الآن.";
        }
        break;

      case "قصة":
        {
          const res = await axios.get("https://raw.githubusercontent.com/Ayman/IslamicDB/main/stories.json");
          const stories = res.data;
          const randomStory = stories[Math.floor(Math.random() * stories.length)];
          response = randomStory.text || "لم أتمكن من جلب القصة الآن.";
        }
        break;

      case "تفسير":
        {
          if (!query) return api.sendMessage("◯ يرجى كتابة اسم السورة للتفسير.", threadID, messageID);
          const res = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent("أعطني تفسير سورة " + query + " باختصار")}`);
          response = res.data.response || "لم أتمكن من جلب التفسير الآن.";
        }
        break;

      case "معنى":
        {
          if (!query) return api.sendMessage("◯ يرجى كتابة الكلمة لمعرفة معناها.", threadID, messageID);
          const res = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent("أعطني معنى كلمة " + query)}`);
          response = res.data.response || "لم أتمكن من معرفة معنى الكلمة.";
        }
        break;

      case "سورة":
        {
          if (!query) return api.sendMessage("◯ يرجى كتابة اسم السورة.", threadID, messageID);
          const res = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent("أعطني نص سورة " + query)}`);
          response = res.data.response || "لم أتمكن من جلب نص السورة.";
        }
        break;

      default:
        return api.sendMessage(menu, threadID, messageID);
    }

    const msg = `◈ ───『 𝑯𝑬𝑩𝑨 - قسم الاسلاميات 』─── ◈\n\n` +
                `✨ نوع المحتوى: ${type} ✨\n\n` +
                `${response}\n` +
                `\n◈ ──────────────── ◈\n` +
                `│←› تم التطوير بواسطة: ايمن 👑\n` +
                `◈ ──────────────── ◈`;

    return api.sendMessage(msg, threadID, messageID);

  } catch (e) {
    console.log("Islamic Error:", e.message);
    return api.sendMessage("⚠️ عذراً، حاول مرة أخرى لاحقاً.", threadID, messageID);
  }
};
