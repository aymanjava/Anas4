const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
    name: "لفل",
    version: "25.0.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "عرض مستوى تفاعلك ببطاقة احترافية و25 خلفية",
    commandCategory: "النظام",
    usePrefix: true,
    cooldowns: 10,
    dependencies: {
        "canvas": "",
        "axios": "",
        "fs-extra": ""
    }
};

module.exports.run = async ({ event, api, Currencies, Users }) => {
    const { threadID, messageID, senderID } = event;
    const pathImg = __dirname + `/cache/rank_${senderID}.png`;

    // قائمة 25 خلفية فخمة تعمل مباشرة
    const bgs = [
        "https://i.imgur.com/8Mv7CIn.jpg", "https://i.imgur.com/2p1x9h6.jpg",
        "https://i.imgur.com/uO6vR5v.jpg", "https://i.imgur.com/L1Q8B7H.jpg",
        "https://i.imgur.com/x0p7M1E.jpg", "https://i.imgur.com/7bMv5Wf.jpg",
        "https://i.imgur.com/4S9i1Vl.jpg", "https://i.imgur.com/6Q5u2Kj.jpg",
        "https://i.imgur.com/9vD6M4N.jpg", "https://i.imgur.com/1rF7L8m.jpg",
        "https://i.imgur.com/3sF2T9p.jpg", "https://i.imgur.com/5uR8V9q.jpg",
        "https://i.imgur.com/7tN1M4r.jpg", "https://i.imgur.com/9pD2W4s.jpg",
        "https://i.imgur.com/1fR6M4t.jpg", "https://i.imgur.com/3kP0L4u.jpg",
        "https://i.imgur.com/5mN8B4v.jpg", "https://i.imgur.com/7lS2D4w.jpg",
        "https://i.imgur.com/9xQ4W4x.jpg", "https://i.imgur.com/1vD7M4y.jpg",
        "https://i.imgur.com/3bR9N4z.jpg", "https://i.imgur.com/5nT1L4a.jpg",
        "https://i.imgur.com/7mW2M4b.jpg", "https://i.imgur.com/9pQ3W4c.jpg",
        "https://i.imgur.com/vH5tXW8.jpg"
    ];

    api.sendMessage("📊 جاري رصد مستواك... [ ⏳ ]", threadID, async (err, info) => {
        try {
            // جلب البيانات والحسابات
            let all = await Currencies.getAll(["userID", "exp"]);
            all.sort((a, b) => b.exp - a.exp);
            const rank = all.findIndex(i => i.userID == senderID) + 1;
            
            const userData = await Currencies.getData(senderID);
            const exp = userData.exp || 0;
            const level = Math.floor(Math.sqrt(1 + (4 * exp) / 3 + 1) / 2) || 1;
            const name = await Users.getNameUser(senderID);

            // حساب شريط الخبرة
            const nextLevelExp = 3 * level * (level + 1);
            const currentLevelExp = 3 * level * (level - 1);
            const progress = ((exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 550;

            // بدء الرسم
            const canvas = createCanvas(900, 300);
            const ctx = canvas.getContext("2d");

            // تحميل خلفية عشوائية من الـ 25
            const background = await loadImage(bgs[Math.floor(Math.random() * bgs.length)]);
            ctx.drawImage(background, 0, 0, 900, 300);

            // طبقة تظليل
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(20, 20, 860, 260);

            // الصورة الشخصية
            const avatar = await loadImage(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
            ctx.save();
            ctx.beginPath();
            ctx.arc(150, 150, 90, 0, Math.PI * 2);
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#00ccff";
            ctx.stroke();
            ctx.clip();
            ctx.drawImage(avatar, 60, 60, 180, 180);
            ctx.restore();

            // النصوص
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 40px Arial";
            ctx.fillText(name.substring(0, 15), 280, 100);

            ctx.fillStyle = "#00ccff";
            ctx.font = "30px Arial";
            ctx.fillText(`المستوى: ${level} | الترتيب: #${rank}`, 280, 160);

            // شريط التقدم
            ctx.fillStyle = "#333333";
            ctx.fillRect(280, 200, 550, 30);
            ctx.fillStyle = "#00ccff";
            ctx.fillRect(280, 200, progress > 550 ? 550 : progress, 30);

            // إرسال النتيجة
            const buffer = canvas.toBuffer();
            fs.writeFileSync(pathImg, buffer);
            
            api.sendMessage({
                body: `◈ ───『 مـسـتـوى الـتـفـاعـل 』─── ◈\n\n◯ الاسـم: ${name}\n◉ الـلـفـل: ${level}\n◉ الـترتيب: ${rank}\n\n◈ ─────────────── ◈`,
                attachment: fs.createReadStream(pathImg)
            }, threadID, () => {
                fs.unlinkSync(pathImg);
                api.unsendMessage(info.messageID);
            }, messageID);

        } catch (e) {
            console.log(e);
            api.editMessage("❌ فشل التصميم، تأكد من تنصيب مكتبة canvas.", info.messageID);
        }
    }, messageID);
};
