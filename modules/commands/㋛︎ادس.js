const axios = require('axios');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const { join, resolve } = require("path");

module.exports.config = {
  name: "تثبيت",
  version: "2.5.0",
  hasPermssion: 2,
  credits: "Ayman",
  description: "تثبيت الأكواد من الروابط أو رفعها للخارج - نسخة التوب",
  commandCategory: "المطور",
  usages: "[اسم_الملف] (مع رد على رابط)",
  cooldowns: 0,
  dependencies: {
      "pastebin-api": "",
      "cheerio": "",
      "request": ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { senderID, threadID, messageID, messageReply, type } = event;
  
  // حماية التوب: فقط الادمن المسجل في السورس يستطيع استخدامه
  const permission = global.config.ADMINBOT;
  if (!permission.includes(senderID)) return api.sendMessage("◯ عذراً سيدي.. هذا الأمر من صلاحيات التوب ايمن فقط 👑", threadID, messageID);

  var fileName = args[0];

  // الحالة 1: رفع كود من البوت إلى Pastebin
  if (type !== "message_reply" && fileName) {
      const path = `${__dirname}/${fileName}.js`;
      if (!fs.existsSync(path)) return api.sendMessage(`◯ الـمـلـف [ ${fileName}.js ] غـيـر مـوجـود!`, threadID, messageID);
      
      const fileContent = fs.readFileSync(path, "utf-8");
      const { PasteClient } = require('pastebin-api');
      const client = new PasteClient("R02n6-lNPJqKQCd5VtL4bKPjuK6ARhHb"); // مفتاح افتراضي

      try {
          const url = await client.createPaste({
              code: fileContent,
              expireDate: 'N',
              format: "javascript",
              name: fileName,
              publicity: 1
          });
          return api.sendMessage(`◈ ──『 رفـع الـكـود 』── ◈\n\n◯ تم رفع [ ${fileName}.js ] بنجاح\n◯ الرابط: ${url.replace('pastebin.com/', 'pastebin.com/raw/')}\n\n│←› بـإدارة الـتـوب ايـمـن 👑`, threadID, messageID);
      } catch (e) {
          return api.sendMessage("◯ فشل رفع الكود إلى Pastebin.", threadID, messageID);
      }
  }

  // الحالة 2: سحب كود من رابط وتثبيته في البوت
  if (type == "message_reply") {
      var text = messageReply.body;
      if (!fileName) return api.sendMessage("◯ يرجى كتابة اسم الملف المراد حفظ الكود فيه!\nمثال: تثبيت اعلام (مع الرد على الرابط)", threadID, messageID);

      var urlR = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
      var url = text.match(urlR);
      if (!url) return api.sendMessage("◯ الرد لا يحتوي على رابط صحيح!", threadID, messageID);

      // التعامل مع Pastebin
      if (url[0].indexOf('pastebin') !== -1) {
          let rawUrl = url[0].includes('raw') ? url[0] : url[0].replace('pastebin.com/', 'pastebin.com/raw/');
          axios.get(rawUrl).then(i => {
              fs.writeFile(`${__dirname}/${fileName}.js`, i.data, "utf-8", (err) => {
                  if (err) return api.sendMessage(`❌ فشل تثبيت الكود في ${fileName}.js`, threadID, messageID);
                  api.sendMessage(`◈ ──『 تـثـبـيـت مـلـف 』── ◈\n\n✅ تم زرع الكود في [ ${fileName}.js ]\n◯ استخدم أمر (تحديث) لتفعيل الملف الجديد.\n\n│←› بـواسطة المهندس التوب ايمن 👑`, threadID, messageID);
              });
          });
      }
      
      // التعامل مع Buildtooldev
      else if (url[0].indexOf('buildtool') !== -1) {
          request(url[0], (error, response, body) => {
              const $ = cheerio.load(body);
              $(".language-js").each((index, el) => {
                  if (index !== 0) return;
                  let code = el.children[0].data;
                  fs.writeFile(`${__dirname}/${fileName}.js`, code, "utf-8", (err) => {
                      if (err) return api.sendMessage("❌ فشل حفظ الكود.", threadID, messageID);
                      return api.sendMessage(`✅ تم سحب الكود وتثبيته في [ ${fileName}.js ] بنجاح!`, threadID, messageID);
                  });
              });
          });
      }
  }
}
