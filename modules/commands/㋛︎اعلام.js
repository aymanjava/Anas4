const fs = require('fs');
const axios = require('axios');

module.exports.config = {
  name: "اعلام",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "لعبة احزر العلم - النسخة الملكية المزخرفة والشاملة",
  usages: ["اعلام"],
  commandCategory: "فئة الألعاب",
  cooldowns: 5
};

const tempImageFilePath = __dirname + "/cache/temp_flag.jpg";

module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {
  const { senderID, body, threadID } = event;
  const userAnswer = body.trim();
  const correctAnswer = handleReply.correctAnswer;
  const userName = await Users.getNameUser(senderID);

  if (userAnswer === correctAnswer) {
      await Currencies.increaseMoney(senderID, 100);
      const msg = {
        body: `╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n🎉 تهانينا يا: ${userName}\n✅ إجابتك صحيحة ومذهلة\n🌍 الدولة: ${correctAnswer}\n💰 الجائزة: 100 دولار\n\n╰──────────────╯`
      };
      api.sendMessage(msg, threadID);
      api.unsendMessage(handleReply.messageID);
  } else {
      api.sendMessage(`❌ خطأ في التخمين يا ${userName}.. حاول مرة أخرى`, threadID);
  }
};

module.exports.run = async function ({ api, event }) {
  const questions = [
    // --- دول عربية ---
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Flag_of_Iraq.svg/1200px-Flag_of_Iraq.svg.png", answer: "العراق" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/1200px-Flag_of_Saudi_Arabia.svg.png", answer: "السعودية" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Egypt.svg/1200px-Flag_of_Egypt.svg.png", answer: "مصر" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_Palestine.svg/1200px-Flag_of_Palestine.svg.png", answer: "فلسطين" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flag_of_Morocco.svg/1200px-Flag_of_Morocco.svg.png", answer: "المغرب" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_Algeria.svg/1200px-Flag_of_Algeria.svg.png", answer: "الجزائر" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Tunisia.svg/1200px-Flag_of_Tunisia.svg.png", answer: "تونس" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_the_United_Arab_Emirates.svg/1200px-Flag_of_the_United_Arab_Emirates.svg.png", answer: "الامارات" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/1200px-Flag_of_Jordan.svg.png", answer: "الاردن" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Flag_of_Yemen.svg/1200px-Flag_of_Yemen.svg.png", answer: "اليمن" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_Qatar.svg/1200px-Flag_of_Qatar.svg.png", answer: "قطر" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Flag_of_Kuwait.svg/1200px-Flag_of_Kuwait.svg.png", answer: "الكويت" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flag_of_Oman.svg/1200px-Flag_of_Oman.svg.png", answer: "عمان" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Flag_of_Bahrain.svg/1200px-Flag_of_Bahrain.svg.png", answer: "البحرين" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Libya.svg/1200px-Flag_of_Libya.svg.png", answer: "ليبيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Flag_of_Syria.svg/1200px-Flag_of_Syria.svg.png", answer: "سوريا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Sudan.svg/1200px-Flag_of_Sudan.svg.png", answer: "السودان" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Flag_of_Lebanon.svg/1200px-Flag_of_Lebanon.svg.png", answer: "لبنان" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_Somalia.svg/1200px-Flag_of_Somalia.svg.png", answer: "الصومال" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Flag_of_Mauritania.svg/1200px-Flag_of_Mauritania.svg.png", answer: "موريتانيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Flag_of_Djibouti.svg/1200px-Flag_of_Djibouti.svg.png", answer: "جيبوتي" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_the_Comoros.svg/1200px-Flag_of_the_Comoros.svg.png", answer: "جزر القمر" },

    // --- دول آسيوية وأوروبية وعالمية مضافة ---
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/1200px-Flag_of_Germany.svg.png", answer: "المانيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/1200px-Flag_of_France.svg.png", answer: "فرنسا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/1200px-Flag_of_Italy.svg.png", answer: "ايطاليا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/1200px-Flag_of_Japan.svg.png", answer: "اليابان" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/1200px-Flag_of_the_United_States.svg.png", answer: "امريكا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/1200px-Flag_of_Turkey.svg.png", answer: "تركيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1200px-Flag_of_Russia.svg.png", answer: "روسيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/1200px-Flag_of_Brazil.svg.png", answer: "البرازيل" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/1200px-Flag_of_Spain.svg.png", answer: "اسبانيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Flag_of_England.svg/1200px-Flag_of_England.svg.png", answer: "بريطانيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png", answer: "الهند" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1200px-Flag_of_the_People%27s_Republic_of_China.svg.png", answer: "الصين" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Flag_of_Kazakhstan.svg/1200px-Flag_of_Kazakhstan.svg.png", answer: "كازاخستان" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Pakistan.svg/1200px-Flag_of_Pakistan.svg.png", answer: "باكستان" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/1200px-Flag_of_South_Korea.svg.png", answer: "كوريا الجنوبية" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Flag_of_North_Korea.svg/1200px-Flag_of_North_Korea.svg.png", answer: "كوريا الشمالية" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Canada.svg/1200px-Flag_of_Canada.svg.png", answer: "كندا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Mexico.svg/1200px-Flag_of_Mexico.svg.png", answer: "المكسيك" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Flag_of_Australia.svg/1200px-Flag_of_Australia.svg.png", answer: "استراليا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Flag_of_New_Zealand.svg/1200px-Flag_of_New_Zealand.svg.png", answer: "نيوزيلندا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Canada.svg/1200px-Flag_of_Canada.svg.png", answer: "كندا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_Argentina.svg/1200px-Flag_of_Argentina.svg.png", answer: "الارجنتين" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Uruguay.svg/1200px-Flag_of_Uruguay.svg.png", answer: "اوروغواي" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Flag_of_Chile.svg/1200px-Flag_of_Chile.svg.png", answer: "تشيلي" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/1200px-Flag_of_Colombia.svg.png", answer: "كولومبيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Flag_of_Venezuela.svg/1200px-Flag_of_Venezuela.svg.png", answer: "فنزويلا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/1200px-Flag_of_France.svg.png", answer: "فرنسا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Flag_of_Poland.svg/1200px-Flag_of_Poland.svg.png", answer: "بولندا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Flag_of_Albania.svg/1200px-Flag_of_Albania.svg.png", answer: "البانيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Norway.svg/1200px-Flag_of_Norway.svg.png", answer: "النرويج" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Flag_of_Sweden.svg/1200px-Flag_of_Sweden.svg.png", answer: "السويد" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Flag_of_Denmark.svg/1200px-Flag_of_Denmark.svg.png", answer: "الدنمارك" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Flag_of_Finland.svg/1200px-Flag_of_Finland.svg.png", answer: "فنلندا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Flag_of_Switzerland.svg/1200px-Flag_of_Switzerland.svg.png", answer: "سويسرا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/1200px-Flag_of_Austria.svg.png", answer: "النمسا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Flag_of_Greece.svg/1200px-Flag_of_Greece.svg.png", answer: "اليونان" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Portugal.svg/1200px-Flag_of_Portugal.svg.png", answer: "البرتغال" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_Belgium.svg/1200px-Flag_of_Belgium.svg.png", answer: "بلجيكا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Flag_of_the_Netherlands.svg/1200px-Flag_of_the_Netherlands.svg.png", answer: "هولندا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Flag_of_Jamaica.svg/1200px-Flag_of_Jamaica.svg.png", answer: "جامايكا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Senegal.svg/1200px-Flag_of_Senegal.svg.png", answer: "السنغال" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Flag_of_Nigeria.svg/1200px-Flag_of_Nigeria.svg.png", answer: "نيجيريا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Flag_of_South_Africa.svg/1200px-Flag_of_South_Africa.svg.png", answer: "جنوب افريقيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/1200px-Flag_of_Ghana.svg.png", answer: "غانا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_Ethiopia.svg/1200px-Flag_of_Ethiopia.svg.png", answer: "اثيوبيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Flag_of_Kenya.svg/1200px-Flag_of_Kenya.svg.png", answer: "كينيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Thailand.svg/1200px-Flag_of_Thailand.svg.png", answer: "تايلاند" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Indonesia.svg/1200px-Flag_of_Indonesia.svg.png", answer: "اندونيسيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Flag_of_Iran.svg/1200px-Flag_of_Iran.svg.png", answer: "ايران" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Flag_of_Iceland.svg/1200px-Flag_of_Iceland.svg.png", answer: "ايسلندا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Flag_of_Croatia.svg/1200px-Flag_of_Croatia.svg.png", answer: "كرواتيا" },
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Flag_of_Bermuda.svg/1200px-Flag_of_Bermuda.svg.png", answer: "برمودا" }
    // ... يمكن إضافة المزيد بسهولة بنفس الصيغة
  ];

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  
  try {
    const res = await axios.get(randomQuestion.image, { responseType: "arraybuffer" });
    fs.writeFileSync(tempImageFilePath, Buffer.from(res.data, "binary"));

    const msg = {
      body: `╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n🌍 ما هو اسم علم هذه الدولة؟\n\n╰──────────────╯\n💡 قم بالرد على الصورة بالإجابة`,
      attachment: fs.createReadStream(tempImageFilePath)
    };

    return api.sendMessage(msg, event.threadID, (error, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            correctAnswer: randomQuestion.answer
        });
    });
  } catch (e) {
    return api.sendMessage("⚠️ عذراً، تعذر جلب الصورة.. حاول مرة أخرى.", event.threadID);
  }
};
