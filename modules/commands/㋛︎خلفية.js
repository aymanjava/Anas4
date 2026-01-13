module.exports.config = {
  name: "خلفية",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "شراء خلفيات 4K فاخرة من مكتبة كانفا العالمية",
  commandCategory: "صور",
  usages: "[اسم نوع الخلفية بالإنجليزية]",
  cooldowns: 10,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID, senderID } = event;

  // جلب بيانات المال
  const userData = await Currencies.getData(senderID);
  const money = userData.money;

  // التحقق من الرصيد (1000 دولار)
  if (money < 1000) {
    return api.sendMessage(`◈ ───『 عـجز مـالـي 』─── ◈\n\n◯ عذراً سيدي، رصيدك غير كافٍ.\n◉ تـكلفة الـخلفـية الـفـاخـرة: 1000$\n———————————————\n◯ يـرجـى جـمـع الـمزيـد مـن الأمـوال أولاً.`, threadID, messageID);
  }

  // تحديد نوع البحث (إذا لم يكتب المستخدم شيئاً يبحث عن خلفيات عشوائية)
  const query = args.join(" ") || "wallpaper 4k anime nature";
  
  api.sendMessage("⏳ جـاري سـحب الـخلفية مـن خـزائـن كـانـفا...", threadID, messageID);

  try {
    // استخدام محرك بحث لجلب صور عالية الجودة (مثل كانفا وبيكسلز)
    const res = await axios.get(`https://api.ready-to-work.uk/api/pinterest?q=${encodeURIComponent(query)}`);
    const images = res.data.data;
    const randomImage = images[Math.floor(Math.random() * images.length)];

    const path = __dirname + `/cache/wallpaper_${senderID}.jpg`;
    const imageRes = await axios.get(randomImage, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(imageRes.data, "utf-8"));

    // خصم المبلغ
    await Currencies.setData(senderID, { money: money - 1000 });

    const msg = `◈ ───『 مـتـجر الـخـلفـيـات 🖼️ 』─── ◈\n\n◯ تـم شـراء خـلـفـية فـاخـرة بـنـجـاح.\n💰 الـسـعر: 1000$\n◉ الـنـوع: ${query}\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑\n◈ ──────────────── ◈`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("⚠️ سيدي، حدث خطأ أثناء الاتصال بالخزائن العالمية، لم يتم خصم أي مبلغ منك.", threadID, messageID);
  }
};
