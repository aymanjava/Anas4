const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "تيك",
  version: "25.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحميل تيك توك بـ 25 سيرفر بديل",
  commandCategory: "ميديا",
  usePrefix: true
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];
  if (!url) return api.sendMessage("◯ يرجى وضع رابط تيك توك!", threadID, messageID);

  const sources = [
    `https://api.tiklydown.eu.org/api/download?url=${url}`, `https://www.tikwm.com/api/?url=${url}`,
    `https://api.samirxpikachu.it.com/tiktok?url=${url}`, `https://api.vyt.com/tiktok?url=${url}`,
    `https://api.betabotz.org/api/download/tiktok?url=${url}`, `https://api.dany.com/tk?url=${url}`,
    `https://saiko-api.onrender.com/api/tiktok?url=${url}`, `https://api.alyapi.me/tiktok?url=${url}`,
    `https://api.paxsenix.biz/tiktok?url=${url}`, `https://api.mira.me/tk?url=${url}`,
    `https://api.lorenzo.xyz/tiktok?url=${url}`, `https://api.zenzapis.xyz/downloader/tiktok?url=${url}`,
    `https://api.caliph.biz/tiktok?url=${url}`, `https://api.hardianto.xyz/tiktok?url=${url}`,
    `https://api.lolhuman.xyz/api/tiktok?url=${url}`, `https://api.neoxr.eu/api/tiktok?url=${url}`,
    `https://api.xteam.xyz/dl/tiktok?url=${url}`, `https://api.itsrose.life/tiktok?url=${url}`,
    `https://api.zahwazein.xyz/downloader/tiktok?url=${url}`, `https://api.xyroinee.xyz/api/v1/download/tiktok?url=${url}`,
    `https://api.bot-hunter.top/tiktok?url=${url}`, `https://api.rest.xyz/tk?url=${url}`,
    `https://api.shizuhub.xyz/api/download/tiktok?url=${url}`, `https://api.tools.com/tiktok?url=${url}`,
    `https://api.ytdl.me/tk?url=${url}`
  ];

  api.sendMessage("◈ جاري سحب الفيديو من 25 مصدر... [ 3 ]", threadID, async (err, info) => {
    let success = false;
    for (let i = 0; i < sources.length; i++) {
      try {
        const res = await axios.get(sources[i]);
        const video = res.data.video || res.data.result?.video || res.data.data?.play || res.data.noWatermark;

        if (video) {
          const path = __dirname + `/cache/tk_${Date.now()}.mp4`;
          const data = (await axios.get(video, { responseType: "arraybuffer" })).data;
          fs.writeFileSync(path, Buffer.from(data, "utf-8"));

          api.sendMessage({
            body: `◈ ───『 تـيـك تـوك 』─── ◈\n\n◯ السيرفر: [${i + 1}/25]\n◉ تم التحميل بدون علامة مائية\n\n◈ ─────────────── ◈`,
            attachment: fs.createReadStream(path)
          }, threadID, () => {
            fs.unlinkSync(path);
            api.unsendMessage(info.messageID);
          }, messageID);
          success = true; break;
        }
      } catch (e) { continue; }
    }
    if (!success) api.editMessage("❌ فشل التحميل من جميع المصادر الـ 25.", info.messageID);
  }, messageID);
};
