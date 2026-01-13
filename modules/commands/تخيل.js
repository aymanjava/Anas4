const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "تخيلي",
    version: "2.5.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "توليد صور بالذكاء الاصطناعي بأوامر التوب",
    commandCategory: "صور",
    usages: "[النص] [رقم الأسلوب 1-20] [الحجم 1-3]",
    cooldowns: 15
};

module.exports.run = async function ({ api, event, args, Currencies }) {
    const { threadID, messageID, senderID } = event;
    const reward = 10; // منحة تقشفية للصور الفخمة

    if (args.length < 1) {
        return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ سيدي، يرجى كتابة ما تريد تخيله.\nمثال: .تخيلي رجل فضاء 1 1\n\n◈ ──────────────── ◈", threadID, messageID);
    }

    try {
        // تحديد الأسلوب والحجم (افتراضياً 1)
        let rto = args.pop(); 
        let style = args.pop();
        let prompt = args.join(" ");

        // التأكد من أن المدخلات أرقام، وإلا نعتبرها جزءاً من النص
        if (isNaN(rto)) {
            prompt += " " + style + " " + rto;
            style = 1;
            rto = 1;
        } else if (isNaN(style)) {
            prompt += " " + style;
            style = rto;
            rto = 1;
        }

        api.sendMessage("🕟 | جاري استحضار الخيال الإمبراطوري.. انتظر سيدي.", threadID, messageID);

        // الترجمة التلقائية للإنجليزية لضمان دقة الـ API
        const translation = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
        const enPrompt = translation.data[0][0][0];

        const res = await axios.post("https://app-dodogen-835c6bdca048.herokuapp.com/gen", {
            prompt: enPrompt,
            sty: style || 1,
            rto: rto || 1
        });

        const images = res.data.url;
        const attachment = [];
        const cacheDir = path.join(__dirname, 'cache', `imagine_${senderID}`);
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

        for (let i = 0; i < images.length; i++) {
            const imgPath = path.join(cacheDir, `${i}.jpg`);
            const imgRes = await axios.get(images[i], { responseType: 'arraybuffer' });
            await fs.outputFile(imgPath, imgRes.data);
            attachment.push(fs.createReadStream(imgPath));
        }

        await Currencies.increaseMoney(senderID, reward);

        let msg = `◈ ───『 الـخـيال الإمـبـراطـوري 』─── ◈\n\n` +
                  `✨ الـتـخـيل: ${prompt}\n` +
                  `🎨 الأسـلوب: ${style} | 📐 الـحـجم: ${rto}\n\n` +
                  `💰 مـنـحـة الإبداع: +${reward}$\n` +
                  ` ———————————————\n` +
                  `│←› الـقـيـصر: الـتـوب ايـمـن 👑\n` +
                  `◈ ──────────────── ◈`;

        return api.sendMessage({ body: msg, attachment }, threadID, () => fs.removeSync(cacheDir), messageID);

    } catch (error) {
        console.error(error);
        return api.sendMessage(`⚠️ سيدي، خوادم الخيال مشغولة حالياً، حاول لاحقاً.`, threadID, messageID);
    }
};
