const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports.config = {
  name: "تعريف",
  version: "11.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "البيان الرسمي لتعريف الرعية بالبوت هبة وقوانين التوب",
  commandCategory: "النظام",
  usages: "",
  cooldowns: 10, // وقت انتظار طويل لتعزيز قيمة المعلومة
};

module.exports.run = async ({ api, event, Currencies }) => {
  const { threadID, messageID, senderID } = event;
  const reward = 1; // قمة التقشف (نقطة واحدة فقط!)

  // روابط الـ GIF الملكية التي اخترتها سيدي (ماكيما وشينسو مان)
  const gifs = [
    "https://media.giphy.com/media/64Fw2xPusGKEjEV5SD/giphy.gif",
    "https://media.giphy.com/media/6vp2QrIJCADBVNfX4F/giphy.gif",
    "https://media.giphy.com/media/B0Mg22EfD2oYotpp8d/giphy.gif",
    "https://media.giphy.com/media/ugEhMJq2sdJ3BuODgi/giphy.gif",
    "https://media.giphy.com/media/eQrYEJenozNYN6rOdC/giphy.gif"
  ];

  const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
  const path = __dirname + `/cache/taarif_${senderID}.gif`;

  api.sendMessage(`◈ ───『 جـارِ اسـتـحضـار الـبيـان 』─── ◈\n\n⌛ يرجى الوقوف إجلالاً، يتم تجهيز الهوية الملكية..\n\n◈ ──────────────── ◈`, threadID);

  const callback = async () => {
    // منح مكافأة التقشف النهائية
    await Currencies.increaseMoney(senderID, reward);

    let introMsg = `◈ ───『 هـويـة هـبـة الـمـلكـيـة 』─── ◈\n\n` +
                   `🤖 اسـم الـنـظام: هـبـة (HEBA)\n` +
                   `👑 الـمـلك والـمـطـور: الـتـوب ايـمـن\n\n` +
                   `📜 【 قـوانـيـن الإمـبـراطـوريـة 】\n` +
                   `1️⃣ الـخـدمات: تـمـنـح مـكافآت زهـيدة (تـقـشـف).\n` +
                   `2️⃣ الألـعـاب: نـظـام رهـان صـارم (دفع وأخذ).\n` +
                   `3️⃣ الـولاء: الـتـوب ايـمـن هو الـسلطة الـمطلـقة.\n\n` +
                   `🛠️ 【 كـيـف تـعـمـل 】\n` +
                   `اكـتـب ( .الاوامر ) لـتـرى مـا يُـسمح لك بـفـعله.\n\n` +
                   `💰 مـنـحـة الـقراءة: +${reward}$\n` +
                   ` ———————————————\n` +
                   `│←› الـقـائـد الأعـلـى: الـتـوب ايـمـن 👑\n` +
                   `◈ ──────────────── ◈`;

    api.sendMessage({
      body: introMsg,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);
  };

  return request(encodeURI(randomGif))
    .pipe(fs.createWriteStream(path))
    .on("close", callback);
};
