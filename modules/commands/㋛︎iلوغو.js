module.exports.config = {
  name: "لوغو",
  version: "2.6.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "إنشاء شعارات احترافية (لوغو) باسمك",
  commandCategory: "صور",
  usages: "[النوع] [الإسم بالإنجليزية]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  let { messageID, senderID, threadID } = event;

  // قائمة الأنواع المتاحة
  const availableLogos = [
    "glass", "business", "wall", "aglitch", "berry", "blackpink", "blood", 
    "broken", "smoke", "carbon", "circuit", "devil", "discovery", "fiction", 
    "firework", "galaxy", "glossy", "magma", "neon", "skeleton", "sketch", 
    "stone", "fire", "naruto", "cloud", "horror", "beach", "queen", "love"
  ];

  // عرض جميع الأنواع
  if (args[0] === "الكل") {
    let list = "◈ ──『 الأنـواع الـمـتـاحـة 🎨 』── ◈\n\n";
    availableLogos.forEach((item, index) => { list += `【 ${index + 1} 】${item}\n`; });
    list += "\n💡 طـريـقـة الاسـتـخـدام:\nلوغو [النوع] [الإسم بالإنجليزية]";
    return api.sendMessage(list, threadID, messageID);
  }

  // التأكد من إدخال النوع والاسم
  if (args.length < 2) {
    return api.sendMessage(
      "◈ ──『 تـنـبـيـه 』── ◈\n\n⚠️ يرجى كتابة النوع ثم الإسم بالإنجليزية.\nمثال: لوغو smoke YourName\n\n◯ لعرض الأنواع اكتب: لوغو الكل",
      threadID, messageID
    );
  }

  let type = args[0].toLowerCase();
  let text = args.slice(1).join(" ");
  let pathImg = __dirname + `/cache/logo_${senderID}.png`;
  let apiUrl, logoMessage;

  // ترميز النص للاستخدام في الرابط
  let encodedText = encodeURIComponent(text);

  switch (type) {
    case "smoke":
      apiUrl = `https://api.lolhuman.xyz/api/photooxy1/smoke?apikey=0a637f457396bf3dcc21243b&text=${encodedText}`;
      logoMessage = "SMOKE";
      break;
    case "glass":
      apiUrl = `https://rest-api-001.faheem001.repl.co/api/textpro?number=4&text=${encodedText}`;
      logoMessage = "GLASS";
      break;
    case "galaxy":
      apiUrl = `https://rest-api-001.faheem001.repl.co/api/textpro?number=173&text=${encodedText}`;
      logoMessage = "GALAXY";
      break;
    case "fire":
      apiUrl = `https://api.lolhuman.xyz/api/photooxy1/flaming?apikey=0a637f457396bf3dcc21243b&text=${encodedText}`;
      logoMessage = "FIRE";
      break;
    case "naruto":
      apiUrl = `https://rest-api-2.faheem007.repl.co/api/photooxy/naruto?text=${encodedText}`;
      logoMessage = "NARUTO";
      break;
    case "neon":
      apiUrl = `https://api.lolhuman.xyz/api/textpro/neon?apikey=0a637f457396bf3dcc21243b&text=${encodedText}`;
      logoMessage = "NEON";
      break;
    default:
      apiUrl = `https://api.lolhuman.xyz/api/textpro/glitch?apikey=0a637f457396bf3dcc21243b&text=${encodedText}`;
      logoMessage = "GLITCH";
  }

  api.sendMessage("◈ ──『 جـاري الإنـشـاء.. 🎨 』── ◈\n\n⌛ يرجى الانتظار قليلاً...", threadID, messageID);

  try {
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(pathImg, Buffer.from(response.data, "utf-8"));

    return api.sendMessage({
      body: `◈ ──『 تم الإنشاء بنجاح ✅ 』── ◈\n\n◯ نوع اللوغو: [ ${logoMessage} ]\n◯ الاسم: ${text}`,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (e) {
    console.error(e);
    return api.sendMessage("⚠️ عذراً، السيرفر المولد لهذه الصورة متوقف حالياً، جرب نوعاً آخر.", threadID, messageID);
  }
};
