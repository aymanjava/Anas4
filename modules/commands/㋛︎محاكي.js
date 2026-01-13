const fs = require("fs-extra");
// المسار الموحد لكل النقاط في البوت
const economyPath = __dirname + '/cache/global_economy.json';
const playerPath = __dirname + '/cache/players_stats.json';

module.exports.config = {
  name: "محاكي",
  version: "3.5.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "محاكي الأبطال المرتبط بالخزينة المركزية - نسخة التوب",
  commandCategory: "العاب",
  usages: "[تسجيل/بروفايل/قتال]",
  cooldowns: 2
};

module.exports.onLoad = async () => {
  if (!fs.existsSync(__dirname + '/cache')) fs.mkdirSync(__dirname + '/cache');
  if (!fs.existsSync(economyPath)) fs.writeFileSync(economyPath, "{}", "utf-8");
  if (!fs.existsSync(playerPath)) fs.writeFileSync(playerPath, "[]", "utf-8");
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
  const { threadID, messageID, senderID } = event;
  let economy = JSON.parse(fs.readFileSync(economyPath));
  let stats = JSON.parse(fs.readFileSync(playerPath));
  
  // إنشاء حساب مالي موحد إذا لم يوجد
  if (!economy[senderID]) economy[senderID] = { balance: 500 }; 
  
  let player = stats.find(i => i.id == senderID);
  const isTop = global.config.ADMINBOT.includes(senderID);

  switch(args[0]) {
    case 'تسجيل': {
      if (player) return api.sendMessage("◯ حسابك القتالي مسجل بالفعل!", threadID, messageID);
      stats.push({ id: senderID, level: 1, hp: 200, attack: 25, kills: 0 });
      fs.writeFileSync(playerPath, JSON.stringify(stats, null, 2));
      return api.sendMessage("◈ ───『 الـتـسـجـيل المـوحـد 』─── ◈\n\n◯ تم تفعيل حسابك في النظام الموحد\n◯ رصيدك الافتتاحي: 500$\n\n◈ ─────────────── ◈", threadID);
    }

    case 'بروفايل': {
      if (!player) return api.sendMessage("◯ سجل أولاً: محاكي تسجيل", threadID, messageID);
      // جلب الرصيد من الخزينة المركزية
      const totalBalance = (await Currencies.getData(senderID)).money || economy[senderID].balance;
      
      return api.sendMessage(`◈ ───『 لائـحـة الـتـوب 』─── ◈\n\n◯ الرتبة: ${isTop ? "المدير العام (التوب) 👑" : "مقاتل"} \n◯ الـمـسـتوى: ${player.level}\n◯ الـهـجـوم: ${player.attack}\n◯ الـرصـيـد المـوحـد: ${totalBalance}$\n◯ الـضـحايا: ${player.kills}\n\n◈ ─────────────── ◈`, threadID);
    }

    case 'قتال': {
      if (!player) return api.sendMessage("◯ سجل أولاً يا بطل!", threadID, messageID);
      
      const monster = { name: "تنين الفوضى", hp: 500, gold: 250, xp: 100 };
      
      if (isTop) {
        // هيبة التوب: فوز تلقائي وإضافة للمخزن الموحد
        await Currencies.increaseMoney(senderID, monster.gold * 10);
        player.kills += 1;
        fs.writeFileSync(playerPath, JSON.stringify(stats, null, 2));
        return api.sendMessage(`◈ ──『 سـيـادة الـتـوب 』── ◈\n\n◯ التنين انحنى أمامك واعتذر!\n◯ تم إضافة ${monster.gold * 10}$ لخزنتك المركزية.\n\n◈ ─────────────── ◈`, threadID);
      }

      // قتال اللاعب العادي
      let win = Math.random() > 0.5;
      if (win) {
        await Currencies.increaseMoney(senderID, monster.gold);
        player.kills += 1;
        player.level += 1;
        fs.writeFileSync(playerPath, JSON.stringify(stats, null, 2));
        api.sendMessage(`✅ هزمت الوحش وربحت ${monster.gold}$ أضيفت لرصيدك الموحد!`, threadID);
      } else {
        api.sendMessage("❌ هُزمت في المعركة.. حاول تطوير سلاحك.", threadID);
      }
      break;
    }

    default:
      api.sendMessage("◯ الأوامر: [تسجيل، بروفايل، قتال]", threadID);
  }
};
