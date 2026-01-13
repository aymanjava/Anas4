module.exports.config = {
  name: "ترجمه",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "مـترجم الإمبراطورية العظيم (بالرد أو بالكتابة)",
  commandCategory: "خدمات",
  usages: "[النص / بالرد على رسالة]",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const { threadID, messageID, type, messageReply } = event;

  let translateThis = args.join(" ");
  
  // 1️⃣ دعم الرد على الرسالة
  if (type == "message_reply") {
    translateThis = messageReply.body;
  }

  // 2️⃣ التحقق من وجود نص
  if (!translateThis) {
    return api.sendMessage(`◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ سيدي، يرجى كتابة النص أو الرد على رسالة لترجمتها.\n———————————————\n◈ ─────────────── ◈`, threadID, messageID);
  }

  try {
    // 3️⃣ استدعاء مترجم جوجل (تلقائي إلى العربية)
    const res = await axios.get(encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${translateThis}`));
    
    let text = '';
    res.data[0].forEach(item => (item[0]) ? text += item[0] : '');
    let fromLang = res.data[2]; // اللغة الأصلية

    // 4️⃣ الرد بالزخرفة الإمبراطورية
    return api.sendMessage(`◈ ───『 مـتـرجم الـعـالـم 』─── ◈\n\n` +
                           `◯ الـنـص الأصـلي :\n${translateThis}\n` +
                           `———————————————\n` +
                           `◯ الـتـرجـمـة الـعـربـيـة :\n${text}\n` +
                           `———————————————\n` +
                           `◉ مـن لـغـة : ${fromLang.toUpperCase()}\n` +
                           `◉ إلـى لـغـة : ARABIC\n` +
                           `———————————————\n` +
                           `◈ ─────────────── ◈\n` +
                           `│←› بـأوامـر: الإمـبـراطـور أيـمـن 👑`, threadID, messageID);

  } catch (err) {
    return api.sendMessage("⚠️ سيدي، حدث تداخل في اللغات، المترجم لا يستجيب حالياً.", threadID, messageID);
  }
}
