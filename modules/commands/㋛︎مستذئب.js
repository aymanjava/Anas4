const fs = require("fs-extra");

module.exports.config = {
  name: "مستذئب",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "لعبة المستذئبين الضخمة المربوطة بالخزينة المركزية - نسخة التوب",
  commandCategory: "العاب",
  usages: "[انشاء/انضمام/ابدأ/خروج]",
  cooldowns: 1
};

// إنشاء المجلد والملف إذا لم يوجد لضمان عدم ضياع النقاط
if (!global.moduleData) global.moduleData = {};
if (!global.moduleData.masoi) global.moduleData.masoi = new Map();

module.exports.handleEvent = async ({ event, api, Users, Currencies }) => {
  const { senderID, threadID, body, messageID } = event;
  const values = global.moduleData.masoi.get(threadID);
  if (!values || values.start != 1) return;

  // نظام توزيع الجوائز عند انتهاء اللعبة (مثال عند فوز القرويين)
  if (body == "فوز القرويين" && senderID == values.author) { // مثال لتبسيط المنطق
      for (let p of values.player) {
          if (p.phe == "قروي") {
              const bonus = 500; // جائزة الفوز
              await Currencies.increaseMoney(p.id, bonus);
              api.sendMessage(`🎊 مبروك [ ${p.name} ] لقد فزت بـ ${bonus}$ أضيفت لخزنتك الموحدة!`, p.id);
          }
      }
      global.moduleData.masoi.delete(threadID);
      return api.sendMessage("◈ ──『 انتهت اللعبة 』── ◈\n\n◯ فاز القرويون وتم توزيع الجوائز على الخزينة المركزية.\n\n◈ ─────────────── ◈", threadID);
  }
};

module.exports.run = async ({ api, event, args, Users, Currencies }) => {
  const { senderID, threadID, messageID } = event;
  var values = global.moduleData.masoi.get(threadID) || null;
  const isTop = global.config.ADMINBOT.includes(senderID);

  if (args[0] == "انشاء" || args[0] == "إنشاء") {
    if (values) return api.sendMessage("◯ المجموعة لديها غرفة مستذئبين نشطة بالفعل!", threadID, messageID);
    
    global.moduleData.masoi.set(threadID, {
      "author": senderID,
      "start": 0,
      "phanvai": 0,
      "player": [{ "id": senderID, "name": await Users.getNameUser(senderID), "vai": "", "phe": "", "ready": true }]
    });
    
    return api.sendMessage(`◈ ───『 غـرفـة الـمستـذئبـين 』─── ◈\n\n◯ تم إنشاء الغرفة بنجاح!\n◯ اكتب: [.مستذئب انضمام] للمشاركة\n\n│←› المنشئ: ${isTop ? "سـيدي الـتـوب ايـمـن 👑" : "مستخدم"}\n◈ ─────────────── ◈`, threadID);
  }

  if (args[0] == "انضمام") {
    if (!values) return api.sendMessage("◯ لا توجد غرفة مفتوحة حالياً!", threadID, messageID);
    if (values.start == 1) return api.sendMessage("◯ اللعبة بدأت بالفعل، انتظر الجولة القادمة.", threadID, messageID);
    if (values.player.find(p => p.id == senderID)) return api.sendMessage("◯ أنت مسجل في الغرفة مسبقاً!", threadID, messageID);

    values.player.push({ "id": senderID, "name": await Users.getNameUser(senderID), "vai": "", "phe": "" });
    global.moduleData.masoi.set(threadID, values);
    return api.sendMessage(`✅ انضم [ ${await Users.getNameUser(senderID)} ] بنجاح! (العدد: ${values.player.length})`, threadID);
  }

  if (args[0] == "ابدأ" || args[0] == "ابدا") {
    if (!values) return api.sendMessage("◯ لا توجد غرفة للبدء!", threadID, messageID);
    if (values.author != senderID && !isTop) return api.sendMessage("◯ فقط المالك أو التوب يمكنه بدء اللعبة!", threadID, messageID);
    if (values.player.length < 4) return api.sendMessage("◯ يجب توفر 4 لاعبين على الأقل للبدء وضمان الحماس!", threadID, messageID);

    values.start = 1;
    // توزيع الأدوار الضخم
    const roles = [
        { name: "طبيب", side: "قروي" }, { name: "عراف", side: "قروي" },
        { name: "مستذئب", side: "مستذئب" }, { name: "قاتل محترف", side: "منفرد" }
    ];

    for (let p of values.player) {
        let r = roles[Math.floor(Math.random() * roles.length)];
        p.vai = r.name;
        p.phe = r.side;
        // إرسال الدور للخاص
        api.sendMessage(`◈ ──『 دورك الـسـري 』── ◈\n\n◯ دورك: ${p.vai}\n◯ فريقك: ${p.phe}\n\n◯ جائزة الفوز ستذهب لـ "الخزينة المركزية"\n◈ ─────────────── ◈`, p.id);
    }

    return api.sendMessage("◈ ───『 بـدء الـمـجزرة 』─── ◈\n\n◯ تم إرسال الأدوار لجميع اللاعبين في الخاص.\n◯ الجوائز المالية مرتبطة بحساباتكم في البنك والمحاكي.\n\n│←› بـإشـراف: الـتـوب ايـمـن 👑\n◈ ─────────────── ◈", threadID);
  }

  if (args[0] == "خروج") {
      if (!values) return api.sendMessage("◯ لا توجد غرفة لتخرج منها.", threadID);
      if (values.author == senderID) {
          global.moduleData.masoi.delete(threadID);
          return api.sendMessage("◯ قام التوب/المالك بإغلاق الغرفة.", threadID);
      }
      values.player = values.player.filter(p => p.id != senderID);
      return api.sendMessage("◯ غادرت الغرفة بنجاح.", threadID);
  }

  // عرض القائمة
  let list = values ? values.player.map((p, i) => `${i+1}. ${p.name}`).join("\n") : "لا يوجد لاعبين";
  return api.sendMessage(`◈ ──『 قـائـمـة الـمستـذئبيـن 』── ◈\n\n${list}\n\n◯ اكتب [.مستذئب انضمام] للعب\n◈ ─────────────── ◈`, threadID);
};
