const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "لفل",
  version: "25.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "عرض مستوى تفاعلك ببطاقة احترافية",
  commandCategory: "النظام",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const path = __dirname + `/cache/level_${senderID}.png`;

  // قائمة 25 خلفية فخمة (تتغير عشوائياً في كل مرة)
  const backgrounds = [
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

  api.sendMessage("📊 جاري تحليل مستواك... [ 3 ]", threadID, async (err, info) => {
    try {
      // جلب بيانات الخبرة واللفل
      const data = await Currencies.getData(senderID);
      const exp = data.exp || 0;
      const level = Math.floor(Math.sqrt(1 + (4 * exp) / 4) / 32) || 1;
      const name = (await api.getUserInfo(senderID))[senderID].name;

      // إعداد لوحة الرسم (Canvas)
      const canvas = createCanvas(900, 300);
      const ctx = canvas.getContext("2d");

      // اختيار واحدة من الـ 25 خلفية
      const bgUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)];
      const background = await loadImage(bgUrl);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // طبقة تظليل فخمة للنصوص
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.roundRect ? ctx.roundRect(20, 20, 860, 260, 20) : ctx.fillRect(20, 20, 860, 260);
      ctx.fill();

      // رسم الصورة الشخصية بشكل دائري مع إطار
      const avatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar = await loadImage(avatarUrl);
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(150, 150, 95, 0, Math.PI * 2, true);
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#00ccff";
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(avatar, 55, 55, 190, 190);
      ctx.restore();

      // كتابة المعلومات
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 45px Arial";
      ctx.fillText(name.substring(0, 18), 280, 100);

      ctx.fillStyle = "#00ccff";
      ctx.font = "bold 35px Arial";
      ctx.fillText(`الـمـسـتـوى: ${level}`, 280, 160);

      // شريط الخبرة التفاعلي
      const xpNeeded = level * level * 100;
      const barWidth = 550;
      const progress = (exp / xpNeeded) * barWidth;

      // خلفية الشريط
      ctx.fillStyle = "#444444";
      ctx.fillRect(280, 200, barWidth, 35);
      
      // تقدم الشريط (نيون)
      ctx.fillStyle = "#00ccff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00ccff";
      ctx.fillRect(280, 200, progress > barWidth ? barWidth : progress, 35);
      ctx.shadowBlur = 0;

      // نسبة الخبرة
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${exp} / ${xpNeeded} XP`, 555, 225);

      // حفظ وإرسال
      const buffer = canvas.toBuffer();
      fs.writeFileSync(path, buffer);
      
      api.sendMessage({
        body: `◈ ───『 مـسـتـوى الـتـفـاعـل 』─── ◈\n\n◯ الاسـم: ${name}\n◉ الـلـفـل الحالي: ${level}\n◉ الـخـبرة: ${exp}\n\n◈ ─────────────── ◈`,
        attachment: fs.createReadStream(path)
      }, threadID, () => {
        fs.unlinkSync(path);
        api.unsendMessage(info.messageID);
      }, messageID);

    } catch (e) {
      console.error(e);
      api.editMessage("❌ فشل في استخراج بيانات اللفل. تأكد من عمل السيرفر.", info.messageID);
    }
  }, messageID);
};
