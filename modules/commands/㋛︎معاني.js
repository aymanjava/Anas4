module.exports.config = {
  name: "معاني",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "لعبة معاني الكلمات: ترجم من الإنجليزية للعربية واربح",
  usages: "معاني",
  commandCategory: "العاب",
  cooldowns: 2
};

const questions = [
    { question: "bell", answer: "جرس" },
    { question: "Living room", answer: "غرفة معيشة" },
    { question: "window", answer: "شباك" },
    { question: "Bed room", answer: "غرفة نوم" },
    { question: "wall", answer: "حائط" },
    { question: "sofa", answer: "اريكة" },
    { question: "key", answer: "مفتاح" },
    { question: "kitchen", answer: "مطبخ" },
    { question: "bed", answer: "سرير" },
    { question: "red", answer: "احمر" },
    { question: "yellow", answer: "اصفر" },
    { question: "pencil", answer: "قلم رصاص" },
    { question: "green", answer: "اخضر" },
    { question: "blue", answer: "ازرق" },
    { question: "black", answer: "اسود" },
    { question: "book", answer: "كتاب" },
    { question: "white", answer: "ابيض" },
    { question: "ruler", answer: "مسطرة" },
    { question: "brown", answer: "بني" },
    { question: "chalk", answer: "طباشير" },
    { question: "purple", answer: "بنفسجي" },
    { question: "orange", answer: "برتقالي" },
    { question: "board", answer: "سبورة" },
    { question: "grey", answer: "رمادي" },
    { question: "house", answer: "منزل" },
    { question: "television", answer: "تلفزيون" },
    { question: "mat", answer: "سجادة" },
    { question: "door", answer: "باب" },
    { question: "king", answer: "ملك" },
    { question: "life", answer: "حياة" },
    { question: "Lion", answer: "اسد" },
    { question: "Tiger", answer: "نمر" },
    { question: "cow", answer: "بقرة" },
    { question: "camel", answer: "جمل" },
    { question: "horse", answer: "حصان" },
    { question: "Elephant", answer: "فيل" },
    { question: "Monkey", answer: "قرد" },
    { question: "Cat", answer: "قطة" },
    { question: "fish", answer: "سمك" },
    { question: "Apple", answer: "تفاح" },
    { question: "Tomato", answer: "طماطم" },
    { question: "Potato", answer: "بطاطس" },
    { question: "water", answer: "ماء" },
    { question: "School", answer: "مدرسة" }
];

module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {
  const { body, senderID, threadID, messageID } = event;
  const { correctAnswer } = handleReply;

  // إزالة التشكيل والمسافات الزائدة لضمان قبول الإجابة الصحيحة
  const userAnswer = body.trim().toLowerCase();
  const normalizedAnswer = correctAnswer.trim().toLowerCase();

  if (userAnswer === normalizedAnswer) {
      const name = await Users.getNameUser(senderID);
      await Currencies.increaseMoney(senderID, 150); // زيادة الجائزة لـ 150 دولار
      
      api.unsendMessage(handleReply.messageID); // حذف رسالة السؤال
      api.setMessageReaction("✅", messageID, () => {}, true);

      const msg = `◈ ───『 إجـابـة صـحـيـحـة ✅ 』─── ◈\n\n◯ الـبـطـل: ${name}\n◉ الـمـعـنى: 【 ${correctAnswer} 】\n💰 الـجـائـزة: 150 دولـار\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;
      return api.sendMessage(msg, threadID, messageID);
  } else {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("⚠️ للاسف إجابة خاطئة! حاول مرة أخرى يا بطل.", threadID, messageID);
  }
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;
  const randomQ = questions[Math.floor(Math.random() * questions.length)];
  const name = await Users.getNameUser(senderID);

  const msg = `◈ ───『 تـحـدي الـمـعـانـي 📖 』─── ◈\n\n◯ يـا [ ${name} ]..\n◉ مـا مـعـنى كـلـمـة: 『 ${randomQ.question} 』؟\n\n💰 الـجـائـزة: 150 دولـار\n———————————————\n│←› رد عـلـى الـرسـالـة بـالإجـابة 📥`;

  return api.sendMessage(msg, threadID, (err, info) => {
      global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          correctAnswer: randomQ.answer
      });
  }, messageID);
};
