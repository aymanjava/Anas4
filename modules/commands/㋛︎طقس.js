module.exports.config = {
  name: "طقس",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "عرض حالة الطقس لأي مدينة في العالم",
  commandCategory: "خدمات",
  usages: "[اسم المدينة]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "moment-timezone": ""
  }
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const moment = require("moment-timezone");
  const { threadID, messageID } = event;

  // إدخال المدينة
  var city = args.join(" ");
  if (!city) return api.sendMessage("◈ ──『 تـنـبـيـه 』── ◈\n\n◯ سيدي، يرجى كتابة اسم المدينة.\n◉ مثال: طقس بغداد\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑", threadID, messageID);

  // وضع تفاعل البحث
  api.setMessageReaction("🌡️", messageID, () => {}, true);

  // مفتاح الـ API مدمج مباشرة لضمان العمل
  const apiKey = "c4ef85b93982d6627681b056e24bd438"; 

  try {
    const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ar`);
    const data = res.data;

    // تحويل التوقيت حسب توقيت بغداد (أو توقيتك المحلي)
    const sunrise = moment.unix(data.sys.sunrise).tz("Asia/Baghdad").format('HH:mm:ss');
    const sunset = moment.unix(data.sys.sunset).tz("Asia/Baghdad").format('HH:mm:ss');

    const msg = `◈ ───『 حـالـة الـطـقـس 🌤️ 』─── ◈\n\n` +
                `◯ الـمـوقـع: ${data.name}, ${data.sys.country}\n` +
                `🌡️ درجة الحرارة: ${data.main.temp}°C\n` +
                `🌡️ الإحساس الفعلي: ${data.main.feels_like}°C\n` +
                `☁️ السماء: ${data.weather[0].description}\n` +
                `💦 الرطوبة: ${data.main.humidity}%\n` +
                `💨 سرعة الرياح: ${data.wind.speed} كم/س\n` +
                `🌅 شروق الشمس: ${sunrise}\n` +
                `🌄 غروب الشمس: ${sunset}\n\n` +
                `———————————————\n` +
                `│←› بـأوامـر: الـتـوب أيـمـن 👑`;

    api.setMessageReaction("✅", messageID, () => {}, true);
    return api.sendMessage(msg, threadID, messageID);

  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    if (error.response && error.response.status === 404) {
      return api.sendMessage(`⚠️ سيدي، لم أتمكن من العثور على مدينة تدعى [ ${city} ]. تأكد من الاسم.`, threadID, messageID);
    }
    return api.sendMessage("⚠️ حدث خطأ في الاتصال بمصلحة الأرصاد الجوية.", threadID, messageID);
  }
};
