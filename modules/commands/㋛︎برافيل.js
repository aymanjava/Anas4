module.exports.config = {
  name: "بروفايل",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "عرض صورة البروفايل بجودة عالية للإمبراطور ورعيته",
  commandCategory: "صور",
  usages: "[منشن / بالرد / بدون شيء]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.run = async function ({ api, event, args, Users }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  let { senderID, threadID, messageID, type, messageReply, mentions } = event;

  // 1️⃣ تحديد الأيدي (UID) المطلوب
  let uid;
  if (type == "message_reply") {
    uid = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    uid = Object.keys(mentions)[0];
  } else if (args[0] && !isNaN(args[0])) {
    uid = args[0];
  } else {
    uid = senderID;
  }

  const pathImg = __dirname + `/cache/profile_${uid}.png`;
  const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

  try {
    // جلب اسم الشخص المختار
    const name = await Users.getNameUser(uid);

    api.sendMessage("◈ ───『 جـاري جـلـب الـصورة.. 』─── ◈", threadID, messageID);

    // 2️⃣ جلب الصورة بجودة عالية جداً 1500x15000
    const res = await axios.get(`https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=${TOKEN}`, { responseType: "arraybuffer" });
    
    fs.writeFileSync(pathImg, Buffer.from(res.data, "utf-8"));

    const msg = {
      body: `◈ ───『 الـبـروفـايـل الـمـلـكـي 』─── ◈\n\n◯ الـاسـم : ${name}\n🆔 مـعـرف الـحـساب : ${uid}\n———————————————\n◯ تـم جـلـب الـصورة بـأعـلى جـودة سـيـدي.\n———————————————\n◈ ─────────────── ◈\n│←› بـأوامـر: الـتـوب أيـمـن 👑`,
      attachment: fs.createReadStream(pathImg)
    };

    return api.sendMessage(msg, threadID, () => {
      if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
    }, messageID);

  } catch (e) {
    return api.sendMessage("⚠️ سيدي، فشلت في جلب الصورة، قد يكون الحساب مغلقاً أو الرابط معطلاً.", threadID, messageID);
  }
};
