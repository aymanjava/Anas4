const axios = require("axios");

module.exports.config = {
  name: "اسلاميات",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "قسم الإسلاميات شامل (أحاديث، سور، تفسير، فتاوى)",
  commandCategory: "〘 اسلاميات 〙",
  usages: "[النوع] [البحث]",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const type = args[0];
  const query = args.slice(1).join(" ");

  const menu = `◈ ───『 𝑯𝑬𝑩𝑨 - اسلاميات 』─── ◈
أهلاً بك في قسم الاسلاميات 📖
يمكنك استخدام الأوامر كما يلي:

◯ حديث ⟢ جلب حديث شريف من Sunnah.com
◯ تفسير [اسم السورة] ⟢ تفسير السورة باختصار من Al-Quran Cloud
◯ سورة [اسم السورة] ⟢ نص السورة الكامل من Al-Quran Cloud
◯ معنى [الكلمة] ⟢ معنى الكلمة أو شرحها
◯ فتوى [السؤال] ⟢ جلب فتاوى شرعية من موقع IslamQA

مثال: اسلاميات حديث
◈ ──────────────── ◈`;

  if (!type) return api.sendMessage(menu, threadID, messageID);

  try {
    let response = "";

    switch(type.toLowerCase()) {
      case "حديث":
        {
          const res = await axios.get("https://api.sunnah.com/v1/hadiths/random", {
            headers: { "X-API-Key": "YOUR_SUNNAH_API_KEY" }
          });
          const hadith = res.data.data[0];
          response = `📜 ${hadith.text.arabic}\n- ${hadith.book.name}`;
        }
        break;

      case "تفسير":
        {
          if (!query) return api.sendMessage("◯ يرجى كتابة اسم السورة.", threadID, messageID);
          const surahRes = await axios.get(`https://api.alquran.cloud/v1/surah/${encodeURIComponent(query)}/ar.alafasy`);
          const tafsirRes = await axios.get(`https://api.alquran.cloud/v1/surah/${encodeURIComponent(query)}/ar.uthmani`);
          response = `📖 تفسير سورة ${query}:\n`;
          response += tafsirRes.data.data.ayahs.map(a => `${a.numberInSurah}. ${a.text}`).join("\n");
        }
        break;

      case "سورة":
        {
          if (!query) return api.sendMessage("◯ يرجى كتابة اسم السورة.", threadID, messageID);
          const surahRes = await axios.get(`https://api.alquran.cloud/v1/surah/${encodeURIComponent(query)}/ar.alafasy`);
          response = `📖 سورة ${query} كاملة:\n`;
          response += surahRes.data.data.ayahs.map(a => `${a.numberInSurah}. ${a.text}`).join("\n");
        }
        break;

      case "معنى":
        {
          if (!query) return api.sendMessage("◯ يرجى كتابة الكلمة لمعرفة معناها.", threadID, messageID);
          const res = await axios.get(`https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/ar`);
          if(res.data.data.count === 0) response = "❌ لم أتمكن من إيجاد معنى الكلمة.";
          else response = `🔎 ${query} وجدت في الآيات:\n` + res.data.data.matches.map(m => `${m.text}`).slice(0,5).join("\n...");
        }
        break;

      case "فتوى":
        {
          if (!query) return api.sendMessage("◯ يرجى كتابة السؤال للحصول على الفتوى.", threadID, messageID);
          const res = await axios.get(`https://islamqa.info/api/v1/answers?search=${encodeURIComponent(query)}`);
          if(res.data.length === 0) response = "❌ لم أتمكن من العثور على فتوى لهذا السؤال.";
          else {
            const f = res.data[0];
            response = `💡 السؤال: ${f.question}\n🕌 الفتوى: ${f.answer_ar}`;
          }
        }
        break;

      default:
        return api.sendMessage(menu, threadID, messageID);
    }

    const msg = `◈ ───『 𝑯𝑬𝑩𝑨 - اسلاميات 』─── ◈\n\n` +
                `✨ نوع المحتوى: ${type} ✨\n\n` +
                `${response}\n` +
                `\n◈ ──────────────── ◈\n` +
                `│←› تم التطوير بواسطة: ايمن 👑\n` +
                `◈ ──────────────── ◈`;

    return api.sendMessage(msg, threadID, messageID);

  } catch(e) {
    console.log("Islamic Error:", e.message);
    return api.sendMessage("⚠️ عذراً، حاول مرة أخرى لاحقاً.", threadID, messageID);
  }
};
