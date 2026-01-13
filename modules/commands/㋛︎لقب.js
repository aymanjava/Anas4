module.exports.config = {
  name: "لقب",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "يمنحك لقباً يعبر عن مكانتك (ألقاب خاصة للإمبراطور)",
  commandCategory: "خدمات",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

module.exports.run = async ({ api, event, Users }) => {
  const axios = require("axios");
  const { threadID, senderID, messageID } = event;

  // ✅ الأيدي الخاص بك سيدي لضمان الهيبة
  const EMPEROR_ID = "61577861540407";

  // 👑 قائمة ألقاب الهيبة الخاصة بك فقط
  const royalTitles = [
    "الإمبراطور", "الـقـيـصـر", "الـجـلاد", "الـشـبـح", "الـمـهـيـب", 
    "الأسـطـورة", "الـزعـيـم", "الـمـدمـر", "كـابـوس الأعداء", "الـصـقـر"
  ];

  try {
    if (senderID == EMPEROR_ID) {
      // اختيار لقب هيبة عشوائي لك سيدي
      const myTitle = royalTitles[Math.floor(Math.random() * royalTitles.length)];
      const name = (await Users.getData(senderID)).name;
      const finalNickname = `${myTitle} | ${name}`;
      
      return api.changeNickname(finalNickname, threadID, senderID, () => {
        api.sendMessage(`🛡️ أبشر يا صاحب السيادة، لقبك الجديد هو: 【 ${finalNickname} 】`, threadID, messageID);
      });
    } else {
      // بالنسبة للبقية: جلب اسم عشوائي من الـ API
      const response = await axios.get(`https://www.behindthename.com/api/random.json?usage=ita&gender=m&key=mi451266190`);
      const data = response.data;
      const randomName = `${data.names[0]}`;
      
      return api.changeNickname(randomName, threadID, senderID, () => {
        api.sendMessage(`✅ تم تغيير لقبك إلى: ${randomName}`, threadID, messageID);
      });
    }
  } catch (e) {
    return api.sendMessage("⚠️ حدث خطأ في جلب اللقب، حاول مجدداً سيدي.", threadID, messageID);
  }
};
