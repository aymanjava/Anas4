const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "ترحيب",
  version: "1.0.0",
  credits: "Ayman",
  description: "يرسل صورة ترحيبية عند دخول عضو جديد"
};

module.exports.run = async function({ api, event }) {
  const { threadID, senderID } = event;
  const path = __dirname + `/cache/welcome_${senderID}.png`;

  try {
    // جلب بيانات المستخدم
    const info = await api.getUserInfo(senderID);
    const name = info[senderID].name;
    const avatarURL = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    const canvas = createCanvas(1200, 600);
    const ctx = canvas.getContext("2d");

    // رسم الخلفية (لون داكن فخم)
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // رسم دائرة لصورة البروفايل
    const avatar = await loadImage(avatarURL);
    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 200, 150, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 450, 50, 300, 300);
    ctx.restore();

    // نصوص الترحيب المزخرفة
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 60px Arial";
    ctx.fillText(`✨ أهـلاً بـك فـي الـمـجـمـوعـة ✨`, 600, 420);
    
    ctx.fillStyle = "#00ccff";
    ctx.font = "50px Arial";
    ctx.fillText(name, 600, 500);

    fs.writeFileSync(path, canvas.toBuffer());
    api.sendMessage({
      body: `✨ **مـرحـبـاً بـك فـي عـالـمـنـا** ✨\n━━━━━━━━━━━━━━\nنورت الجروب يا بطل! نتمنى لك وقتاً ممتعاً.`,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path));

  } catch (e) {
    api.sendMessage("❌ فشل في إنشاء صورة الترحيب.", threadID);
  }
};
