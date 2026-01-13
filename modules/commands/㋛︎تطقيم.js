const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "تطقيم",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "جلب صور تطقيم انمي (كابلز) فخمة",
  commandCategory: "صور",
  cooldowns: 5,
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  // ⏳ التفاعل لبدء البحث في الخزائن الملكية
  api.setMessageReaction("🎭", messageID, () => {}, true);

  try {
    // جلب البيانات من المصدر (استخدام رابط بديل ومستقر)
    const response = await axios.get("https://raw.githubusercontent.com/ShaonAhmed/Shaon/main/couple.json");
    const data = response.data;
    
    // اختيار تطقيم عشوائي
    const randomCouple = data[Math.floor(Math.random() * data.length)];
    const { male, female } = randomCouple;

    const path1 = __dirname + "/cache/tatqim_male.png";
    const path2 = __dirname + "/cache/tatqim_female.png";

    // جلب الصور بجودة عالية
    const img1 = (await axios.get(male, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(path1, Buffer.from(img1, "utf-8"));

    const img2 = (await axios.get(female, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(path2, Buffer.from(img2, "utf-8"));

    const allImages = [
      fs.createReadStream(path1),
      fs.createReadStream(path2)
    ];

    const msg = `◈ ───『 تـطـقـيـم مـلـكـي 👑 』─── ◈\n\n` +
                `◯ سـيـدي، هـذا أجـمـل تـطـقـيـم مـن أجـلك.\n` +
                `◉ الـنـوع: أنـمـي (كـابـلـز) ✨\n` +
                `———————————————\n` +
                `│←› بـأوامـر: الإمـبـراطـور أيـمـن 👑\n` +
                `◈ ──────────────── ◈`;

    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: msg,
      attachment: allImages
    }, threadID, () => {
      // تنظيف الخزائن بعد الإرسال
      fs.unlinkSync(path1);
      fs.unlinkSync(path2);
    }, messageID);

  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⚠️ سيدي، خزائن الصور فارغة حالياً أو الرابط لا يستجيب.", threadID, messageID);
  }
}
