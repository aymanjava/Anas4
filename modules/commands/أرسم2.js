const fs = require('fs');
const https = require('https');
const {
  Configuration,
  OpenAIApi
} = require("openai");
const path = require('path');
const apiKeysPath = path.join(__dirname, '..', 'json', 'api_config.json');
const apiKeys = JSON.parse(fs.readFileSync(apiKeysPath));
const openaiApiKey = apiKeys.openai;

async function dalle(event, api) {
  const input = event.body.trim();

  if (input.includes("-مساعدة")) {
    const usage = "كيفية الإستخدام: أرسم2 [كلمات الوصف]\n\n" +
      "الوصف : قم بتوليد صور إنطلاقا من جمل وصفك.\n\n" +
      "مثال : أرسم2 طفل جالس في الحديقة يتأمل في النجوم \n\n" +
      "ملاحظة ⚠️: الأمر يحتاج إلى إدخال جمل محدد من أجل الحصول على نتائج أفضل.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const prompt = encodeURIComponent(input.slice(6));
  const configuration = new Configuration({
    apiKey: openaiApiKey,
  });
  const openai = new OpenAIApi(configuration);

  try {
    api.sendMessage(" ⏱️ |» جاري توليد الصورة...\nالمرحو الإنتظار......", event.threadID, event.messageID);
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    const image_url = response.data.data[0].url;
    const imagePath = path.join(__dirname, '../temp/genimg.jpg');

    https.get(image_url, (linkResponse) => {
      const fileStream = fs.createWriteStream(imagePath);
      linkResponse.pipe(fileStream);
      fileStream.on('finish', () => {
        console.log("Image saved!");
        var message = {
          body: " ✅ | تم توليد الصورة بنجاح",
          attachment: fs.createReadStream(imagePath)
        };
        api.sendMessage(message, event.threadID, event.messageID);
      });
    });
  } catch (error) {
    console.log(error);
    api.sendMessage("آسف لم أستطع توليد الصور في هذه الأثناء .\nأرجوك حاول لاحقا لأنني متعب وكسول 🥱.", event.threadID, event.messageID);
  }
}

module.exports = dalle;
