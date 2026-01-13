const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "انستا",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحميل ريلز وصور من إنستغرام",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];
  if (!url) return api.sendMessage("◯ يرجى وضع رابط إنستغرام بعد الأمر.", threadID, messageID);

  api.sendMessage("◈ جاري جلب الوسائط... [ 3 ]", threadID, async (err, info) => {
    setTimeout(() => api.editMessage("◈ جاري جلب الوسائط... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("◈ جاري جلب الوسائط... [ 1 ]", info.messageID), 2000);

    try {
      const res = await axios.get(`https://api.samirxpikachu.it.com/alldl?url=${encodeURIComponent(url)}`);
      const link = res.data.result || res.data.url;
      const path = __dirname + `/cache/insta_${Date.now()}.mp4`;

      const vid = (await axios.get(link, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(path, Buffer.from(vid, "utf-8"));

      api.sendMessage({
        body: `◈ ───『 إنـسـتـغـرام 』─── ◈\n\n◉ تم التحميل بنجاح\n\n◈ ─────────────── ◈`,
        attachment: fs.createReadStream(path)
      }, threadID, () => {
        fs.unlinkSync(path);
        api.unsendMessage(info.messageID);
      }, messageID);
    } catch (e) {
      api.editMessage("❌ فشل التحميل، تأكد من أن الحساب عام وليس خاصاً.", info.messageID);
    }
  }, messageID);
};
