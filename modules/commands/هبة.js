const { Configuration, OpenAIApi } = require('openai');

// إعداد المحرك ليقرأ المفتاح من Render Environment Variables
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY, // قمنا بإزالة التوكن ووضعنا المتغير البرمجي بدلاً منه
});
const openai = new OpenAIApi(configuration);

// كائن لحفظ الذاكرة مؤقتاً
if (!global.heba_chat_memory) {
  global.heba_chat_memory = new Map();
}

module.exports.config = {
  name: "هبة",
  version: "3.1.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "ذكاء هبة المطور مع ميزة الذاكرة (نسخة آمنة)",
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
  userMemory.push({ role: "user", content: prompt });

  if (userMemory.length > 10) userMemory.shift();

  api.setMessageReaction("⌛", messageID, () => {}, true);
  
  api.sendMessage("╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n🧠 جاري مراجعة ذاكرتي والرد...\n╰──────────────╯", threadID, async (err, info) => {
    try {
      // التأكد من وجود المفتاح في النظام قبل الطلب
      if (!process.env.OPENAI_KEY) {
        throw new Error("OPENAI_KEY_MISSING");
      }

      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: userMemory,
        max_tokens: 800,
        temperature: 0.7
      });

      const reply = response.data.choices[0].message.content.trim();
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
      
      let errorMsg = "❌ عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي.";
      if (error.message === "OPENAI_KEY_MISSING") {
        errorMsg = "❌ خطأ: مفتاح OPENAI_KEY غير مضاف في إعدادات Render!";
      }

      return api.editMessage(`╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n${errorMsg}\n╰──────────────╯`, info.messageID);
    }
  }, messageID);
};
