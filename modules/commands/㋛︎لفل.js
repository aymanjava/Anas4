const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "لفل",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "عرض بطاقة المستوى الملكية مع نظام ترتيب الخزينة",
  commandCategory: "العاب",
  cooldowns: 5,
  dependencies: {
    "canvas": "",
    "jimp": "",
    "node-superfetch": ""
  }
};

// إعداد المجلدات والملفات عند التشغيل
module.exports.onLoad = async function () {
  const cachePath = path.resolve(__dirname, "cache");
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
  
  const imgUrl = "https://i.postimg.cc/2SX994dy/370302233-350278991004060-783576214704582311-n.jpg";
  const rankCardPath = path.resolve(cachePath, 'rankcard_master.png');
  
  if (!fs.existsSync(rankCardPath)) {
    const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(rankCardPath, Buffer.from(res.data, "utf-8"));
  }
};

module.exports.makeRankCard = async (data) => {    
  const Canvas = require("canvas");
  const request = require("node-superfetch");
  const jimp = require("jimp");
  const __root = path.resolve(__dirname, "cache");

  const { id, name, rank, level, expCurrent, expNextLevel, isTop } = data;

  // تسجيل الخط الفخم
  const fontPath = __root + "/SplineSans-Medium.ttf";
  if (fs.existsSync(fontPath)) {
    Canvas.registerFont(fontPath, { family: "Manrope" });
  }

  const rankCard = await Canvas.loadImage(__root + "/rankcard_master.png");
  const canvas = Canvas.createCanvas(934, 282);
  const ctx = canvas.getContext("2d");

  // رسم الخلفية
  ctx.drawImage(rankCard, 0, 0, canvas.width, canvas.height);

  // معالجة الأفاتار بشكل دائري احترافي
  let avatarRes = await request.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  let jimpAvatar = await jimp.read(avatarRes.body);
  jimpAvatar.circle();
  let avatarBuffer = await jimpAvatar.getBufferAsync("image/png");
  let avatar = await Canvas.loadImage(avatarBuffer);
  
  ctx.drawImage(avatar, 45, 50, 180, 180);

  // إعداد النصوص بالتنسيق الملكي
  ctx.fillStyle = isTop ? "#FFD700" : "#ffffff"; // لون ذهبي للتوب
  ctx.textAlign = "start";
  ctx.font = "bold 38px Manrope";
  ctx.fillText(name, 270, 111);

  ctx.font = "bold 32px Manrope";
  ctx.fillText(`Rank: #${rank}`, 270, 160);
  ctx.fillText(`Level: ${isTop ? "MAX" : level}`, 270, 205);

  // شريط الخبرة (Exp Bar)
  const barWidth = 500;
  const progress = isTop ? 1 : expCurrent / expNextLevel;
  ctx.fillStyle = "#333333";
  ctx.fillRect(270, 220, barWidth, 15);
  ctx.fillStyle = isTop ? "#FFD700" : "#00FF7F";
  ctx.fillRect(270, 220, barWidth * progress, 15);

  const pathImg = path.resolve(__root, `rank_${id}.png`);
  fs.writeFileSync(pathImg, canvas.toBuffer());
  return pathImg;
};

module.exports.run = async ({ event, api, args, Currencies, Users }) => {
  const { threadID, messageID, senderID, mentions } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);

  let dataAll = await Currencies.getAll(["userID", "exp"]);
  dataAll.sort((a, b) => (b.exp || 0) - (a.exp || 0));

  const targetID = Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;
  const rank = dataAll.findIndex(item => item.userID == targetID) + 1;
  const name = await Users.getNameUser(targetID);
  
  // نظام النقاط والمستوى
  let point = (await Currencies.getData(targetID)).exp || 0;
  const level = Math.floor((Math.sqrt(1 + (4 * point) / 3) + 1) / 2);
  const expCurrent = point - (3 * level * (level - 1));
  const expNextLevel = (3 * (level + 1) * level) - (3 * level * (level - 1));

  api.sendMessage(`◈ ───『 جـارِ اسـتـخـراج الـرتـبـة 』─── ◈\n\n⌛ سيدي، يتم الآن فحص سجلات الخزينة والمستوى..\n\n◈ ──────────────── ◈`, threadID);

  const pathRankCard = await this.makeRankCard({ 
    id: targetID, name, rank, level, expCurrent, expNextLevel, isTop: global.config.ADMINBOT.includes(targetID) 
  });

  let msg = `◈ ───『 بـطـاقـة الـمـسـتـوى 』─── ◈\n\n` +
            `👤 الـمـسـتـخدم: ${name}\n` +
            `🏆 الـتـرتـيـب: ${rank}\n` +
            `📊 الـمـسـتـوى: ${isTop ? "إمـبـراطـور (MAX)" : level}\n` +
            `✨ الـخـبرة: ${isTop ? "∞" : expCurrent + " / " + expNextLevel}\n\n` +
            ` ———————————————\n` +
            `│←› الـمـدير الـعـام: الـتـوب ايـمـن 👑\n` +
            `◈ ──────────────── ◈`;

  return api.sendMessage({ body: msg, attachment: fs.createReadStream(pathRankCard) }, threadID, () => fs.unlinkSync(pathRankCard), messageID);
};
