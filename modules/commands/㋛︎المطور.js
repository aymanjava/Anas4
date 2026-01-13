const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "مطور",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "Gemini",
  description: "عرض معلومات المطور مع ميزة التبديل التلقائي في حال فشل الـ GIF",
  commandCategory: "نظام",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  // البيانات الخاصة بكِ
  const gifUrl = "https://i.imgur.com/nSNo5mR.gif"; 
  const devName = "『 ايمن 』"; 
  const devFB = "https://www.facebook.com/xvk1c"; 
  const devTele = "@X2_FD"; 
  const status = "مـتـوفـر لـلـمـسـاعـدة ✨";

  const msg = "╭─────────────╮\n" +
              "    💎 مـعـلـومـات الـمـطـور 💎\n" +
              "╰─────────────╯\n" +
              `🔳 الـمـطور: ${devName}\n` +
              `🔳 الـحـالـة: ${status}\n\n` +
              `🔳 الـفـيـسـبـوك:\n${devFB}\n\n` +
              `🔳 تـلـيـجـرام: ${devTele}\n` +
              "╰─────────────╯\n" +
              "✨『 صُـنـع بـكـل حـب لـخـدمـتـكـم 』";

  const path = __dirname + `/cache/dev_animation.gif`;

  try {
    // محاولة تحميل وإرسال الـ GIF
    const response = await axios.get(gifUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(path)
    }, threadID, () => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    }, messageID);

  } catch (error) {
    // في حال فشل الـ GIF لأي سبب، يتم إرسال المعلومات النصية فقط
    console.error("فشل إرسال الـ GIF، يتم إرسال النص فقط:", error.message);
    if (fs.existsSync(path)) fs.unlinkSync(path); // تنظيف الكاش إذا وُجد الملف
    
    return api.sendMessage(msg, threadID, messageID);
  }
};
