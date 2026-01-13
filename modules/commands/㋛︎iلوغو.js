module.exports.config = {
  name: "لوغو",
  version: "2.5.0",
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

  // قائمة الأنواع المتاحة بشكل منظم
  const availableLogos = [
    "glass", "business", "wall", "aglitch", "berry", "blackpink", "blood", 
    "broken", "smoke", "carbon", "circuit", "devil", "discovery", "fiction", 
    "firework", "galaxy", "glossy", "magma", "neon", "skeleton", "sketch", 
    "stone", "fire", "naruto", "cloud", "horror", "beach", "queen", "love"
  ];

  if (args[0] === "الكل") {
    let list = "◈ ──『 الأنـواع الـمـتـاحـة 🎨 』── ◈\n\n";
    availableLogos.forEach((item, index) => { list += `【 ${index + 1} 】${item}\n`; });
    list += "\n💡 طـريـقـة الاسـتـخـدام:\nلوغو [النوع] [إسمك]";
    return api.sendMessage(list, threadID, messageID);
  }

  if (args.length < 2) {
    return api.sendMessage("◈ ──『 تـنـبـيـه 』── ◈\n\n⚠️ يرجى كتابة النوع ثم الإسم بالإنجليزية.\nمثال: لوغو smoke Ayman\n\n◯ لعرض الأنواع اكتب: لوغو الكل", threadID, messageID);
  }

  let type = args[0].toLowerCase();
  let text = args.slice(1).join(" ");
  let pathImg = __dirname + `/cache/logo_${senderID}.png`;
  let apiUrl, logoMessage;

  // تنظيف النص للاستخدام في الروابط
  let encodedText = encodeURIComponent(text);

  switch (type) {
    case "smoke":
      apiUrl = `https://api.lolhuman.xyz/api/photooxy1/smoke?apikey=0a637f457396bf3dcc21243b&text=${encodedText}`;
      logoMessage = "𝑺𝑴𝑶𝑲𝑬";
      break;
    case "glass":
      apiUrl = `https://rest-api-001.faheem001.repl.co/api/textpro?number=4&text=${encodedText}`;
      logoMessage = "𝑮𝑳𝑨𝑺𝑺";
      break;
    case "galaxy":
      apiUrl = `https://rest-api-001.faheem001.repl.co/api/textpro?number=173&text=${encodedText}`;
      logoMessage = "𝑮𝑨𝑳𝑨𝑿𝒀";
      break;
    case "fire":
      apiUrl = `https://api.lolhuman.xyz/api/photooxy1/flaming?apikey=0a637f457396bf3dcc21243b&text=${encodedText}`;
      logoMessage = "𝑭𝑰𝑹𝑬";
      break;
    case "naruto":
      apiUrl = `https://rest-api-2.faheem007.repl.co/api/photooxy/naruto?text=${encodedText}`;
      logoMessage = "𝑵𝑨𝑹𝑼𝑻𝑶";
      break;
    case "neon":
      apiUrl = `https://api.lolhuman.xyz/api/textpro/neon?apikey=0a637f457396bf3dcc21243b&text=${encodedText}`;
      logoMessage = "𝑵𝑬𝑶𝑵";
      break;
    default:
      // إذا كان النوع غير موجود في السويتش، نستخدم رابط افتراضي يعمل
      apiUrl = `https://api.lolhuman.xyz/api/textpro/glitch?apikey=0a637f457396bf3dcc21243b&text=${encodedText}`;
      logoMessage = "𝑮𝑳𝑰𝑻𝑪𝑯";
  }

  api.sendMessage("◈ ──『 جـاري الإنـشـاء.. 🎨 』── ◈\n\n⌛ يـرجى الانـتـظار قـليلاً سـيـدي..", threadID, messageID);

  try {
    let response = await axios.get(apiUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(pathImg, Buffer.from(response.data, "utf-8"));

    return api.sendMessage({
      body: `◈ ──『 تـم الإنـشـاء بـنـجـاح ✅ 』── ◈\n\n◯ نـوع الـلوغـو: [ ${logoMessage} ]\n◯ الإسـم: ${text}\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (e) {
    console.error(e);
    return api.sendMessage("⚠️ عذراً سيدي، السيرفر المولد لهذه الصورة متوقف حالياً، جرب نوعاً آخر.", threadID, messageID);
  }
};
