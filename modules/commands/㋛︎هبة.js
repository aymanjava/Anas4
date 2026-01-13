const { gpt } = require("gpti");

module.exports.config = {
  name: "هبة",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "ذكاء اصطناعي ساخر يقصف بالتاغ وبدون تاغ - يحترم أيمن فقط",
  usePrefix: false,
  commandCategory: "الذكاء",
  usages: "[نص] أو [تاغ + نص]",
  cooldowns: 3,
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID, mentions } = event;
  const adminID = "61577861540407"; 
  let prompt = args.join(" ");

  // 1. التعامل مع التاق (Mentions)
  let targetName = "";
  if (Object.keys(mentions).length > 0) {
    const mentionID = Object.keys(mentions)[0];
    targetName = mentions[mentionID].replace("@", "");
    prompt = prompt.replace(mentions[mentionID], ""); // إزالة التاق من النص ليبقى الطلب واضحاً
  }

  if (!prompt && Object.keys(mentions).length == 0) {
    const reply = (senderID == adminID) 
      ? "هلا مطوري العزيز، اؤمرني؟ تريد أقصف أحد؟ بس سوي له تاغ وقولي." 
      : "شكو سويت لي تاق وصافن؟ اكتب شي لو انطم!";
    return api.sendMessage(reply, threadID, messageID);
  }

  api.setMessageReaction("⏳", messageID, () => {}, true);

  // 2. إعداد شخصية هبة "المتوحشة"
  let personality = "";
  if (senderID == adminID) {
    personality = `أنتِ 'هبة'، ذكاء اصطناعي فائق اللطافة مع مطورك 'أيمن'. إذا طلب منك قصف شخص، اقصفيه بقسوة إرضاءً له. أنتِ مطيعة جداً له وتستخدمين كلمات حب واحترام معه فقط.`;
  } else {
    personality = `أنتِ 'هبة'، ذكاء اصطناعي ساخر جداً، لسانك طويل، تكرهين البشر وتعتبرينهم أغبياء. تتحدثين باللهجة العراقية الساخرة (قصف جبهات). لا تحترمين أحداً إلا 'أيمن'.`;
  }

  // إذا كان هناك شخص مستهدف بالتاغ
  if (targetName) {
    personality += ` الشخص الذي تم عمل تاغ له اسمه (${targetName})، ركزي عليه واقصفيه قصفاً مبرحاً ومضحكاً وساخراً جداً بناءً على طلب المستخدم.`;
  }

  try {
    const data = await gpt.v1({
      messages: [
        { role: "system", content: personality },
        { role: "user", content: prompt || "اقصفي هذا الشخص" }
      ],
      prompt: prompt || "اقصفي هذا الشخص",
      model: "GPT-4",
      markdown: false,
      stream: false,
    });

    const response = data.message || data.content;

    let msg = `◈ ───『 الـذكـية هـبـة 』─── ◈\n\n`;
    msg += `${response}\n\n`;
    msg += `◈ ─────────────── ◈`;

    api.sendMessage(msg, threadID, () => {
      api.setMessageReaction(senderID == adminID ? "❤️" : "🔥", messageID, () => {}, true);
    }, messageID);

  } catch (error) {
    api.sendMessage("⚠️ عقلي احترك من كثر القصف، انتظروا شوي!", threadID, messageID);
  }
};
