const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "لوكو",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "انشاء شعار احترافي مع نظام رسوم الخزينة",
  commandCategory: "صور",
  usages: "[رقم اللوكو] [النص]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);
  const designFee = 500; // رسوم التصميم (صرف)

  if (args[0] === "الكل") {
    let listMsg = `◈ ───『 سـجـل الـتـصـامـيـم 』─── ◈\n\n` +
                  ` ✅ متوفر حالياً: 36 نموذج احترافي\n` +
                  ` 💰 رسوم الطلب: ${designFee}$\n\n` +
                  `│←› اكتب: لوكو [الرقم] [النص بالإنجليزية]\n` +
                  `│←› بـإدارة الـتـوب ايـمـن 👑\n` +
                  `◈ ──────────────── ◈`;
    return api.sendMessage(listMsg, threadID, messageID);
  }

  if (args.length < 2) {
    return api.sendMessage(`◈ ───『 تـنـبـيـه الـمـديـر 』─── ◈\n\n⚠️ يرجى استخدام الصيغة الصحيحة:\nلوكو [رقم الموديل] [النص]\n\nمثال: لوكو 5 Ayman\n\n◈ ──────────────── ◈`, threadID, messageID);
  }

  // نظام الصرف والخسارة
  let userMoney = (await Currencies.getData(senderID)).money || 0;
  if (!isTop && userMoney < designFee) {
    return api.sendMessage(`◈ ───『 الـخـزيـنـة 』─── ◈\n\n❌ عذراً، تكلفة التصميم هي ${designFee}$. رصيدك لا يكفي!\n\n◈ ──────────────── ◈`, threadID, messageID);
  }

  let type = args[0];
  let name = args.slice(1).join(" ");
  let pathImg = __dirname + `/cache/logo_${senderID}.png`;
  let apiUrl;

  // تحديد الرابط بناءً على النوع (تم اختصارها لسهولة القراءة)
  if (parseInt(type) <= 30) {
    apiUrl = `https://reset-api.ch9nd.repl.co/api/textpro/${type}?text=${name}`;
  } else {
    switch(type) {
      case "31": apiUrl = `https://rest-api-001.faheem001.repl.co/api/textpro?number=4&text=${name}`; break;
      case "32": apiUrl = `https://faheem-vip-010.faheem001.repl.co/api/textpro/blood?text=${name}`; break;
      case "33": apiUrl = `https://faheem-vip-010.faheem001.repl.co/api/textpro/broken?text=${name}`; break;
      case "34": apiUrl = `https://faheem-vip-010.faheem001.repl.co/api/ephoto/nightstars?text=${name}`; break;
      case "35": apiUrl = `https://faheem-vip-010.faheem001.repl.co/api/ephoto/horror?text=${name}`; break;
      case "36": apiUrl = `https://faheem-vip-010.faheem001.repl.co/api/ephoto/facebookcover3?text=${name}`; break;
      default: return api.sendMessage("❌ هذا الموديل غير متوفر حالياً.", threadID, messageID);
    }
  }

  api.sendMessage(`◈ ───『 غـرفـة الـتـصـمـيـم 』─── ◈\n\n🎨 جاري معالجة طلبك سيدي..\n${isTop ? "⚡ الأولوية: قصوى (التوب)" : "⏳ انتظر ثواني.."}\n\n◈ ──────────────── ◈`, threadID);

  try {
    let response = await axios.get(apiUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(pathImg, Buffer.from(response.data, "utf-8"));

    // خصم المبلغ بعد نجاح التصميم (نظام الصرف)
    if (!isTop) await Currencies.decreaseMoney(senderID, designFee);

    let finalMsg = `◈ ───『 اكـتـمـال الـطـلـب 』─── ◈\n\n` +
                   `✅ تم تصميم الشعار بنجاح\n` +
                   `💰 التكلفة: ${isTop ? "0$ (إهداء للتوب)" : designFee + "$"}\n` +
                   `✨ المصمم: الـتـوب ايـمـن 👑\n\n` +
                   `◈ ──────────────── ◈`;

    return api.sendMessage({ body: finalMsg, attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);
  } catch (err) {
    return api.sendMessage("❌ حدث خطأ في خادم التصميم، يرجى المحاولة لاحقاً.", threadID, messageID);
  }
};
