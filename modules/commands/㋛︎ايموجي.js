module.exports.config = {
  name: "ايموجي",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحدي الأسرع في إرسال الإيموجي الصحيح",
  usages: " ",
  commandCategory: "ألعاب",
  cooldowns: 5
};

const questions = [
  { question: "رجل شرطة", answer: "👮‍♂️" },
  { question: "امرأة شرطة", answer: "👮‍♀️" },
  { question: "وجه حزين", answer: "😢" },
  { question: "شبه مبتسم", answer: "🙂" },
  { question: "يخرج لسانه", answer: "😛" },
  { question: "ليس له فم", answer: "😶" },
  { question: "يتثاءب", answer: "🥱" },
  { question: "نائم", answer: "😴" },
  { question: "يغمز ويخرج لسانه", answer: "😜" },
  { question: "يخرج لسانه وعيناه مغمضة", answer: "😝" },
  { question: "مندهش (واو)", answer: "😮" },
  { question: "فمه مغلق بسحاب", answer: "🤐" },
  { question: "وجه مقلوب", answer: "🙃" },
  { question: "رأس ينفجر", answer: "🤯" },
  { question: "يشعر بالحر", answer: "🥵" },
  { question: "بالون", answer: "🎈" },
  { question: "عيون", answer: "👀" },
  { question: "ماعز", answer: "🐐" },
  { question: "الساعة الثانية عشر", answer: "🕛" },
  { question: "كرة قدم", answer: "⚽" },
  { question: "سلة تسوق", answer: "🛒" },
  { question: "دراجة هوائية", answer: "🚲" },
  { question: "تنين", answer: "🐉" },
  { question: "قلب يحترق", answer: "❤️‍🔥" },
  { question: "نمر", answer: "🐯" },
  { question: "بيتزا", answer: "🍕" },
  { question: "تاج ملكي", answer: "👑" }
];

module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {
  const { body, senderID, threadID, messageID } = event;
  const userAnswer = body.trim();
  const correctAnswer = handleReply.correctAnswer;
  const name = await Users.getNameUser(senderID);

  if (userAnswer === correctAnswer) {
      await Currencies.increaseMoney(senderID, 100);
      api.unsendMessage(handleReply.messageID); 
      return api.sendMessage(`◈ ───『 بـطـل الإيـمـوجـي 🏆 』─── ◈\n\n◯ الـفـائز : ${name}\n◉ الإجـابة : ${correctAnswer}\n💰 الـجـائزة : 100$\n———————————————\n◯ أحسنت سيدي، أنت الأسرع في المملكة!\n◈ ─────────────── ◈`, threadID, messageID);
  } else {
      return api.sendMessage(`❌ خطأ! حاول مجدداً يا ${name}`, threadID, messageID);
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  
  const msg = `◈ ───『 تـحـدي الإيـمـوجـي 』─── ◈\n\n◯ أسـرع شـخص يـرسـل الإيـموجـي الـمناسـب لـ:\n◉ الـمطلـوب: 【 ${randomQuestion.question} 】\n———————————————\n◯ الرد على هذه الرسالة بالإيموجي فقط!\n◈ ─────────────── ◈`;

  return api.sendMessage(msg, threadID, (error, info) => {
      global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          correctAnswer: randomQuestion.answer
      });
  }, messageID);
};
