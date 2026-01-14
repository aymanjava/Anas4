const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require("openai");

const apiKey = "84ee8ffc30644f58a7878d83519ae4dc";

module.exports = async function (event, api) {
  const input = event.body.toLowerCase().split(' ');
  const ipAddress = input[1];

  if (!ipAddress) {
    api.sendMessage('كيفية الإستخدام: آي_بي [عنوان آي بي]', event.threadID);
    return;
  }

  try {
    const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ipAddress}`);

    if (response.status === 200) {
      const data = response.data;

      const formattedResult = `
🤖 إليك ماوجدت بالنسبة عنوان آي_بي ${ipAddress}:

🌐 عنوان آي بي: ${data.ip}
🌍 رمز الدولة : ${data.continent_code}
🌎 إسم الدولة : ${data.continent_name}
🌐 رمز الدولة 2: ${data.country_code2}
🌐 رمز الدولة 3: ${data.country_code3}
📌 إسم الدولة : ${data.country_name}
🏛️ عاصمة الدولة : ${data.country_capital}
🏞️ الولاية/المقاطعة: ${data.state_prov}
🌆 المدينة : ${data.city}
📮 الرمز البريدي: ${data.zipcode}
🌍 خط العرض: ${data.latitude}
🌍 خط الطول: ${data.longitude}
🇪🇺 اروبا ؟: ${data.is_eu ? 'نعم' : 'لا'}
📞 رمز الإتصال : ${data.calling_code}
🌐 البلاد: ${data.country_tld}
🗣️ اللغة: ${data.languages}
🏳️ علم الدولة: ${data.country_flag}
🌐 معرف الاسم الجغرافي: ${data.geoname_id}
🌐  مزود خدمة الإنترنت: ${data.isp}
🌐 نوع الإنترنت: ${data.connection_type || 'N/A'}
🏢 المنظمة : ${data.organization}
💰 رمز المصرف: ${data.currency.code}
💰إسم المصرف: ${data.currency.name}
💰 رمز المصرف: ${data.currency.symbol}
🌍 المنطقة الزمنية: ${data.time_zone.name}
🕒 عوض: ${data.time_zone.offset}
⏰ الوقت الحالي: ${data.time_zone.current_time}
🕒 الوقت الحالي  (يونكس): ${data.time_zone.current_time_unix}
🌞 Is DST: ${data.time_zone.is_dst ? 'نعم' : 'لا'}
🌞 حفظ الوقت الصيفي : ${data.time_zone.dst_savings}

🏠 العنوان الكامل : ${data.city}, ${data.state_prov}, ${data.country_name}, ${data.zipcode}
🌐 خريطة جوجل \n[Open in Google Maps](https://www.google.com/maps?q=${data.latitude},${data.longitude})`;

      api.sendMessage(formattedResult, event.threadID, event.messageID);
    } else {
      api.sendMessage(" ❌ |حدث خطأ أثناء جلب معلومات IP.", event.threadID, event.messageID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage(" ❌ |حدث خطأ أثناء جلب معلومات IP.", event.threadID, event.messageID);
  }
};
