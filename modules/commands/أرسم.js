async function polli(event, api) {
  const input = event.body.trim();

  if (input.includes('-مساعدة')) {
    const usage = "استخدام: أرسم [النص]\n\n" +
      "الوصف: يولد صورة بناءً على النص المقدم باستخدام Pollinations AI ويُرسلها لك.\n\n" +
      "مثال: أرسم فتاة يابانية جميلة";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const basePrompt = input;
  if (!basePrompt) return api.sendMessage(" ❌ | يرجى تقديم شيء لرسمه!", event.threadID);

  const prompt = await randomizer(basePrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=-1&nologo=true`;

  try {
    api.sendMessage(' ⏱️ | جاري توليد الصورة...\nيرجى الانتظار أثناء معالجة طلبك.', event.threadID);
    const imageBuffer = await downloadImage(imageUrl);
    const imagePath = path.join(__dirname, `../temp/polliimg${prompt.replace(basePrompt, "")}.png`);

    fs.writeFileSync(imagePath, imageBuffer);

    const message = {
      body: ' ✨ | إليك الصورة التي طلبتها:',
      attachment: fs.createReadStream(imagePath)
    };
    api.sendMessage(message, event.threadID, () => fs.unlinkSync(imagePath), event.messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage('🛠️ | حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقًا.', event.threadID, event.messageID);
  }
}

async function randomizer(prompt) {
  let randNum = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
  let newPrompt = prompt.concat("%", randNum);
  return newPrompt;
}
