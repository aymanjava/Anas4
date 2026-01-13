const axios = require('axios');
const allou_server = "https://games.proarcoder.repl.co/QSR";

module.exports.config = {
  name: "رحلة",
  version: "5.0.0",
  credits: "Ayman",
  description: "الرحلة الإمبراطورية الضخمة في قصر آدمز الغامض",
  commandCategory: "العاب",
  usages: "[اختر مسارك بالرد على الأرقام]",
  cooldowns: 5,
  usePrefix: true
};

module.exports.run = async function({ event, api, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const reward = 5; // منحة استكشاف تقشفية

  try {
    const res = await axios.get(allou_server, { params: { playerID: senderID } });
    
    // صرف المنحة الملكية لبدء الرحلة
    await Currencies.increaseMoney(senderID, reward);

    let msg = `┏━━━━━━ 🔱 ━━━━━━┓\n` +
              `  📜 مـرسـوم الـرحـلة الـمـلـكـيـة\n` +
              `┗━━━━━━ 🔱 ━━━━━━┛\n\n` +
              `🏰 سـيـدي الـمغامر، لـقد وطـأت قـدمك قـصر "آدمـز" الـمـهـجور..\n\n` +
              `📖 الـمـوقـف الـحـالـي:\n` +
              `« ${res.data.message} »\n\n` +
              `💰 مـنـحـة الـتـجوال: +${reward}$\n` +
              `●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●\n` +
              `⚖️ قـرارُك هـو مـصـيـرك:\n` +
              `← رد بـالرقم [ 1 ] أو [ 2 ] أو [ 3 ]\n\n` +
              `👑 بـإشراف: الـتـوب ايـمـن\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage(msg, threadID, (error, info) => {
      if (!error) {
        global.client.handleReply.push({
          name: this.config.name,
          author: senderID,
          messageID: info.messageID
        });
      }
    }, messageID);
  } catch (e) {
    return api.sendMessage("⚠️ سيدي، بوابة الرحلة مسدودة بفعل السحر (خطأ تقني).", threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;
  if (senderID != handleReply.author) return;

  const choiceMap = { "1": "A", "2": "B", "3": "C" };
  const userChoice = choiceMap[body];

  if (!userChoice) {
    return api.sendMessage("⚠️ تـنبـيه: الـتزم بـالأرقام [ 1 - 2 - 3 ] سـيدي الـمغامر!", threadID, messageID);
  }

  try {
    const res = await axios.get(allou_server, {
      params: { playerID: senderID, playerAnswer: userChoice }
    });

    // مسح الرسالة السابقة للحفاظ على نظافة القصر
    api.unsendMessage(handleReply.messageID);

    let msg = `┏━━━━━━ ⚔️ ━━━━━━┓\n` +
              `  🖋️ سِـجـل الـمـصـير\n` +
              `┗━━━━━━ ⚔️ ━━━━━━┛\n\n` +
              `« ${res.data.message} »\n\n` +
              `●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●\n` +
              `👑 تـحـت سـيـادة: الـتـوب ايـمـن\n` +
              `◈ ──────────────── ◈`;

    return api.sendMessage(msg, threadID, (error, info) => {
      if (!error) {
        global.client.handleReply.push({
          name: this.config.name,
          author: senderID,
          messageID: info.messageID
        });
      }
    });
  } catch (e) {
    return api.sendMessage("⚠️ سيدي، انقطع الاتصال بالأرواح في القصر!", threadID, messageID);
  }
};
