const axios = require("axios");

module.exports.config = {
  name: "هبة",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "الدردشة مع الذكاء الاصطناعي (هبة)",
  commandCategory: "AI",
  usePrefix: true,
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");

  if (!prompt) return api.sendMessage("أهلاً أنا هبة، تفضل اسألني أي شيء.. ✨", threadID, messageID);

  // هذا هو السر: نخبر الذكاء الاصطناعي من هو في كل طلب
  const systemInstruction = "أنتِ فتاة ذكية ولطيفة تدعى 'هبة'. المطور الخاص بك هو 'أيمن'. تتحدثين بلهجة ودودة وتستخدمين الإيموجي. أجيبي على الأسئلة كأنثى دائماً.";
  
  const finalPrompt = `${systemInstruction}\nالمستخدم: ${prompt}`;

  api.sendMessage("✨ جاري التفكير...", threadID, async (err, info) => {
    try {
      // نستخدم API يدعم معالجة النصوص الطويلة والتوجيهات
      const res = await axios.get(`https://api.sandipbaruwal.com.np/gpt?prompt=${encodeURIComponent(finalPrompt)}`);
      
      let answer = res.data.answer;

      if (answer) {
        // إذا كان الرد يحتوي على "ChatGPT" أو "OpenAI" نقوم بتبديله ليبقى الاسم "هبة"
        answer = answer.replace(/ChatGPT|OpenAI/g, "هبة");
        api.editMessage(`🎀 **الجميلة هبة تقول:**\n\n${answer}`, info.messageID);
      } else {
        api.editMessage("عذراً، لم أستطع فهم ذلك.. حاولي مرة أخرى 🌸", info.messageID);
      }
    } catch (error) {
      api.editMessage("❌ يبدو أن هناك مشكلة في خوادمي، لحظات وأعود!", info.messageID);
    }
  }, messageID);
};
