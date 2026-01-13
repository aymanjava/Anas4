const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');

module.exports.config = {
  name: "اعلام",
  version: "3.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "لعبة احزر العلم - نسخة هبة المستقرة",
  usages: ["اعلام"],
  commandCategory: "فئة الألعاب",
  cooldowns: 5
};

const cacheDir = path.join(__dirname, 'cache');
const tempImg = path.join(cacheDir, 'flag_game.jpg');

module.exports.handleReply = async function ({ api, event, handleReply, Currencies }) {
  const { senderID, body, threadID, messageID } = event;
  
  // التحقق من الإجابة
  if (body.trim() === handleReply.correctAnswer) {
      await Currencies.increaseMoney(senderID, 100);
      
      api.sendMessage(`╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n✅ إجابة صحيحة مذهلة!\n🌍 الدولة: ${handleReply.correctAnswer}\n💰 الجائزة: 100 دولار\n\n╰──────────────╯`, threadID, messageID);
      
      // حذف رسالة السؤال وحذف الكاش
      api.unsendMessage(handleReply.messageID);
      if (fs.existsSync(tempImg)) fs.unlinkSync(tempImg);
  } else {
      api.sendMessage(`❌ خطأ في التخمين.. حاول مرة أخرى!`, threadID, messageID);
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  // قائمة الأعلام (روابط مباشرة وسريعة)
  const questions = [
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Flag_of_Iraq.svg/800px-Flag_of_Iraq.svg.png", answer: "العراق" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/800px-Flag_of_Saudi_Arabia.svg.png", answer: "السعودية" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Egypt.svg/800px-Flag_of_Egypt.svg.png", answer: "مصر" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_Palestine.svg/800px-Flag_of_Palestine.svg.png", answer: "فلسطين" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flag_of_Morocco.svg/800px-Flag_of_Morocco.svg.png", answer: "المغرب" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_Algeria.svg/800px-Flag_of_Algeria.svg.png", answer: "الجزائر" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Tunisia.svg/800px-Flag_of_Tunisia.svg.png", answer: "تونس" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_the_United_Arab_Emirates.svg/800px-Flag_of_the_United_Arab_Emirates.svg.png", answer: "الامارات" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/800px-Flag_of_Germany.svg.png", answer: "المانيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/800px-Flag_of_France.svg.png", answer: "فرنسا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/800px-Flag_of_Japan.svg.png", answer: "اليابان" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/800px-Flag_of_the_People%27s_Republic_of_China.svg.png", answer: "الصين" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/800px-Flag_of_the_United_States.svg.png", answer: "امريكا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/800px-Flag_of_Turkey.svg.png", answer: "تركيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/800px-Flag_of_Brazil.svg.png", answer: "البرازيل" }
  ];

  const randomQ = questions[Math.floor(Math.random() * questions.length)];

  try {
    // التأكد من وجود مجلد الكاش
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const response = await axios.get(randomQ.image, { responseType: "arraybuffer" });
    fs.writeFileSync(tempImg, Buffer.from(response.data, "binary"));

    return api.sendMessage({
      body: "╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n🌍 ما هو اسم علم هذه الدولة؟\n\n╰──────────────╯\n💡 قم بالرد على هذه الرسالة بالإجابة!",
      attachment: fs.createReadStream(tempImg)
    }, threadID, (err, info) => {
      if (err) return console.error(err);
      
      // تسجيل الرد (HandleReply)
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        correctAnswer: randomQ.answer
      });
    }, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("⚠️ عذراً، فشل تحميل صورة العلم.", threadID);
  }
};
