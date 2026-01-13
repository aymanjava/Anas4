module.exports.config = {
  name: "عواصم",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "لعبة عواصم الدول - اختبر معلوماتك واربح المال",
  commandCategory: "العاب",
  usages: "عواصم",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

const questions = [
  { "question": "ما هي عاصمة الجزائر؟", "answer": "الجزائر" },
  { "question": "ما هي عاصمة البحرين؟", "answer": "المانامة" },
  { "question": "ما هي عاصمة مصر؟", "answer": "القاهرة" },
  { "question": "ما هي عاصمة العراق؟", "answer": "بغداد" },
  { "question": "ما هي عاصمة الأردن؟", "answer": "عمان" },
  { "question": "ما هي عاصمة الكويت؟", "answer": "الكويت" },
  { "question": "ما هي عاصمة لبنان؟", "answer": "بيروت" },
  { "question": "ما هي عاصمة ليبيا؟", "answer": "طرابلس" },
  { "question": "ما هي عاصمة موريتانيا؟", "answer": "نواكشوط" },
  { "question": "ما هي عاصمة المغرب؟", "answer": "الرباط" },
  { "question": "ما هي عاصمة قطر؟", "answer": "الدوحة" },
  { "question": "ما هي عاصمة السعودية؟", "answer": "الرياض" },
  { "question": "ما هي عاصمة الصومال؟", "answer": "مقديشو" },
  { "question": "ما هي عاصمة سوريا؟", "answer": "دمشق" },
  { "question": "ما هي عاصمة تونس؟", "answer": "تونس" },
  { "question": "ما هي عاصمة الإمارات العربية المتحدة؟", "answer": "ابوظبي" },
  { "question": "ما هي عاصمة اليمن؟", "answer": "صنعاء" },
  { "question": "ما هي عاصمة فلسطين؟", "answer": "القدس" },
  { "question": "ما هي عاصمة إيطاليا؟", "answer": "روما" },
  { "question": "ما هي عاصمة اليابان؟", "answer": "طوكيو" },
  { "question": "ما هي عاصمة روسيا؟", "answer": "موسكو" },
  { "question": "ما هي عاصمة إسبانيا؟", "answer": "مدريد" },
  { "question": "ما هي عاصمة فرنسا؟", "answer": "باريس" },
  { "question": "ما هي عاصمة تركيا؟", "answer": "انقرة" },
  { "question": "ما هي عاصمة ألمانيا؟", "answer": "برلين" }
];

module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {
  const { senderID, body, threadID, messageID } = event;
  const { correctAnswer, author } = handleReply;

  const userAnswer = body.trim().toLowerCase();
  const cleanCorrect = correctAnswer.trim().toLowerCase();

  // نظام التحقق الذكي
  if (userAnswer === cleanCorrect) {
    const name = await Users.getNameUser(senderID);
    await Currencies.increaseMoney(senderID, 150); // مكافأة 150 دولار
    
    api.unsendMessage(handleReply.messageID); // حذف سؤال البوت
    api.setMessageReaction("✅", messageID, () => {}, true);

    const winMsg = `◈ ───『 فـوز مـلـكـي 🎉 』─── ◈\n\n◯ الـمـبـدع: ${name}\n◉ الـعـاصـمة: 【 ${correctAnswer} 】\n💰 الـجـائـزة: 150 دولـار\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;
    return api.sendMessage(winMsg, threadID, messageID);
  } else {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⚠️ للاسف، الإجـابـة خـاطـئـة.. ركز وحـاول مـرة أخرى!", threadID, messageID);
  }
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;

  const randomQ = questions[Math.floor(Math.random() * questions.length)];
  const name = await Users.getNameUser(senderID);

  api.setMessageReaction("🌍", messageID, () => {}, true);

  // إنشاء تلميح (أول حرف من العاصمة)
  const hint = randomQ.answer.charAt(0);

  const msg = `◈ ───『 لـعـبـة الـعـواصـم 🌍 』─── ◈\n\n◯ يـا [ ${name} ]..\n◉ سـؤالـك هـو:\n\n" ${randomQ.question} "\n\n💡 تـلـمـيـح: تـبـدأ بـحـرف ( ${hint} )\n💰 الـجـائـزة: 150 دولـار\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;

  return api.sendMessage(msg, threadID, (error, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      correctAnswer: randomQ.answer,
      author: senderID
    });
  }, messageID);
};
