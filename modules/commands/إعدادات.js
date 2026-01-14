const fs = require('fs');
const path = require('path');

function readConfig() {
  const configPath = path.join(__dirname, '..', 'json', 'config.json');
  try {
    return JSON.parse(fs.readFileSync(configPath));
  } catch (error) {
    console.error('Error reading config:', error);
    return null;
  }
}

function updateConfig(settingName, value) {
  const configPath = path.join(__dirname, '..', 'json', 'config.json');
  try {
    const config = readConfig();

    if (config !== null && config.hasOwnProperty(settingName)) {
      
      if (value === 'صحيح' || value === 'خطأ') {
        config[settingName] = value === 'صحيح';
      } else {
        config[settingName] = value;
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return `✅ الإعادادات ${settingName.charAt(0).toUpperCase() + settingName.slice(1)} تم تحديثها إلى ${value} بنجاح.`;
    } else {
      return '❌ الضبط لم يتم إيجاده في الإعدادات.';
    }
  } catch (error) {
    console.error('Error updating config:', error);
    return '❌ An error occurred while updating the configuration.';
  }
}

function configCommand(event, api) {
  const input = event.body.toLowerCase().split(' ');

  if (input.includes('-مساعدة')) {
    const usage = '💡 كيفية الإستعمال:\n\n' +
      'من أجل ان ترى الإعدادات:\nإعدادات\n\n' +
      'من أجل تحديث الإعدادات (فقط_الآدمن):\nدالإعدادات -ضبط [إسم الإعدادت] [القيمة]\n\n' +
      'مثال:\nإعدادات -ضبض البادئة $\n\n' +
      'ملاحظة ⚠️: يمكن أن تكون القيمة أي قيمة JSON صالحة، مثل true أو false أو سلسلة.';
    api.sendMessage(usage, event.threadID);
    return;
  }

  if (input.includes('-ضبط')) {
    if (!isadmins(event.senderID)) {
      api.sendMessage(" ⚠️ | ليس لديك الصلاحية لإستخدام هذا الأمر [-ضبط] فقط حسين يعقوبي يمكنه ذالك", event.threadID);
      return;
    }

    const settingName = input[input.indexOf('-ضبط') + 1];
    const value = input.slice(input.indexOf('-ضبط') + 2).join(' ');

    if (settingName) {
      const result = updateConfig(settingName, value);
      api.sendMessage(result, event.threadID, event.messageID);
    } else {
      api.sendMessage('⚠️ | إستخدام غير صالح . أكتب "إعدادات -مساعدة" من أجل تعليمات حول كيفية الإستخدام.', event.threadID, event.messageID);
    }
  } else {
    const config = readConfig();
    if (config !== null) {
      let formattedConfig = [];
      for (const [key, val] of Object.entries(config)) {
        if (key === 'admins') {
          const adminsCount = val.length;
          formattedConfig.push(`├─⦿ ${key.charAt(0).toUpperCase() + key.slice(1)}: ${val[0]} +${adminsCount - 1}`);
        } else if (key === 'vips' && val.length > 0) {
          formattedConfig.push(`├─⦿ ${key.charAt(0).toUpperCase() + key.slice(1)}: ${val[0]} +${val.length - 1}`);
        } else {
          formattedConfig.push(`├─⦿ ${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`);
        }
      }

      const message = `
┌────[ الإعدادات ]────⦿
│
${formattedConfig.join('\n')}
│
└────────⦿
      `;
      api.sendMessage(message, event.threadID, event.messageID);
    } else {
      api.sendMessage('❌ | حدث خطأ أثناء قراءة التكوين.', event.threadID, event.messageID);
    }
  }
}

function isadmins(userId) {
  const config = readConfig();
  if (config !== null && config.hasOwnProperty('admins')) {
    const adminsList = config.admins || [];
    return adminsList.includes(userId);
  }
  return false;
}

module.exports = configCommand;
