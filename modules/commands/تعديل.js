const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تعديل",
  version: "2.6.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تعديل صور الأعضاء (أبيض وأسود، تغبيش، سطوع)",
  commandCategory: "ميديا",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  let url;

  // التحقق من الصورة (رد أو مباشرة)
  if (event.type === "message_reply" && event.messageReply && event.messageReply.attachments.length > 0) {
    url = event.messageReply.attachments[0].url;
  } else if (event.attachments && event.attachments.length > 0 && event.attachments[0].type === "photo") {
    url = event.attachments[0].url;
  } else {
    return api.sendMessage("✨ يرجى إرسال صورة أو الرد على صورة تريد تعديلها.", threadID, messageID);
  }

  const action = args[0];
  if (!action || !["رمادي", "تغبيش", "سطوع"].includes(action)) {
    return api.sendMessage("🎨 اختر نوع التعديل:\n━━━━━━━━━━━━━━\n1. .تعديل رمادي\n2. .تعديل تغبيش\n3. .تعديل سطوع", threadID, messageID);
  }

  const loading = await api.sendMessage("✨ جاري معالجة الصورة... [ 3 ]", threadID, messageID);
  setTimeout(() => api.editMessage("✨ جاري معالجة الصورة... [ 2 ]", loading.messageID), 1000);
  setTimeout(() => api.editMessage("✨ جاري معالجة الصورة... [ 1 ]", loading.messageID), 2000);

  try {
    const imagePath = path.join(__dirname, `/cache/edit_${Date.now()}.png`);
    const image = await jimp.read(url);

    // تنفيذ التعديل
    if (action === "رمادي") image.greyscale();
    else if (action === "تغبيش") image.blur(5);
    else if (action === "سطوع") image.brightness(0.5);

    await image.writeAsync(imagePath);

    await api.sendMessage({
      body: `✅ تم تنفيذ تأثير (${action}) بنجاح`,
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => {
      fs.unlinkSync(imagePath);
      api.unsendMessage(loading.messageID);
    }, messageID);

    api.setMessageReaction("🎨", messageID, () => {}, true);

  } catch (err) {
    console.error(err);
    api.editMessage("❌ عذراً، فشل تعديل هذه الصورة. حاول مرة أخرى.", loading.messageID);
  }
};
