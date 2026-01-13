const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "تخيل",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "توليد صور بالذكاء الاصطناعي مع مكافأة تقشفية",
  usePrefix: true,
  commandCategory: "صور",
  usages: "[النص باللغة العربية]",
  cooldowns: 15, // زيادة وقت الانتظار لمنع الضغط على النظام
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { threadID, messageID, senderID } = event;
  const query = args.join(" ");
  const reward = 8; // مكافأة زهيدة جداً (نظام التقشف الإمبراطوري)

  if (!query) {
    return api.sendMessage(`◈ ───『 تـنـبـيـه الـمـديـر 』─── ◈\n\n⚠️ سيدي، يرجى كتابة ما تريد تخيله لكي أقوم برسمه.\n\n◈ ──────────────── ◈`, threadID, messageID);
  }

  api.sendMessage(`◈ ───『 مـخـتـبـر الـتـوب 』─── ◈\n\n🎨 جاري ترجمة خيالك وتحويله إلى لوحة فنية..\n⏳ يرجى الانتظار سيدي، العظمة تستغرق وقتاً.\n\n◈ ──────────────── ◈`, threadID);

  try {
    const path = __dirname + `/cache/imagine_${senderID}.png`;

    // الترجمة التلقائية للإنجليزية لضمان أفضل جودة للذكاء الاصطناعي
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(query)}`);
    const translation = translationResponse.data[0][0][0];

    // جلب الصورة من مولد الصور المتطور
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(translation)}`, {
      responseType: "arraybuffer",
    });

    fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

    // منح المكافأة الزهيدة (نظام التقشف)
    await Currencies.increaseMoney(senderID, reward);

    let msg = `◈ ───『 الـلـوحـة الـمـلكـيـة 』─── ◈\n\n` +
              `✨ تـم تـجـسـيد خـيـالك بـنـجـاح\n` +
              `💰 مـنـحـة الـتـقـشـف: +${reward}$\n` +
              ` ———————————————\n` +
              `│←› الـمـشـرف: الـتـوب ايـمـن 👑\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("⚠️ عذراً سيدي، حدث ضغط في مخيلة الذكاء الاصطناعي، حاول مجدداً.", threadID, messageID);
  }
};
