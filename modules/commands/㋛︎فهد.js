const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");

module.exports.config = {
  name: "فهد",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "الفضيحة الكبرى: زواج وفاء من الطفل فهد (ترفيه)",
  commandCategory: "العاب",
  usages: "",
  cooldowns: 5,
  dependencies: { "canvas": "", "axios": "", "fs-extra": "" }
};

module.exports.run = async function({ api, event, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const reward = 5; // منحة ترفيهية (5$ للضحك)

  // IDs الأطراف
  const id1 = "100028308331185"; // وفاء
  const id2 = "100063510537024"; // فهد

  const pathImg = __dirname + `/cache/wedding_prank_${senderID}.png`;

  api.sendMessage("🎼 لـولـولـولـيـيـيـيـش 💃\n\n📢 جاري تحضير القاعة وإجبار فهد على لبس البدلة..", threadID);

  try {
    const img1 = `https://graph.facebook.com/${id1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const img2 = `https://graph.facebook.com/${id2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    const canvas = createCanvas(700, 400);
    const ctx = canvas.getContext("2d");

    // رسم خلفية ملونة (بنفسجي وأحمر للترفيه)
    const grad = ctx.createLinearGradient(0, 0, 700, 0);
    grad.addColorStop(0, "#ff0080");
    grad.addColorStop(1, "#7928ca");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const avatar1 = await loadImage(img1);
    const avatar2 = await loadImage(img2);

    // رسم الدوائر (صور العرسان)
    ctx.save();
    ctx.beginPath(); ctx.arc(180, 200, 130, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    ctx.drawImage(avatar1, 50, 70, 260, 260);
    ctx.restore();

    ctx.save();
    ctx.beginPath(); ctx.arc(520, 200, 130, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    ctx.drawImage(avatar2, 390, 70, 260, 260);
    ctx.restore();

    // رمز الحب المشبوه
    ctx.font = "80px Arial";
    ctx.fillText("💍", 315, 230);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    await Currencies.increaseMoney(senderID, reward);

    let msg = `◈ ───『 عـرس الـمـوسـم 🤣 』─── ◈\n\n` +
              `👰 الـعـروس: وفـاء (يـا عـيـني عـلـيـكـي)\n` +
              `🤵 الـعـريـس: فـهـد (الـطـفـل الـمـخـطـوف)\n\n` +
              `📜 الـحالة: زواج مـصـلـحـة بـرعـايـة هـبـة.\n` +
              `💰 مـنـحة الـمـباركة: +${reward}$\n` +
              ` ———————————————\n` +
              `│←› المأذون الـمـحـشش: الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage({ body: msg, attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (e) {
    return api.sendMessage("⚠️ سيدي، العريس فهد هرب من القاعة، فشلت الفضيحة!", threadID);
  }
};
