const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "welcome",
  eventType: ["log:subscribe"],
  version: "2.0.0",
  credits: "Ayman",
  description: "ترحيب بصورة عند دخول عضو جديد"
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, logMessageData } = event;
  if (!logMessageData?.addedParticipants) return;

  for (const user of logMessageData.addedParticipants) {
    const userID = user.userFbId;
    const userName = user.fullName;
    const imgPath = path.join(__dirname, "cache", `welcome_${userID}.png`);

    try {
      const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;

      const canvas = createCanvas(1200, 600);
      const ctx = canvas.getContext("2d");

      // خلفية
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // تحميل الأفتار
      const avatar = await loadImage(avatarURL);

      // دائرة الأفتار
      ctx.save();
      ctx.beginPath();
      ctx.arc(600, 200, 150, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 450, 50, 300, 300);
      ctx.restore();

      // نص الترحيب
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 58px Arial";
      ctx.fillText("✨ أهـلاً بـك فـي الـمـجـمـوعـة ✨", 600, 420);

      ctx.fillStyle = "#00ccff";
      ctx.font = "bold 48px Arial";
      ctx.fillText(userName, 600, 500);

      fs.writeFileSync(imgPath, canvas.toBuffer());

      api.sendMessage({
        body:
`◈ ───『 تـرحـيـب 』─── ◈

◯ نورت الجروب يا ${userName} 🤍
◯ نتمنى لك وقت ممتع معنا

◈ ─────────────── ◈
│←› بـوت هـبـة
│←› تـطـويـر: أيـمـن
◈ ─────────────── ◈`,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => fs.unlinkSync(imgPath));

    } catch (err) {
      console.log("Welcome Error:", err.message);
    }
  }
};
