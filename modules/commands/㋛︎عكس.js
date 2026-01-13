module.exports.config = {
  name: "عكس",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "لعبة عكس الكلمات - أجب وأربح الأموال",
  commandCategory: "العاب",
  usages: "عكس",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

const questions = [
  { question: "ما هو عكس النور؟", answer: "الظلام" },
  { question: "ما هو عكس الشقاء؟", answer: "السعادة" },
  { question: "ما هو عكس الفقر؟", answer: "الثروة" },
  { question: "ما هو عكس البرد؟", answer: "الحرارة" },
  { question: "ما هو عكس الجفاف؟", answer: "الرطوبة" },
  { question: "ما هو عكس الصمت؟", answer: "الضوضاء" },
  { question: "ما هو عكس الحياة؟", answer: "الموت" },
  { question: "ما هو عكس البداية؟", answer: "النهاية" },
  { question: "ما هو عكس الأعلى؟", answer: "الأدنى" },
  { question: "ما هو عكس الداخل؟", answer: "الخارج" },
  { question: "ما هو عكس الأمام؟", answer: "الخلف" },
  { question: "ما هو عكس اليمين؟", answer: "اليسار" },
  { question: "ما هو عكس القريب؟", answer: "البعيد" },
  { question: "ما هو عكس السهل؟", answer: "الصعب" },
  { question: "ما هو عكس اللين؟", answer: "القاسي" },
  { question: "ما هو عكس الفرح؟", answer: "الحزن" },
  { question: "ما هو عكس الحب؟", answer: "الكراهية" },
  { question: "ما هو عكس الصبر؟", answer: "الجزع" },
  { question: "ما هو عكس الحلم؟", answer: "الحقيقة" },
  { question: "ما هو عكس الحاضر؟", answer: "الماضي" },
  { question: "ما هو عكس الحقيقي؟", answer: "المزيف" },
  { question: "ما هو عكس الصحيح؟", answer: "الخطأ" },
  { question: "ما هو عكس الجيد؟", answer: "السيئ" },
  { question: "ما هو عكس الجميل؟", answer: "القبيح" },
  { question: "ما هو عكس الغني؟", answer: "الفقير" },
  { question: "ما هو عكس القوي؟", answer: "الضعيف" },
  { question: "ما هو عكس النهار؟", answer: "الليل" },
  { question: "ما هو عكس الذكر؟", answer: "الأنثى" },
  { question: "ما هو عكس المفرد؟", answer: "الجمع" },
  { question: "ما هو عكس الإيمان؟", answer: "الكفر" },
  { question: "ما هو عكس الأمل؟", answer: "اليأس" },
  { question: "ما هو عكس الصدق؟", answer: "الكذب" },
  { question: "ما هو عكس العدل؟", answer: "الظلم" },
  { question: "ما هو عكس الخير؟", answer: "الشر" }
];

module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {
  const { senderID, body, threadID, messageID } = event;
  const { correctAnswer, author } = handleReply;

  // تنظيف الإجابة من المسافات
  const userAnswer = body.trim().toLowerCase();
  const cleanCorrectAnswer = correctAnswer.trim().toLowerCase();

  if (userAnswer === cleanCorrectAnswer) {
    const name = await Users.getNameUser(senderID);
    await Currencies.increaseMoney(senderID, 100); // زيادة الجائزة لـ 100$
    
    api.unsendMessage(handleReply.messageID); // حذف سؤال البوت
    api.setMessageReaction("✅", messageID, () => {}, true);

    const winMsg = `◈ ───『 فـوز مـسـتـحـق 🎉 』─── ◈\n\n◯ الـبـطل: ${name}\n◉ الإجـابـة: 【 ${correctAnswer} 】\n💰 الـجـائـزة: 100 دولـار\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;
    return api.sendMessage(winMsg, threadID, messageID);
  } else {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⚠️ إجـابـة خـاطـئـة! حـاول مـرة أخرى يـا ذكـي..", threadID, messageID);
  }
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  const name = await Users.getNameUser(senderID);

  api.setMessageReaction("❓", messageID, () => {}, true);

  const msg = `◈ ───『 لـعـبـة الـعـكـس 🔄 』─── ◈\n\n◯ يـا [ ${name} ]..\n◉ سـؤالـك هـو:\n\n" ${randomQuestion.question} "\n\n👈 رُد عـلـى هـذه الـرسـالـة بـالإجـابـة الـصـحـيـحـة!\n💰 الـجـائـزة: 100 دولـار\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;

  return api.sendMessage(msg, threadID, (error, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      correctAnswer: randomQuestion.answer,
      author: senderID
    });
  }, messageID);
};
