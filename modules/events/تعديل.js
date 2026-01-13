const jimp = require("jimp");
const fs = require("fs-extra");

module.exports.config = {
  name: "تعديل",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تعديل صور الأعضاء (أبيض وأسود، تغبيش، سطوع)",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, type, messageReply } = event;
  
  // التأكد من أن المستخدم قام بالرد على صورة
  if (type !== "message_reply" || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("✨ يرجى الرد على الصورة التي تريد تعديلها.", threadID, messageID);
  }

  const url = messageReply.attachments[0].url;
  const action = args[0]; // نوع التعديل

  if (!action || !["رمادي", "تغبيش", "سطوع"].includes(action)) {
    return api.sendMessage("🎨 اختر نوع التعديل:\n━━━━━━━━━━━━━━\n1. .تعديل رمادي\n2. .تعديل تغبيش\n3. .تعديل سطوع", threadID, messageID);
  }

  // إرسال رسالة العد التنازلي التفاعلية
  api.sendMessage("✨ جاري معالجة الصورة... [ 3 ]", threadID, async (err, info) => {
    setTimeout(() => api.editMessage("✨ جاري معالجة الصورة... [ 2 ]", info.messageID), 1000);
    setTimeout(() => api.editMessage("✨ جاري معالجة الصورة... [ 1 ]", info.messageID), 2000);

    setTimeout(async () => {
      try {
        const path = __dirname + `/cache/edit_${Date.now()}.png`;
        const image = await jimp.read(url);

        // تنفيذ التعديل بناءً على طلب العضو
        if (action === "رمادي") {
          image.greyscale();
        } else if (action === "تغبيش") {
          image.blur(5);
        } else if (action === "سطوع") {
          image.brightness(0.5);
        }

        await image.writeAsync(path);

        // إرسال الصورة المعدلة
        api.sendMessage({
          body: `✅ تم تنفيذ تأثير (${action}) بنجاح`,
          attachment: fs.createReadStream(path)
        }, threadID, () => {
          fs.unlinkSync(path); // حذف الملف المؤقت
          api.unsendMessage(info.messageID);
        }, messageID);

        api.setMessageReaction("🎨", messageID, () => {}, true);

      } catch (e) {
        console.error(e);
        api.editMessage("❌ عذراً، فشل تعديل هذه الصورة. قد يكون الرابط منتهي الصلاحية.", info.messageID);
      }
    }, 3000);
  }, messageID);
};
