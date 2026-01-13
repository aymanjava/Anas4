const axios = require('axios');
const fs = require("fs-extra");
const request = require("request");

module.exports.config = {
  name: "فلم",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "البحث عن الأفلام والأنمي مع الترجمة والربط بالخزينة",
  commandCategory: "افلام",
  usages: "[اسم الفلم بالانجليزي]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args, Currencies }) {
  const { threadID, senderID, messageID } = event;
  const isTop = global.config.ADMINBOT.includes(senderID);
  const searchCost = 50; // تكلفة البحث للمستخدمين العاديين

  let movieQuery = args.join(" ");
  if (!movieQuery) return api.sendMessage("◯ سيدي، يرجى كتابة اسم الفلم للبحث عنه!\nمثال: .فلم Batman", threadID, messageID);

  // نظام الخزينة المركزية
  if (!isTop) {
    let userMoney = (await Currencies.getData(senderID)).money || 0;
    if (userMoney < searchCost) return api.sendMessage(`◯ عذراً، تكلفة الاستعلام السينمائي هي ${searchCost}$ من رصيدك الموحد.`, threadID, messageID);
  }

  try {
    api.sendMessage(`◈ جاري الاتصال بقاعدة بيانات IMDB.. انتظر سيدي التوب 👑`, threadID, (err, info) => setTimeout(() => api.unsendMessage(info.messageID), 2000));

    const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(movieQuery)}`);
    const data = res.data;

    if (data.error) return api.sendMessage("❌ لم يتم العثور على هذا الفلم، تأكد من الاسم الصحيح.", threadID, messageID);

    // دالة الترجمة الذكية
    async function translate(text) {
      const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
      return res.data[0][0][0];
    }

    const [translatedPlot, translatedGenres] = await Promise.all([
      translate(data.plot),
      translate(data.genres)
    ]);

    let callback = async function() {
      // خصم التكلفة من الخزينة المركزية بعد نجاح العملية
      if (!isTop) await Currencies.decreaseMoney(senderID, searchCost);

      return api.sendMessage({
        body: `◈ ───『 الـمـكـتـبـة الـسـيـنمـائـيـة 』─── ◈\n\n` +
              `🎬 اسـم الـفـلـم: ${data.title}\n` +
              `📅 سـنة الإنـتاج: ${data.year}\n` +
              `⏳ الـمـدة: ${data.runtime}\n` +
              `🎭 الـتـصـنـيـف: ${translatedTextGenres}\n` +
              `🎬 الـمـخرج: ${data.director}\n` +
              `⭐ الـتـقـيـيـم: ${data.rating}/10\n` +
              `💰 الأربـاح: ${data.boxoffice}\n\n` +
              `📝 الـقـصـة:\n${translatedTextPlot}\n\n` +
              `│←› الرسوم: ${isTop ? "مجانية للتوب" : searchCost + "$"}\n` +
              `│←› بـإدارة الـتـوب ايـمـن 👑\n` +
              `◈ ───────────────── ◈`,
        attachment: fs.createReadStream(__dirname + `/cache/poster.png`)
      }, threadID, () => fs.unlinkSync(__dirname + `/cache/poster.png`), messageID);
    };

    return request(encodeURI(data.poster)).pipe(fs.createWriteStream(__dirname + `/cache/poster.png`)).on("close", callback);

  } catch (err) {
    return api.sendMessage(`❌ حدث خطأ في جلب البيانات، حاول لاحقاً.`, threadID, messageID);
  }
};
