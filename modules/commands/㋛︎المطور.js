module.exports.config = {
  name: "المطور",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Hiba",
  description: "عرض معلومات مطور البوت",
  commandCategory: "النظام",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, messageID } = event;
  const request = require("request");
  const fs = require("fs-extra");

  // رابط الصورة المتحركة الذي اخترتيه
  const gifUrl = "https://media.giphy.com/media/YhqyiijLeMCpq/giphy.gif";
  const path = __dirname + "/cache/dev_gif.gif";

  const callback = () => {
    return api.sendMessage({
      body: "╭─────────────╮\n" +
            "    💎 مـعـلـومـات الـمـطـور\n" +
            "╰─────────────╯\n" +
            "🔳 الاسـم: 『 ايمن 』\n" +
            "🔳 الـرابـط: fb.com/xvk1c\n" +
            "🔳 الـجـنـس: ذكر\n" +
            "🔳 الـمـهـنة: مـطـور بوتـات\n\n" +
            "✨ شـكـراً لاسـتـخـدامـك بـوت 𝙃𝙄𝘽𝘼 ✨",
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);
  };

  return request(encodeURI(gifUrl)).pipe(fs.createWriteStream(path)).on("close", callback);
};
