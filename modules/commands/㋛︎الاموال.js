const axios = require('axios');
const fs = require('fs-extra');
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports.config = {
  name: "رصيدي",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "الاستعلام عن الرصيد بالهوية الرقمية الفخمة",
  commandCategory: "الاموال",
  usages: "[منشن / رد]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;
  const isTopAdmin = global.config.ADMINBOT.includes(senderID);

  // تحميل الخطوط إذا لم تكن موجودة
  const fontPaths = {
    medium: __dirname + '/cache/SplineSans-Medium.ttf',
    regular: __dirname + '/cache/SplineSans.ttf'
  };

  if (!fs.existsSync(fontPaths.medium)) {
    let getfont = (await axios.get(`https://drive.google.com/u/0/uc?id=102B8O3_0vTn_zla13wzSzMa-vdTZOCmp&export=download`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(fontPaths.medium, Buffer.from(getfont, "utf-8"));
  }
  if (!fs.existsSync(fontPaths.regular)) {
    let getfont2 = (await axios.get(`https://drive.google.com/u/0/uc?id=1--V7DANKLsUx57zg8nLD4b5aiPfHcmwD&export=download`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(fontPaths.regular, Buffer.from(getfont2, "utf-8"));
  }

  // تحديد الشخص المستهدف (UID)
  let targetID = senderID;
  if (type == "message_reply") targetID = messageReply.senderID;
  else if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];

  const isTargetTop = global.config.ADMINBOT.includes(targetID);
  const userData = await Users.getData(targetID);
  const name = userData.name;
  let money = (await Currencies.getData(targetID)).money || 0;

  // إعداد النص للعرض على الصورة
  let moneyText = isTargetTop ? "UNLIMITED" : money.toLocaleString() + "$";
  
  try {
    let pathImg = __dirname + `/cache/balance_${targetID}.png`;
    let bgBuffer = (await axios.get(`https://i.postimg.cc/j50RwyQd/received-1527894564687842.jpg`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(bgBuffer, "utf-8"));

    let bgBase = await loadImage(pathImg);
    let canvas = createCanvas(bgBase.width, bgBase.height);
    let ctx = canvas.getContext("2d");

    registerFont(fontPaths.medium, { family: "SplineSans-Medium" });
    
    ctx.drawImage(bgBase, 0, 0, canvas.width, canvas.height);
    ctx.font = "50px SplineSans-Medium";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    
    // كتابة المبلغ على البطاقة الرقمية
    ctx.fillText(moneyText, 540, 267);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    let msg = `◈ ───『 الـهـويـة الـمـالـيـة 』─── ◈\n\n` +
              `👤 الاسـم: ${name}\n` +
              `💰 الرصيد: ${isTargetTop ? "∞ (خزينة الإمبراطور)" : money.toLocaleString() + "$"}\n` +
              `🏛️ الرتبة: ${isTargetTop ? "الـتـوب ايـمـن 👑" : "مواطن"}\n\n` +
              ` ———————————————\n` +
              `│←› بـإدارة الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage({ body: msg, attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (err) {
    return api.sendMessage("❌ حدث خطأ أثناء استخراج البطاقة المالية.", threadID, messageID);
  }
};
