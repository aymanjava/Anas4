module.exports.config = {
  name: "رابط",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "HUSSEIN YACOUBI", // API by smfahim
  description: "الحصول على رابط Imgur من المرفقات (صورة، مقطع، أو GIF)",
  prefix: false,
    category: "قــســم الــادوات",
  usages: "رابط (رد على صورة)",
  cooldowns: 5,
};

const axios = require("axios");

module.exports.run = async ({ api, event }) => {
  const { messageReply, threadID, messageID } = event;

  // التحقق من أن الرسالة هي رد على مرفق
  if (event.type !== "message_reply") {
    return api.sendMessage("❌ | يرجى الرد على صورة أو مقطع لتحويله إلى رابط Imgur.", threadID, messageID);
  }

  if (!messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ | لا يوجد مرفقات لتحويلها إلى رابط Imgur.", threadID, messageID);
  }

  try {
    let num = 0;
    let msg = `🌐 | imgur link \n ${messageReply.attachments.length}`;

    // معالجة كل المرفقات
    for (const attachment of messageReply.attachments) {
      const apiUrl = `https://smfahim.xyz/imgur?url=${encodeURIComponent(attachment.url)}`;
      const response = await axios.get(apiUrl);

      if (response.data?.uploaded?.status === "success") {
        num++;
        msg += `${num}: ${response.data.uploaded.image}\n`;
      } else {
        msg += `${num + 1}: ❌ فشل في تحويل الرابط: ${attachment.url}\n`;
      }
    }

    // إرسال الرسالة النهائية
    api.sendMessage(msg, threadID, messageID);
  } catch (error) {
    console.error("Error processing attachments:", error);
    api.sendMessage("❌ | حدث خطأ أثناء معالجة المرفقات. يرجى المحاولة مرة أخرى.", threadID, messageID);
  }
};