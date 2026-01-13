module.exports.config = {
  name: "اوامر",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "Ayman",
  description: "قائمة أوامر البوت هبة مع فئة اسلاميات",
  commandCategory: "النظام",
  usages: "[رقم الفئة]",
  usePrefix: true,
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Commands }) {
  const { threadID, messageID } = event;

  // تنظيم الأوامر حسب الفئات (إضافة الفئة السادسة)
  const categories = {
    "1": "فئة الترفيه",
    "2": "فئة الذكاء والصور",
    "3": "فئة الإدارة والأنظمة",
    "4": "فئة الألعاب",
    "5": "فئة المتفرقات",
    "6": "فئة اسلاميات"
  };

  // القائمة الرئيسية باسم هبة
  if (!args[0] || !categories[args[0]]) {
    let msg = `╭━━━━• 𝑯𝑬𝑩𝑨 •━━━━╮\n`;
    msg += `أهلاً بك في قائمة الفئات\n`;
    msg += `اختر رقم الفئة ليتم عرض أوامرها:\n\n`;
    
    for (let key in categories) {
      msg += `${key} ⟢ ${categories[key]}\n`;
    }
    
    msg += `╰━━━━━━━━━━━━━━━━╯\n`;
    msg += `ارسل [اوامر + رقم الفئة] لرؤيتها`;

    return api.sendMessage(msg, threadID, messageID);
  }

  // عرض أوامر الفئة المختارة
  const chosenName = categories[args[0]];
  let cmdList = [];
  
  const commands = Array.from(Commands.values());
  commands.forEach(cmd => {
    // التحقق من فئة الأمر ومطابقتها تماماً
    if (cmd.config.commandCategory === chosenName) {
      cmdList.push(cmd.config.name);
    }
  });

  let helpMsg = `╭━━━━• ${chosenName} •━━━━╮\n\n`;
  
  if (cmdList.length > 0) {
    helpMsg += cmdList.join(" | ");
  } else {
    helpMsg += `لا توجد أوامر في هذه الفئة حالياً`;
  }
  
  helpMsg += `\n\n╰━━━━━━━━━━━━━━━━╯`;

  return api.sendMessage(helpMsg, threadID, messageID);
};
