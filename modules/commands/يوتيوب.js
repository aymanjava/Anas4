const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "يوتيوب",
  version: "25.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحميل يوتيوب بـ 25 سيرفر بديل",
  commandCategory: "ميديا",
  usePrefix: true
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];
  if (!url) return api.sendMessage("◯ يرجى وضع رابط يوتيوب!", threadID, messageID);

  // قائمة الـ 25 API والمصادر البديلة
  const sources = [
    `https://api.vyt.com/yt?url=${url}`, `https://api.samirxpikachu.it.com/ytdl?url=${url}`,
    `https://api.betabotz.org/api/download/ytmp4?url=${url}`, `https://api.shizuhub.xyz/api/download/ytmp4?url=${url}`,
    `https://api.dany.com/ytmp4?url=${url}`, `https://api.rest.xyz/yt?url=${url}`,
    `https://api.xyroinee.xyz/api/v1/download/ytmp4?url=${url}`, `https://api.bot-hunter.top/yt?url=${url}`,
    `https://saiko-api.onrender.com/api/ytdl?url=${url}`, `https://api.alyapi.me/ytmp4?url=${url}`,
    `https://api.ytdl.me/dl?url=${url}`, `https://api.tools.com/ytmp4?url=${url}`,
    `https://api.popcat.xyz/ytdl?url=${url}`, `https://api.paxsenix.biz/ytmp4?url=${url}`,
    `https://api.mira.me/yt?url=${url}`, `https://api.kriz.xyz/yt?url=${url}`,
    `https://api.lorenzo.xyz/ytmp4?url=${url}`, `https://api.zenzapis.xyz/downloader/ytmp4?url=${url}`,
    `https://api.caliph.biz/ytmp4?url=${url}`, `https://api.hardianto.xyz/ytmp4?url=${url}`,
    `https://api.lolhuman.xyz/api/ytvideo?url=${url}`, `https://api.neoxr.eu/api/ytv?url=${url}`,
    `https://api.xteam.xyz/dl/ytmp4?url=${url}`, `https://api.itsrose.life/ytmp4?url=${url}`,
    `https://api.zahwazein.xyz/downloader/ytmp4?url=${url}`
  ];

  api.sendMessage("◈ جاري الفحص في 25 سيرفر تحميل... [ 3 ]", threadID, async (err, info) => {
    let success = false;
    for (let i = 0; i < sources.length; i++) {
      try {
        const res = await axios.get(sources[i]);
        const downloadUrl = res.data.result || res.data.url || res.data.data?.url || res.data.link;

        if (downloadUrl) {
          const path = __dirname + `/cache/yt_${Date.now()}.mp4`;
          const vid = (await axios.get(downloadUrl, { responseType: "arraybuffer" })).data;
          fs.writeFileSync(path, Buffer.from(vid, "utf-8"));

          api.sendMessage({
            body: `◈ ───『 يـوتـيـوب 』─── ◈\n\n◯ السيرفر المستخدم: [${i + 1}/25]\n◉ تم التحميل بنجاح\n\n◈ ─────────────── ◈`,
            attachment: fs.createReadStream(path)
          }, threadID, () => {
            fs.unlinkSync(path);
            api.unsendMessage(info.messageID);
          }, messageID);
          success = true; break;
        }
      } catch (e) { continue; } // إذا فشل السيرفر الحالي ينتقل للذي يليه فوراً
    }
    if (!success) api.editMessage("❌ عذراً، جميع السيرفرات الـ 25 مشغولة أو محظورة حالياً.", info.messageID);
  }, messageID);
};
