module.exports.config = {
  name: "رعب",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "يقترح أفلام رعب عشوائية مع البوستر الخاص بها",
  commandCategory: "افلام",
  usages: " ",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID } = event;

  // قائمة الأفلام (سيتم جلب صورها تلقائياً)
  const horrorMovies = [
    "Scream 2022", "The Conjuring 2013", "The Shining 1980", "Misery 1990", 
    "The Exorcist 1973", "The Mist 2007", "Friday the 13th 2009", 
    "A Nightmare on Elm Street 1984", "Texas Chainsaw Massacre 2022", 
    "The Ring 2002", "A Quiet Place 2018", "Jigsaw 2017", "IT 2017", 
    "Child's Play 1988", "Slender Man 2018", "Brightburn 2019", 
    "The Purge 2013", "Happy Death Day 2017", "Wrong Turn 2003", 
    "Saw X", "Evil Dead Rise", "Barbarian 2022", "Insidious 2023"
  ];

  const movie = horrorMovies[Math.floor(Math.random() * horrorMovies.length)];
  
  // استخدام API لجلب بوستر الفيلم بناءً على الاسم (بحث تلقائي لا نهائي)
  const imageUrl = `https://api.popcat.xyz/movie?title=${encodeURIComponent(movie)}`;

  api.sendMessage("🎬 جاري البحث في أرشيف الأفلام المرعبة...", threadID, messageID);

  try {
    const response = await axios.get(imageUrl);
    const movieData = response.data;

    // إذا لم يجد صورة، نستخدم صورة رعب افتراضية أو رابط مباشر
    const imageToDownload = movieData.poster || "https://i.pinimg.com/originals/ce/1f/d9/ce1fd9c1a33c49b1bc8a2191dd0a5dc.jpg";
    
    const path = __dirname + `/cache/horror_${Date.now()}.jpg`;
    const imageResponse = await axios.get(imageToDownload, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(imageResponse.data, "utf-8"));

    let msg = `┏━━━━━━ 💀 ━━━━━━┓\n   سِـيـنـمـا الـرعـب\n┗━━━━━━ 💀 ━━━━━━┛\n\n` +
              `📽️ الـفـيـلـم: ${movieData.title || movie}\n` +
              `📅 الـسـنـة: ${movieData.year || "غير محدد"}\n` +
              `⭐️ الـتـقـيـيـم: ${movieData.rating || "???"}/10\n` +
              `📝 الـقـصـة: ${movieData.plot ? "تم العثور على التفاصيل" : "استعد للمفاجأة..."}\n\n` +
              `💀 نـصـيـحـة: لا تـشـاهـد وحـدك!`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (error) {
    return api.sendMessage(`👻 جرب هذا الفيلم: ${movie}\n(تعذر جلب البوستر حالياً، حاول مجدداً)`, threadID, messageID);
  }
};
