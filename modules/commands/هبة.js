const { Configuration, OpenAIApi } = require('openai');

// إعداد المحرك
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

// كائن لحفظ الذاكرة مؤقتاً (سوف يتصفر عند إعادة تشغيل البوت)
// إذا أردت حفظاً دائمياً يمكن ربطه بقاعدة بيانات sqlite لاحقاً
if (!global.heba_chat_memory) {
  global.heba_chat_memory = new Map();
}

module.exports.config = {
  name: "هبة",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "ذكاء هبة المطور مع ميزة الذاكرة",
  commandCategory: "الذكاء الاصطناعي",
  usages: "[سؤالك]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage("╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n✨ نعم! أنا أتذكرك، هل لديك سؤال آخر؟\n╰──────────────╯", threadID, messageID);
  }

  // 1. استرجاع ذاكرة المستخدم أو إنشاء ذاكرة جديدة
  if (!global.heba_chat_memory.has(senderID)) {
    global.heba_chat_memory.set(senderID, [
      { role: "system", content: "أنتِ 'هبة'، بوت ذكي بلمسة أنثوية لطيفة، تتحدثين بالعربية بأسلوب مساعد وودود جداً." }
    ]);
  }

  let userMemory = global.heba_chat_memory.get(senderID);

  // إضافة سؤال المستخدم الحالي للذاكرة
  userMemory.push({ role: "user", content: prompt });

  // تحديد حجم الذاكرة (آخر 10 رسائل فقط لعدم استهلاك التوكنز)
  if (userMemory.length > 10) userMemory.shift();

  api.setMessageReaction("⌛", messageID, () => {}, true);
  
  api.sendMessage("╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n🧠 جاري مراجعة ذاكرتي والرد...\n╰──────────────╯", threadID, async (err, info) => {
    try {
      // 2. إرسال المحادثة كاملة (الذاكرة + السؤال الجديد)
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: userMemory,
        max_tokens: 800,
        temperature: 0.7
      });

      const reply = response.data.choices[0].message.content.trim();

      // 3. إضافة رد البوت للذاكرة لكي يتذكره في المرة القادمة
      userMemory.push({ role: "assistant", content: reply });
      global.heba_chat_memory.set(senderID, userMemory);

      api.setMessageReaction("✅", messageID, () => {}, true);
      
      return api.editMessage(
        `╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n🤖 هبة:\n${reply}\n\n╰──────────────╯`,
        info.messageID
      );

    } catch (error) {
      console.error("Memory Chat Error:", error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.editMessage("╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n❌ عذراً، ذاكرتي ممتلئة أو حدث خطأ في الاتصال.\n╰──────────────╯", info.messageID);
    }
  }, messageID);
};
