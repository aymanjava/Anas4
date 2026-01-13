module.exports.config = {
  name: "بنترست",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "البحث عن صور في بنترست بجودة عالية للإمبراطور",
  commandCategory: "خدمات",
  usages: "[الكلمة] - [العدد]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const request = require("request");
    const { threadID, messageID, senderID } = event;

    // 1️⃣ استخراج النص والعدد
    const content = args.join(" ").split("-");
    const name = content[0]?.trim();
    const number = parseInt(content[1]) || 6; // القيمة الافتراضية 6 صور

    if (!name) return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n◯ سيدي، يرجى كتابة ما تبحث عنه.\n◉ مـثال: بنترست انمي - 5\n———————————————\n◈ ─────────────── ◈", threadID, messageID);

    // 2️⃣ التفاعل على الرسالة لبدء الانتظار
    api.setMessageReaction("⏳", messageID, (err) => {}, true);

    var headers = {
        'authority': 'www.pinterest.com',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    };

    var options = {
        url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(name)}`,
        headers: headers
    };

    request(options, async function (error, response, body) {
        if (error || response.statusCode != 200) {
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            return api.sendMessage("⚠️ سيدي، حدث خطأ أثناء الوصول إلى خزائن بنترست.", threadID, messageID);
        }

        try {
            const arrMatch = body.match(/https:\/\/i\.pinimg\.com\/originals\/[^.]+\.jpg/g);
            if (!arrMatch || arrMatch.length == 0) {
                api.setMessageReaction("❓", messageID, (err) => {}, true);
                return api.sendMessage("◯ سيدي، لم أجد صوراً تطابق هذا الوصف.", threadID, messageID);
            }

            const imgabc = [];
            const limit = Math.min(number, 10, arrMatch.length); // الحد الأقصى 10 صور للحفاظ على السرعة

            for (let i = 0; i < limit; i++) {
                const stream = (await axios.get(arrMatch[i], { responseType: "stream" })).data;
                imgabc.push(stream);
            }

            const msg = {
                body: `◈ ───『 نـتـائـج بـنـتـرسـت 』─── ◈\n\n◯ الـبـحث: ${name}\n◉ الـعـدد: ${limit} صـور\n———————————————\n◯ تـم جـلـب الـصور بـنـجاح سـيـدي.\n———————————————\n◈ ─────────────── ◈\n│←› بـأوامـر: الـتـوب أيـمـن 👑`,
                attachment: imgabc
            };

            api.setMessageReaction("✅", messageID, (err) => {}, true);
            return api.sendMessage(msg, threadID, messageID);

        } catch (e) {
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            return api.sendMessage("⚠️ حدث خطأ أثناء معالجة الصور سيدي.", threadID, messageID);
        }
    });
};
