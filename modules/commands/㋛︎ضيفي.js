module.exports.config = {
  name: "ضيفي",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "إضافة عضو للمجموعة عبر الرابط، الايدي، أو الرد على رسالته",
  commandCategory: "خدمات",
  usages: "[رابط / ايدي / بالرد]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID, type, messageReply } = event;
  const botID = api.getCurrentUserID();
  const out = msg => api.sendMessage(msg, threadID, messageID);

  let id, name;

  // 1️⃣ استخراج الايدي (رد > رابط > ايدي مباشر)
  if (type == "message_reply") {
    id = messageReply.senderID;
  } else if (args[0] && args[0].includes("facebook.com")) {
    // محاولة استخراج الايدي من الرابط (بسيط)
    try {
      const res = await api.getUID(args[0]);
      id = res;
    } catch (e) {
      return out("◈ ───『 خـطـأ فـنـي 』─── ◈\n\n◯ سيدي، فشلت في استخراج الايدي من هذا الرابط.\n———————————————\n◈ ─────────────── ◈");
    }
  } else if (args[0] && !isNaN(args[0])) {
    id = args[0];
  } else {
    return out("◈ ───『 تـنـبـيـه مـلـكـي 』─── ◈\n\n◯ يرجى وضع رابط الحساب أو الايدي أو الرد على رسالة الشخص.\n———————————————\n◈ ─────────────── ◈");
  }

  // 2️⃣ جلب بيانات المجموعة والتحقق
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const { participantIDs, approvalMode, adminIDs } = threadInfo;
    const participantIDsNum = participantIDs.map(e => parseInt(e));
    
    name = await Users.getNameUser(id);
    id = parseInt(id);

    if (participantIDsNum.includes(id)) {
      return out(`◈ ───『 تـنـبـيـه 』─── ◈\n\n◯ الـعضو: ${name}\n◉ الـحالة: مـوجـود بـالـفعل فـي الـمجموعة سيدي.\n———————————————\n◈ ─────────────── ◈`);
    }

    // 3️⃣ محاولة الإضافة
    await api.addUserToGroup(id, threadID, (err) => {
      if (err) return out(`◈ ───『 فـشـل الإضـافـة 』─── ◈\n\n◯ سيدي، لم أستطع إضافة ${name}.\n◉ الـسبب: قد تكون إعدادات الخصوصية لديه تمنع ذلك.\n———————————————\n◈ ─────────────── ◈`);
      
      const isBotAdmin = adminIDs.some(e => e.id == botID);
      
      if (approvalMode && !isBotAdmin) {
        return out(`◈ ───『 طـلـب إنـضـمـام 』─── ◈\n\n◯ تـم إرسـال طـلـب إضـافـة لـ : ${name}\n◉ مـلاحظة: يـجب عـلى الـمشرفين الـموافقة.\n———————————————\n◈ ─────────────── ◈\n│←› بـإشراف: الإمـبـراطـور أيـمـن 👑`);
      } else {
        return out(`◈ ───『 تـمـت الإضـافـة 』─── ◈\n\n◯ أهـلاً بـك يـا ${name} فـي مـمـلـكة أيـمـن!\n———————————————\n◈ ─────────────── ◈\n│←› بـأوامـر: الـتـوب أيـمـن 👑`);
      }
    });

  } catch (e) {
    return out("⚠️ سيدي، حدث خطأ غير متوقع أثناء محاولة الإضافة.");
  }
};
