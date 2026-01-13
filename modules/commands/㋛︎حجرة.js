module.exports.config = {
  name: "مقص",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "لعبة حجر ورقة مقص مع رهان مالي",
  commandCategory: "العاب",
  usages: "[حجر/ورقة/مقص] [مبلغ الرهان]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Currencies }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID, senderID } = event;
  
  // جلب بيانات المال
  const userData = await Currencies.getData(senderID);
  const moneyUser = userData.money;

  // القوائم الأساسية
  const items = ["مقص", "حجر", "ورقة"];
  const icons = ["✌️", "👊", "✋"];
  const images = [
    "https://i.imgur.com/2WSbVaK.jpg", // مقص
    "https://i.imgur.com/EOZx1tL.jpg", // حجر
    "https://i.imgur.com/1uBAGlO.jpg"  // ورقة
  ];

  // التحقق من المدخلات
  let userChoice = args[0];
  let betAmount = parseInt(args[1]);

  if (!userChoice || !items.includes(userChoice)) {
    return api.sendMessage("⚠️ سيدي، يجب أن تختار: [حجر أو ورقة أو مقص]\nمثال: مقص 100", threadID, messageID);
  }
  if (isNaN(betAmount) || betAmount < 50) {
    return api.sendMessage("⚠️ أقل مبلغ للرهان هو 50$ سيدي!", threadID, messageID);
  }
  if (betAmount > moneyUser) {
    return api.sendMessage(`⚠️ رصيدك الحالي (${moneyUser}$) لا يكفي لهذا الرهان!`, threadID, messageID);
  }

  // اختيار البوت
  const botChoiceIndex = Math.floor(Math.random() * 3);
  const botChoice = items[botChoiceIndex];
  const userChoiceIndex = items.indexOf(userChoice);

  let result = "";
  let status = 0; // 0: تعادل, 1: فوز, 2: خسارة

  if (userChoice === botChoice) {
    result = "🤝 الـنـتـيـجـة: تـعـادل!";
    status = 0;
  } else if (
    (userChoice === "حجر" && botChoice === "مقص") ||
    (userChoice === "ورقة" && botChoice === "حجر") ||
    (userChoice === "مقص" && botChoice === "ورقة")
  ) {
    result = `🎉 الـنـتـيـجـة: فـوز سـاحـق!\n💰 لـقد ربـحت: ${betAmount}$`;
    status = 1;
    await Currencies.increaseMoney(senderID, betAmount);
  } else {
    result = `💀 الـنـتـيـجـة: خـسـارة..\n💸 لـقد فـقـدت: ${betAmount}$`;
    status = 2;
    await Currencies.decreaseMoney(senderID, betAmount);
  }

  // تجهيز الصورة
  const path = __dirname + `/cache/rps_${senderID}.png`;
  const imgURL = images[botChoiceIndex]; // عرض ما اختاره البوت
  
  try {
    const response = await axios.get(imgURL, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

    const finalMsg = `┏━━━━━ 🎮 ━━━━━┓\n   حـجر ورقة مـقـص\n┗━━━━━ 🎮 ━━━━━┛\n\n` +
                     `👤 أنـت: ${icons[userChoiceIndex]} (${userChoice})\n` +
                     `🤖 الـبوت: ${icons[botChoiceIndex]} (${botChoice})\n` +
                     `————————————————\n` +
                     `${result}\n\n` +
                     `📊 رصيدك الحالي: ${status === 1 ? moneyUser + betAmount : status === 2 ? moneyUser - betAmount : moneyUser}$`;

    return api.sendMessage({
      body: finalMsg,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (e) {
    return api.sendMessage(`${result}\n(ملاحظة: تعذر تحميل الصورة حالياً)`, threadID, messageID);
  }
};
