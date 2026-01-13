module.exports.config = {
  name: "رهان",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "آلة السلوت الإمبراطورية - جرب حظك أو اخسر مالك",
  commandCategory: "العاب",
  usages: "[المبلغ]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const { getData, increaseMoney, decreaseMoney } = Currencies;
  const slotItems = ["🍇", "🍉", "🍊", "🍏", "7⃣", "🍓", "🍒", "🍌", "🥝", "🥑", "🌽"];
  const moneyUser = (await getData(senderID)).money;

  var moneyBet = parseInt(args[0]);

  // فحص شروط الرهان الإمبراطوري
  if (isNaN(moneyBet) || moneyBet <= 0) 
    return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n⚠️ سيدي المراهن، يجب عليك تحديد مبلغ الرهان أولاً.\nمثال: .رهان 100\n\n◈ ──────────────── ◈", threadID, messageID);
  
  if (moneyBet > moneyUser) 
    return api.sendMessage("◈ ───『 تـنـبـيـه 』─── ◈\n\n❌ رصيدك لا يكفي لدخول هذه المخاطرة.. اذهب واجمع المال أولاً!\n\n◈ ──────────────── ◈", threadID, messageID);
  
  if (moneyBet < 50) 
    return api.sendMessage("◈ ───『 قـانون الـتقـشف 』─── ◈\n\n⚠️ الحد الأدنى للرهان في إمبراطورية هبة هو 50$.\n\n◈ ──────────────── ◈", threadID, messageID);

  var number = [], win = false;
  for (let i = 0; i < 3; i++) number[i] = Math.floor(Math.random() * slotItems.length);

  // حساب الأرباح (ضرب المبلغ في 9 إذا تطابقت الـ 3، وفي 2 إذا تطابق 2)
  if (number[0] == number[1] && number[1] == number[2]) {
      moneyBet *= 9;
      win = true;
  }
  else if (number[0] == number[1] || number[0] == number[2] || number[1] == number[2]) {
      moneyBet *= 2;
      win = true;
  }

  const result = `🎰 | ${slotItems[number[0]]} | ${slotItems[number[1]]} | ${slotItems[number[2]]} | 🎰`;

  if (win) {
    await increaseMoney(senderID, moneyBet);
    return api.sendMessage(`┏━━━━━━ 💰 ━━━━━━┓\n   مـبـروك أيـهـا الـمـحظـوظ\n┗━━━━━━ 💰 ━━━━━━┛\n\n${result}\n\n✨ لقد ابتسم لك الحظ وفزت بمبلغ: ${moneyBet}$\n📦 تم إيداع الأرباح في خزنتك.\n\n👑 بـرعـاية: الـتـوب ايـمـن\n◈ ──────────────── ◈`, threadID, messageID);
  } else {
    await decreaseMoney(senderID, moneyBet);
    return api.sendMessage(`┏━━━━━━ 💸 ━━━━━━┓\n   الـخـسـارة الـمـؤلـمـة\n┗━━━━━━ 💸 ━━━━━━┛\n\n${result}\n\n❌ للأسف، لقد ذهبت أموالك إلى خزينة الإمبراطورية.\n📉 الخسارة: -${moneyBet}$\n\n👑 سـيـادة: الـتـوب ايـمـن\n◈ ──────────────── ◈`, threadID, messageID);
  }
}
