const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
    name: "لفل",
    version: "25.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "عرض مستوى تفاعلك بطريقة احترافية",
    commandCategory: "النظام",
    usePrefix: true,
    cooldowns: 10
};

module.exports.run = async ({ event, api, Currencies, Users }) => {
    const { threadID, messageID, senderID } = event;
    const pathImg = __dirname + `/cache/rank_${senderID}.png`;

    api.sendMessage("📊 جاري تحليل تفاعلك وتصميم البطاقة... [ ⏳ ]", threadID, async (err, info) => {
        try {
            // جلب بيانات الترتيب والخبرة
            let all = await Currencies.getAll(["userID", "exp"]);
            all.sort((a, b) => b.exp - a.exp);
            const rank = all.findIndex(i => i.userID == senderID) + 1;
            
            const userData = await Currencies.getData(senderID);
            const exp = userData.exp || 0;
            const level = Math.floor(Math.sqrt(1 + (4 * exp) / 3 + 1) / 2) || 1;
            const name = await Users.getNameUser(senderID);

            // استخدام API خارجي للتصميم لتجنب مشاكل مكتبة Canvas في ريندر
            const backgroundIndex = Math.floor(Math.random() * 25) + 1; // اختيار خلفية عشوائية
            const avatarURL = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            
            // رابط التصميم الاحترافي (نستخدم خدمة rank card جاهزة لضمان التشغيل)
            const rankCardURL = `https://api.popcat.xyz/rankcard?image=${encodeURIComponent(avatarURL)}&custombg=https://i.imgur.com/8Mv7CIn.jpg&rank=${rank}&level=${level}&text_color=ffffff&bar_color=00ccff&currentxp=${exp}&targetxp=${3 * level * (level + 1)}&username=${encodeURIComponent(name)}`;

            const imageBuffer = (await axios.get(rankCardURL, { responseType: 'arraybuffer' })).data;
            fs.writeFileSync(pathImg, Buffer.from(imageBuffer, 'utf-8'));

            api.unsendMessage(info.messageID); // حذف رسالة "جاري التحليل"

            return api.sendMessage({
                body: `◈ ───『 مـسـتـوى الـتـفـاعـل 』─── ◈\n\n◯ الاسـم: ${name}\n◉ الـلـفـل: ${level}\n◉ الـترتيب: ${rank}\n\n◈ ─────────────── ◈`,
                attachment: fs.createReadStream(pathImg)
            }, threadID, () => fs.unlinkSync(pathImg), messageID);

        } catch (e) {
            console.log(e);
            return api.editMessage("⚠️ عذراً أيمن، واجهت مشكلة في جلب بيانات البطاقة. تأكد من أن السيرفر يدعم الاتصال الخارجي.", info.messageID);
        }
    }, messageID);
};
