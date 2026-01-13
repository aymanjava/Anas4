const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "خلفية",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "جلب خلفيات عشوائية بجودة عالية",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;
  
  api.sendMessage("🖼️ جاري جلب خلفية فخمة... [ 3 ]", threadID, async (err, info) => {
    setTimeout(() => api.editMessage("🖼️ جاري جلب خلفية فخمة... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("🖼️ جاري جلب خلفية فخمة... [ 1 ]", info.messageID), 2000);

    try {
      const res = await axios.get("https://api.vyt.com/wallpaper/random"); // مصدر متجدد
      const imgUrl = res.data.url;
      const path = __dirname + `/cache/wall_${Date.now()}.jpg`;
      
      const img = (await axios.get(imgUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(path, Buffer.from(img, "utf-8"));

      api.sendMessage({
        body: "✨ تفضل، خلفية مختارة لك بعناية ✨",
        attachment: fs.createReadStream(path)
      }, threadID, () => {
        fs.unlinkSync(path);
        api.unsendMessage(info.messageID);
      }, messageID);
    } catch (e) {
      api.editMessage("❌ فشل جلب الصورة، السيرفر لا يستجيب.", info.messageID);
    }
  }, messageID);
};
