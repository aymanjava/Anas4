const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "بطاقة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بطاقة إمبراطورية فخمة",
  commandCategory: "صور",
  cooldowns: 5
};

module.exports.run = async ({ api, event, Users }) => {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;

  let uid =
    type === "message_reply" ? messageReply.senderID :
    Object.keys(mentions)[0] || senderID;

  const name = await Users.getNameUser(uid);
  const rate = Math.floor(Math.random() * 100);

  const path = __dirname + `/cache/card_${uid}.png`;
  const avatar = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;

  const bg = await loadImage("https://i.imgur.com/2yaf2wb.png");
  const avt = await loadImage(avatar);

  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(bg, 0, 0);
  ctx.drawImage(avt, 80, 90, 180, 180);

  ctx.font = "bold 40px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(name, 300, 150);

  ctx.font = "28px Arial";
  ctx.fillText(`UID: ${uid}`, 300, 195);
  ctx.fillText(`التقييم: ${rate}%`, 300, 240);

  fs.writeFileSync(path, canvas.toBuffer());

  api.sendMessage({
    body:
`◈ ───『 البطاقة الإمبراطورية 』─── ◈
👤 الاسم: ${name}
⭐ التقييم: ${rate}%
◈ ─────────────── ◈`,
    attachment: fs.createReadStream(path)
  }, threadID, () => fs.unlinkSync(path), messageID);
};
