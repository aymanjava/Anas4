const { gpt } = require("gpti");

module.exports.config = {
  name: "هبة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "ذكاء اصطناعي للرد على الأسئلة والمعلومات العامة",
  commandCategory: "〘 الذكاء AI 〙",
  usages: "هبة [سؤالك]",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const adminID = "61577861540407"; 

  const question = args.join(" ");
  
  // إذا لم يكتب المستخدم سؤالاً
  if (!question) {
    return api.sendMessage(
      "◈ ──『 هـبـة للذكاء الاصطناعي 』── ◈\n\n◯ يرجى كتابة سؤالك بعد اسمي\n│ مثال: هبة من هو مخترع الكهرباء؟\n\n◈ ────────────── ◈",
      threadID,
      messageID
    );
  }

  // تفاعل "جاري المعالجة"
  api.setMessageReaction("⌛", messageID, () => {}, true);

  try {
    // استدعاء الذكاء الاصطناعي GPT-4 عبر المكتبة
    const res = await gpt.v1({
      messages: [
        {
          role: "system",
          content: "أنتِ 'هبة'، مساعد ذكاء اصطناعي ذكي، محترم، ونافع. تقدمين إجابات دقيقة ومفيدة باللغة العربية."
        }
      ],
      prompt: question,
      model: "GPT-4",
      markdown: false,
      stream: false,
    });

    const answer = res.message || res.content;

    if (!answer) throw new Error("No response from AI");

    let msg = `◈ ───『 الـذكـية هـبـة 』─── ◈\n\n`;
    msg += `${answer}\n\n`;
    msg += `◈ ─────────────── ◈\n`;
    msg += `│ بواسطة المطور أيمن\n`;
    msg += `◈ ─────────────── ◈`;

    return api.sendMessage(msg, threadID, () => {
      // وضع علامة النجاح بعد الرد
      api.setMessageReaction("✅", messageID, () => {}, true);
    }, messageID);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(
      "⚠️ حدث خطأ أثناء الاتصال بالخادم، تأكد من أن مكتبة gpti مثبتة بشكل صحيح.",
      threadID,
      messageID
    );
  }
};
