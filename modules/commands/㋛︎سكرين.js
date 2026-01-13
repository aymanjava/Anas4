const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "سكرين",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "فحص المواقع مع مكافأة تشجيعية من الخزينة",
  commandCategory: "خدمات",
  cooldowns: 10,
  dependencies: { "fs-extra": "", "path": "", "axios": "" }
};

module.exports.run = async ({ event, api, args, Currencies }) => {
  const { threadID, messageID, senderID } = event;
  const reward = 10; // مكافأة الخدمة (نقاط قليلة كما أمرت)

  if (!args[0]) return api.sendMessage(`⚠️ سيدي، ضع رابط الموقع أولاً.`, threadID, messageID);

  api.sendMessage(`◈ ───『 جـارِ الـفـحـص 』─── ◈\n\n🔍 يتم تجهيز اللقطة.. ستنال مكافأة بسيطة لاستخدامك خدماتنا.\n\n◈ ──────────────── ◈`, threadID);

  try {
      const imgPath = path.resolve(__dirname, "cache", `screen_${senderID}.png`);
      const response = await axios.get(`https://image.thum.io/get/width/1920/crop/400/fullpage/noanimate/${args[0]}`, { responseType: 'arraybuffer' });
      fs.writeFileSync(imgPath, Buffer.from(response.data, 'binary'));

      // منح المكافأة للعضو
      await Currencies.increaseMoney(senderID, reward);

      let msg = `◈ ───『 تـقـريـر الـمـعـايـنـة 』─── ◈\n\n` +
                `✅ تم التصوير بنجاح\n` +
                `💰 مكافأة استخدام الخدمة: +${reward}$\n` +
                `│←› الـقـائد: الـتـوب ايـمـن 👑\n\n` +
                `◈ ──────────────── ◈`;

      return api.sendMessage({ body: msg, attachment: fs.createReadStream(imgPath) }, threadID, () => fs.unlinkSync(imgPath), messageID);
  } catch (err) {
      return api.sendMessage("⚠️ الرابط غير صحيح سيدي.", threadID, messageID);
  }
};
