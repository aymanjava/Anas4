const fs = require("fs-extra");
const path = __dirname + '/cache/players.json';

module.exports.config = {
  name: "محاكي",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "محاكاة خيالية ضخمة - نسخة التوب ايمن",
  commandCategory: "العاب",
  usages: "[تسجيل/بروفايل/قتال/متجر/ترقية]",
  cooldowns: 5
};

module.exports.onLoad = async () => {
  if (!fs.existsSync(__dirname + '/cache')) fs.mkdirSync(__dirname + '/cache');
  if (!fs.existsSync(path)) fs.writeFileSync(path, "[]", "utf-8");
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;
  let data = JSON.parse(fs.readFileSync(path));
  let player = data.find(i => i.id == senderID);
  const adminBot = global.config.ADMINBOT;

  // --- الوحوش والزعماء ---
  const monsters = [
    { name: "التنين الأسود", hp: 300, attack: 35, xp: 150, gold: 100 },
    { name: "فارس الظلام", hp: 200, attack: 25, xp: 100, gold: 60 },
    { name: "غول الجبل", hp: 150, attack: 15, xp: 70, gold: 40 },
    { name: "ساحر الجليد", hp: 120, attack: 40, xp: 90, gold: 50 },
    { name: "الزعيم المرعب", hp: 1000, attack: 100, xp: 1000, gold: 500 }
  ];

  // --- نظام المتجر ---
  const shop = [
    { item: "سيف الأساطير", price: 500, boost: 30 },
    { item: "درع التنين", price: 400, boostHp: 100 },
    { item: "جرعة الشفاء", price: 50, heal: 100 }
  ];

  // التحقق إذا كان المستخدم هو "التوب"
  const isTop = adminBot.includes(senderID);

  switch(args[0]) {
    case 'تسجيل': {
      if (player) return api.sendMessage("◯ أنت مسجل بالفعل كبطل!", threadID, messageID);
      const name = await Users.getNameUser(senderID);
      data.push({
        id: senderID, name: name, level: 1, hp: 150, maxHp: 150, 
        attack: 20, xp: 0, gold: 200, kills: 0, items: []
      });
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage(`◈ ───『 الـتـسـجـيل 』─── ◈\n\n◯ أهلاً بك يا ${name} في العالم الضخم\n◯ تم منحك موارد البداية المتطورة\n\n◈ ─────────────── ◈`, threadID);
    }

    case 'بروفايل': {
      if (!player) return api.sendMessage("◯ سجل أولاً عبر كتابة: محاكي تسجيل", threadID, messageID);
      let status = isTop ? "التوب والمدير العام 👑" : "بطل مغامر ⚔️";
      return api.sendMessage(`◈ ───『 لائحة المعلومات 』─── ◈\n\n◯ الرتبة: ${status}\n◯ الاسم: ${player.name}\n◯ المستوى: ${player.level}\n◯ الدم: ${player.hp}/${player.maxHp}\n◯ الهجوم: ${player.attack}\n◯ الذهب: ${player.gold}$\n◯ الضحايا: ${player.kills}\n\n◈ ─────────────── ◈`, threadID);
    }

    case 'قتال': {
      if (!player) return api.sendMessage("◯ سجل أولاً يا بطل!", threadID, messageID);
      const enemy = monsters[Math.floor(Math.random() * monsters.length)];
      
      // إذا كان "التوب" يقاتل، هو دائماً يفوز
      if (isTop) {
        player.gold += enemy.gold * 2;
        player.xp += enemy.xp * 2;
        player.kills += 1;
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        return api.sendMessage(`◈ ──『 هيبة التوب ايمن 』── ◈\n\n◯ واجهت ${enemy.name} وهرب منك رعباً!\n◯ حصدت جوائز مضاعفة تلقائياً ✨\n\n◈ ─────────────── ◈`, threadID);
      }

      let playerHp = player.hp;
      let enemyHp = enemy.hp;
      while (playerHp > 0 && enemyHp > 0) {
        enemyHp -= Math.floor(Math.random() * player.attack) + 10;
        if (enemyHp > 0) playerHp -= Math.floor(Math.random() * enemy.attack);
      }

      if (playerHp > 0) {
        player.gold += enemy.gold;
        player.xp += enemy.xp;
        player.hp = playerHp;
        player.kills += 1;
        api.sendMessage(`◈ ──『 نـصـر مـؤزر 』── ◈\n\n◯ هزمت ${enemy.name} بنجاح!\n◯ ربحت ${enemy.gold}$ ودمك المتبقي ${playerHp}\n\n◈ ─────────────── ◈`, threadID);
      } else {
        player.hp = 30;
        api.sendMessage(`◈ ──『 هـزيـمة 』── ◈\n\n◯ سحقتك قوة ${enemy.name}..\n\n◈ ─────────────── ◈`, threadID);
      }
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      break;
    }

    default:
      return api.sendMessage(`◈ ──『 محاكي هبة الضخم 』── ◈\n\n◯ [ محاكي تسجيل ]\n◯ [ محاكي بروفايل ]\n◯ [ محاكي قتال ]\n◯ [ محاكي متجر ]\n\n│←› إدارة: التوب ايمن 👑\n◈ ─────────────── ◈`, threadID);
  }
};
