module.exports.config = {
  name: "ويكي",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "البحث في ويكيبيديا العالمية (عربي/إنجليزي)",
  commandCategory: "خدمات",
  usages: "[نص البحث]",
  cooldowns: 5,
  dependencies: {
    "wikijs": ""
  }
};

module.exports.run = async ({ event, args, api }) => {
    const wiki = require("wikijs").default;
    const { threadID, messageID } = event;
    let content = args.join(" ");
    let url = 'https://ar.wikipedia.org/w/api.php'; // اللغة العربية افتراضياً

    if (!content) {
        return api.sendMessage("◈ ──『 تـنـبـيـه 』── ◈\n\n⚠️ سيدي، يرجى إدخال ما تريد البحث عنه.\nمثال: ويكي أينشتاين", threadID, messageID);
    }

    // التحقق إذا كان المستخدم يريد البحث بالإنجليزية
    if (args[0] === "en") {
        url = 'https://en.wikipedia.org/w/api.php';
        content = args.slice(1).join(" ");
    }

    api.setMessageReaction("🔍", messageID, () => {}, true);

    try {
        const page = await wiki({ apiUrl: url }).page(content);
        const summary = await page.summary();
        const fullUrl = page.fullurl();

        // تقصير النص إذا كان طويلاً جداً لضمان عدم تعليق الشات
        const cleanSummary = summary.length > 800 ? summary.slice(0, 800) + "..." : summary;

        const msg = `◈ ───『 الـمـوسـوعـة الـحـرة 📚 』─── ◈\n\n` +
                    `🔎 الـبـحث: ${content}\n\n` +
                    `📝 الـمـلـخص:\n${cleanSummary}\n\n` +
                    `🔗 الـرابط الـكامل:\n${fullUrl}\n` +
                    `———————————————\n` +
                    `│←› بـأوامـر: الـتـوب أيـمـن 👑`;

        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(msg, threadID, messageID);

    } catch (err) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`⚠️ سيدي، لم أتمكن من العثور على نتائج لـ "${content}". تأكد من كتابة الإسم بشكل صحيح.`, threadID, messageID);
    }
};
