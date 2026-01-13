const fs = require("fs-extra");
const path = __dirname + '/banking/banking.json';

module.exports.config = {
  name: "بنك",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "نظام بنك هبة المتطور بإدارة المطور ايمن",
  commandCategory: "الاموال",
  usages: "[تسجيل/ايداع/سحب/عرض]",
  cooldowns: 2
};

module.exports.onLoad = async () => {
  if (!fs.existsSync(__dirname + '/banking')) fs.mkdirSync(__dirname + '/banking');
  if (!fs.existsSync(path)) fs.writeFileSync(path, "[]", "utf-8");
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID } = event;
  const adminBot = global.config.ADMINBOT; // جلب آيدي المطور ايمن
  const userData = JSON.parse(fs.readFileSync(path));
  const laisuat = 0.05; // نسبة الفائدة
  
  // دالة البحث عن الحساب
  const findUser = userData.find(i => i.senderID == senderID);

  // --- نظام المدير العام (ايمن) ---
  if (adminBot.includes(senderID) && args[0] == "مدير") {
      return api.sendMessage(`◈ ───『 إدارة البـنـك 』─── ◈\n\n◯ أهلاً بك سيدي المدير العام 『 ايـمـن 』\n◯ خزينة البنك تحت تصرفك بالكامل\n◯ رصيدك الحالي: ∞ (لانهائي)\n\n◈ ─────────────── ◈`, threadID, messageID);
  }

  switch(args[0]) {
    case 'تسجيل': {
      if (findUser) return api.sendMessage("◯ لديك حساب بالفعل في بنك هبة 🏦", threadID, messageID);
      userData.push({ senderID: senderID, money: 0, time: Date.now() });
      fs.writeFileSync(path, JSON.stringify(userData, null, 2));
      return api.sendMessage("◈ ───『 بـنـك هـبـة 』─── ◈\n\n◯ تم فتح حسابك بنجاح\n◯ ابدأ بإيداع الأموال لجمع الأرباح ✨\n\n◈ ─────────────── ◈", threadID, messageID);
    }

    case 'عرض': {
      if (!findUser) return api.sendMessage("◯ سجل أولاً عبر كتابة: بنك تسجيل", threadID, messageID);
      return api.sendMessage(`◈ ───『 رصـيـدك البنـكي 』─── ◈\n\n◯ رصيدك المودع: ${findUser.money}$\n◯ نسبة الفائدة: ${laisuat}%\n◯ الحالة: مستثمر نشط ✨\n\n◈ ─────────────── ◈`, threadID, messageID);
    }

    case 'ايداع': {
      const moneyInput = parseInt(args[1]);
      if (!moneyInput || moneyInput < 50) return api.sendMessage("◯ أقل مبلغ للإيداع هو 50$ 💰", threadID, messageID);
      if (!findUser) return api.sendMessage("◯ سجل حسابك أولاً يا غالي", threadID, messageID);
      
      let userMoney = (await Currencies.getData(senderID)).money;
      if (userMoney < moneyInput) return api.sendMessage(`◯ رصيدك الحالي لا يكفي لإيداع ${moneyInput}$`, threadID, messageID);
      
      await Currencies.decreaseMoney(senderID, moneyInput);
      findUser.money += moneyInput;
      fs.writeFileSync(path, JSON.stringify(userData, null, 2));
      return api.sendMessage(`◈ ───『 تـم الإيـداع 』─── ◈\n\n◯ تم إيداع: ${moneyInput}$ بنجاح\n◯ رصيدك البنكي الحالي: ${findUser.money}$\n\n◈ ─────────────── ◈`, threadID, messageID);
    }

    case 'سحب': {
      const moneyPull = parseInt(args[1]);
      if (!moneyPull || moneyPull < 50) return api.sendMessage("◯ أقل مبلغ للسحب هو 50$ 💰", threadID, messageID);
      if (!findUser) return api.sendMessage("◯ ليس لديك حساب بنكي", threadID, messageID);
      
      if (findUser.money < moneyPull) return api.sendMessage("◯ رصيدك في البنك لا يكفي لهذا السحب", threadID, messageID);
      
      await Currencies.increaseMoney(senderID, moneyPull);
      findUser.money -= moneyPull;
      fs.writeFileSync(path, JSON.stringify(userData, null, 2));
      return api.sendMessage(`◈ ───『 تـم الـسـحـب 』─── ◈\n\n◯ تم سحب: ${moneyPull}$\n◯ رصيدك المتبقي: ${findUser.money}$\n\n◈ ─────────────── ◈`, threadID, messageID);
    }

    default: {
      return api.sendMessage(`◈ ───『 بـنـك هـبـة 』─── ◈\n\n◯ [ بنك تسجيل ] : لفتح حساب جديد\n◯ [ بنك عرض ] : لرؤية رصيدك\n◯ [ بنك ايداع ] : لحفظ أموالك بالبنك\n◯ [ بنك سحب ] : لاستعادة أموالك\n\n◯ المطور والمدير: 『 ايـمـن 』\n◈ ─────────────── ◈`, threadID, messageID);
    }
  }
};
