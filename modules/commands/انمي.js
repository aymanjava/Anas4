const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "أنمي",
  version: "11.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث أنمي تفاعلي بمصدر موثوق",
  commandCategory: "ترفيه",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const animeName = args.join(" ");
  if (!animeName) return api.sendMessage("✨ سيدي أيمن، ما هو الأنمي الذي تبحث عنه؟", threadID, messageID);

  const loading = await api.sendMessage("🔍 جاري البحث في أكوان الأنمي...", threadID, messageID);

  try {
    const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`);
    const data = res.data.data[0];
    if (!data) throw new Error("لا يوجد نتائج");

    const imgUrl = data.images.jpg.large_image_url;
    const imgPath = path.join(__dirname, `cache/anime_${Date.now()}.jpg`);
    const imgData = (await axios.get(imgUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(imgPath, Buffer.from(imgData));

    const msg = `🌟 **نتيجة البحث عن الأنمي** 🌟\n━━━━━━━━━━━━━━━\n\n` +
                `⛩️ الاسم: ${data.title}\n` +
                `⭐ التقييم: ${data.score || "N/A"}\n` +
                `🎬 الحلقات: ${data.episodes || "مستمرة"}\n` +
                `📡 الحالة: ${data.status}\n\n` +
                `📝 **القصة:**\n${data.synopsis ? data.synopsis.substring(0, 350) + "..." : "لا يوجد وصف."}\n\n` +
                `━━━━━━━━━━━━━━━\n👤 المطور: أيـمـن`;

    await api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imgPath)
    }, threadID);

    fs.unlinkSync(imgPath);
    api.unsendMessage(loading.messageID);
    api.setMessageReaction("⛩️", messageID, () => {}, true);

  } catch (e) {
    console.log(e);
    api.editMessage("❌ لم أتمكن من العثور على أي نتائج دقيقة. حاول تغيير اسم الأنمي.", loading.messageID);
  }
};
