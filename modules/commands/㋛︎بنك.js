const fs = require("fs-extra");
const path = __dirname + '/banking/central_vault.json';

module.exports.config = {
  name: "بنك",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "الخزينة المركزية الموحدة لكل نقاط الألعاب - نسخة التوب",
  commandCategory: "الاموال",
  usages: "[تسجيل/ايداع/سحب/عرض/منح]",
  cooldowns: 2
};

module.exports.onLoad = async () => {
  if (!fs.existsSync(__dirname + '/banking')) fs.mkdirSync(__dirname + '/banking');
  if (!fs.existsSync(path)) fs.writeFileSync(path, "{}", "utf-8");
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID } = event;
  let vault = JSON.parse(fs.readFileSync(path));
  const isTop = global.config.ADMINBOT.includes(senderID);

  // التأكد من وجود حساب في الخزينة
  if (!vault[senderID]) vault[senderID] = { bank_balance: 0, last_interest: Date.now() };

  switch(args[0]) {
    case 'تسجيل': {
      return api.sendMessage("◈ ──『 الـبـنـك الـمـركـزي 』── ◈\n\n◯ حسابك مفعل تلقائياً ومرتبط بكل الألعاب\n◯ أي نقطة تربحها في (اعلام/محاكي) تظهر هنا\n\n◈ ─────────────── ◈", threadID);
    }

    case 'عرض': {
      // جلب النقاط من النظام الموحد (التي جمعها من الألعاب)
      let pocketMoney = (await Currencies.getData(senderID)).money || 0;
      let bankMoney = vault[senderID].bank_balance;
      
      let msg = `◈ ──『 خـزيـنـة: ${isTop ? "الـتـوب ايـمـن" : "الـمـسـتـخـدم"} 』── ◈\n\n`;
      msg += `💰 نـقاط الألعاب (بجيبك): ${pocketMoney}$\n`;
      msg += `🏦 الـمـودع فـي البـنـك: ${bankMoney}$\n`;
      msg += `📈 الإجمالي الشامل: ${pocketMoney + bankMoney}$\n\n`;
      msg += `│←› نـظـام مـوحـد بـإدارة ايـمـن 👑\n`;
      msg += `◈ ─────────────── ◈`;
      return api.sendMessage(msg, threadID, messageID);
    }

    case 'ايداع': {
      let pocketMoney = (await Currencies.getData(senderID)).money || 0;
      let depositAmt = args[1] == "كل" ? pocketMoney : parseInt(args[1]);

      if (!depositAmt || depositAmt <= 0 || depositAmt > pocketMoney) 
        return api.sendMessage("◯ المبلغ غير صحيح أو جيبك فارغ!", threadID);

      await Currencies.decreaseMoney(senderID, depositAmt);
      vault[senderID].bank_balance += depositAmt;
      fs.writeFileSync(path, JSON.stringify(vault, null, 2));
      
      return api.sendMessage(`✅ تم نقل ${depositAmt}$ من نقاط الألعاب إلى الخزينة المركزية بنجاح.`, threadID);
    }

    case 'سحب': {
      let bankMoney = vault[senderID].bank_balance;
      let withdrawAmt = args[1] == "كل" ? bankMoney : parseInt(args[1]);

      if (!withdrawAmt || withdrawAmt <= 0 || withdrawAmt > bankMoney) 
        return api.sendMessage("◯ رصيدك في البنك لا يكفي!", threadID);

      await Currencies.increaseMoney(senderID, withdrawAmt);
      vault[senderID].bank_balance -= withdrawAmt;
      fs.writeFileSync(path, JSON.stringify(vault, null, 2));
      
      return api.sendMessage(`✅ تم سحب ${withdrawAmt}$ إلى جيبك لاستخدامها في الألعاب.`, threadID);
    }

    // --- صلاحيات التوب فقط ---
    case 'منح': {
      if (!isTop) return api.sendMessage("◯ هـذا الأمـر خـاص بـالـتـوب ايـمـن فـقـط 👑", threadID);
      let amount = parseInt(args[1]);
      let mention = Object.keys(event.mentions)[0];
      if (!mention || !amount) return api.sendMessage("◯ مـنـشـن الـشـخـص واكـتـب الـمـبـلغ", threadID);
      
      await Currencies.increaseMoney(mention, amount);
      return api.sendMessage(`👑 سيدي التوب.. تم منح ${amount}$ للمستخدم المذكور من خزينة الإدارة.`, threadID);
    }

    default:
      return api.sendMessage(`◈ ──『 بـنـك هـبـة الـمـركـزي 』── ◈\n\n◯ [ بنك عرض ] : كشف الحساب الشامل\n◯ [ بنك ايداع ] : نقل النقاط للخزينة\n◯ [ بنك سحب ] : استعادة النقاط للعب\n\n│←› الـمـديـر الـعـام: الـتـوب ايـمـن 👑\n◈ ─────────────── ◈`, threadID);
  }
};
