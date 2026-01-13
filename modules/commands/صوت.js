const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "صوت",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحويل الفيديو إلى مقطع صوتي",
  commandCategory: "ميديا",
  usePrefix: true
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, type, messageReply } = event;
  if (type !== "message_reply" || !messageReply.attachments[0]) return api.sendMessage("◯ رد على الفيديو لتحويله لصوت.", threadID, messageID);

  api.sendMessage("◈ جاري تحويل الصيغة... [ 3 ]", threadID, async (err, info) => {
    setTimeout(() => api.editMessage("◈ جاري تحويل الصيغة... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("◈ جاري تحويل الصيغة... [ 1 ]", info.messageID), 2000);

    try {
      const vidUrl = messageReply.attachments[0].url;
      const path = __dirname + `/cache/audio_${Date.now()}.mp3`;
      
      const response = await axios.get(vidUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

      api.sendMessage({
        body: "◈ تم التحويل إلى صوت بنجاح",
        attachment: fs.createReadStream(path)
      }, threadID, () => {
        fs.unlinkSync(path);
        api.unsendMessage(info.messageID);
      }, messageID);
    } catch (e) {
      api.editMessage("❌ فشل التحويل.", info.messageID);
    }
  }, messageID);
};
