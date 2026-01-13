const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');

module.exports.config = {
  name: "اعلام",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "لعبة احزر العلم - نسخة هبة المستقرة مع 40 علم",
  usages: ["اعلام"],
  commandCategory: "فئة الألعاب",
  cooldowns: 5
};

const cacheDir = path.join(__dirname, 'cache');
const tempImg = path.join(cacheDir, 'flag_game.jpg');

module.exports.handleReply = async function ({ api, event, handleReply, Currencies }) {
  const { senderID, body, threadID, messageID } = event;
  
  if (body.trim() === handleReply.correctAnswer) {
      await Currencies.increaseMoney(senderID, 100);
      api.sendMessage(`╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n✅ إجابة صحيحة!\n🌍 الدولة: ${handleReply.correctAnswer}\n💰 الجائزة: 100 دولار\n\n╰──────────────╯`, threadID, messageID);
      
      api.unsendMessage(handleReply.messageID);
      if (fs.existsSync(tempImg)) fs.unlinkSync(tempImg);
  } else {
      api.sendMessage(`❌ خطأ في التخمين.. حاول مرة أخرى!`, threadID, messageID);
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  const questions = [
    { image: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Flag_of_Iraq.svg", answer: "العراق" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg", answer: "السعودية" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Egypt.svg", answer: "مصر" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/0/00/Flag_of_Palestine.svg", answer: "فلسطين" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Flag_of_Morocco.svg", answer: "المغرب" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_Algeria.svg", answer: "الجزائر" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_Tunisia.svg", answer: "تونس" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg", answer: "الامارات" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg", answer: "المانيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg", answer: "فرنسا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg", answer: "اليابان" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg", answer: "الصين" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg", answer: "امريكا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg", answer: "تركيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg", answer: "البرازيل" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Canada.svg", answer: "كندا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Flag_of_India.svg", answer: "الهند" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Australia.svg", answer: "استراليا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/1/12/Flag_of_Mexico.svg", answer: "المكسيك" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Spain.svg", answer: "اسبانيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Italy.svg", answer: "ايطاليا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Flag_of_Russia.svg", answer: "روسيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_UK.svg", answer: "انجلترا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/3/36/Flag_of_South_Africa.svg", answer: "جنوب افريقيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Flag_of_Singapore.svg", answer: "سنغافورة" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_South_Korea.svg", answer: "كوريا الجنوبية" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Flag_of_Nigeria.svg", answer: "نيجيريا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Flag_of_Argentina.svg", answer: "الارجنتين" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/8/84/Flag_of_Ethiopia.svg", answer: "اثيوبيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Flag_of_Kenya.svg", answer: "كينيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Pakistan.svg", answer: "باكستان" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/3/32/Flag_of_Bangladesh.svg", answer: "بنغلاديش" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/9/99/Flag_of_Thailand.svg", answer: "تايلاند" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Flag_of_Malaysia.svg", answer: "ماليزيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/3/31/Flag_of_Vietnam.svg", answer: "فيتنام" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Flag_of_Netherlands.svg", answer: "هولندا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/2/27/Flag_of_Belgium.svg", answer: "بلجيكا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Sweden.svg", answer: "السويد" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Flag_of_Norway.svg", answer: "النرويج" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Finland.svg", answer: "فنلندا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Greece.svg", answer: "اليونان" }
  ];

  const randomQ = questions[Math.floor(Math.random() * questions.length)];

  try {
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const response = await axios.get(randomQ.image, { responseType: "arraybuffer" });
    fs.writeFileSync(tempImg, Buffer.from(response.data, "binary"));

    return api.sendMessage({
      body: "╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n🌍 ما هو اسم علم هذه الدولة؟\n\n╰──────────────╯\n💡 قم بالرد على هذه الرسالة بالإجابة!",
      attachment: fs.createReadStream(tempImg)
    }, threadID, (err, info) => {
      if (err) return console.error(err);
      
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
