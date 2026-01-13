const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "خلفية",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "جلب خلفيات عشوائية عالية الجودة",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  const loading = await api.sendMessage("🖼️ جاري جلب خلفية فخمة... [ 3 ]", threadID, messageID);
  setTimeout(() => api.editMessage("🖼️ جاري جلب خلفية فخمة... [ 2 ]", loading.messageID), 1000);
  setTimeout(() => api.editMessage("🖼️ جاري جلب خلفية فخمة... [ 1 ]", loading.messageID), 2000);

  try {
    // مصدر موثوق للصور العشوائية
    const res = await axios.get("https://source.unsplash.com/1200x800/?wallpaper,nature,anime", { responseType: "arraybuffer" });
    
    const filePath = path.join(__dirname, `cache/wall_${Date.now()}.jpg`);
    fs.writeFileSync(filePath, Buffer.from(res.data));

    await api.sendMessage({
      body: "✨ تفضل، خلفية مختارة لك بعناية ✨",
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      fs.unlinkSync(filePath);
      api.unsendMessage(loading.messageID);
    }, messageID);

  } catch (e) {
    console.error(e);
    api.editMessage("❌ فشل جلب الصورة، حاول لاحقاً.", loading.messageID);
  }
};
