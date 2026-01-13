const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
    name: "تخيلي",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "توليد صور احترافية بالذكاء الاصطناعي",
    commandCategory: "صور",
    usages: "[النص بالعربي أو الإنجليزي]",
    cooldowns: 15
};

module.exports.run = async function ({ api, event, args, Currencies }) {
    const { threadID, messageID, senderID } = event;
    const prompt = args.join(" ");

    if (!prompt) {
        return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ سيدي، يرجى كتابة وصف الصورة.\nمثال: .تخيلي أسد يرتدي تاج إمبراطوري\n\n◈ ──────────────── ◈", threadID, messageID);
    }

    api.sendMessage("◈ ───『 الـخـيال الإمـبـراطـوري 』─── ◈\n\n◯ جاري استحضار الرؤية.. انتظر سيدي ⏳\n———————————————\n◈ ─────────────── ◈", threadID, messageID);

    try {
        // 1. الترجمة التلقائية للإنجليزية لضمان أفضل جودة للصور
        const translation = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
        const enPrompt = translation.data[0][0][0];

        // 2. استخدام محرك توليد صور مستقر (Pollinations AI)
        const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(enPrompt)}?width=1080&height=1080&seed=${Math.floor(Math.random() * 1000)}&model=flux`;

        const pathImg = __dirname + `/cache/imagine_${senderID}.png`;
        const imageBuffer = (await axios.get(imageUrl, { responseType: 'arraybuffer' })).data;
        
        fs.writeFileSync(pathImg, Buffer.from(imageBuffer, "utf-8"));

        // 3. منح مكافأة بسيطة للإبداع
        await Currencies.increaseMoney(senderID, 50);

        let msg = `◈ ───『 نـتـيـجة الـخـيـال 』─── ◈\n\n` +
                  `✨ الـطلب: ${prompt}\n` +
                  `🎨 الـجـودة: Ultra HD\n` +
                  `💰 مـكافأة الإبداع: +50$\n` +
                  `———————————————\n` +
                  `│←› بـإشراف: الإمـبـراطـور أيـمـن 👑\n` +
                  `◈ ──────────────── ◈`;

        return api.sendMessage({
            body: msg,
            attachment: fs.createReadStream(pathImg)
        }, threadID, () => fs.unlinkSync(pathImg), messageID);

    } catch (error) {
        console.error(error);
        return api.sendMessage(`⚠️ سيدي، حدث تداخل في عوالم الخيال، يرجى المحاولة مرة أخرى.`, threadID, messageID);
    }
};
