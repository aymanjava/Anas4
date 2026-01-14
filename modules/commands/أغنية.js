const axios = require('axios');
const fs = require('fs');
const { Innertube, UniversalCache } = require('youtubei.js');

async function music(event, api) {
  const input = event.body;
  const data = input.split(" ");

  if (data.includes('-مساعدة')) {
    const usage = "كيفية الإستخدام: أغنية [إسم الأغنية]\n\n" +
      "الوصف : يبحث وينزل الموسيقى من اليوتيوب. يمكنك أيضًا إستخدام -كلمات من أجل إرسال الكلمات مع الموسيقى.\n\n" +
      "مثال : أغنية fifty fifty copied\n" +
      "مثال مع كلمات: أغنية -كلمات ED sherine perfect love\n\n" +
      "ملاحظة ⚠️: الأمر يتطلب إسم الأغنية من أجل البحث عنها.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  const isLyricsIncluded = data.includes('-كلمات');
  const songTitle = isLyricsIncluded ? data.slice(2).join(" ") : data.slice(1).join(" ");

  if (songTitle.length === 0) {
    api.sendMessage(`⚠️ | إستعمال غير صالح \n💡كيفية الإستخدام: أغنية [عنوان الأغنية 📀]\n مثال 📝: أغنية fifty fifty copied`, event.threadID);
    return;
  }

  const yt = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
  const search = await yt.music.search(songTitle, { type: 'video' });

  if (search.results[0] === undefined) {
    api.sendMessage("⚠️ | لم يتم إيجاد الأغنية", event.threadID, event.messageID);
    return;
  }

  api.sendMessage(`🔍 |جاري البحث عن أغنية : ${songTitle}\n ⏱️ | المرحو الإنتظار`, event.threadID, event.messageID);

  // Get the info and stream the audio
  const info = await yt.getBasicInfo(search.results[0].id);
  const url = info.streaming_data?.formats[0].decipher(yt.session.player);
  const stream = await yt.download(search.results[0].id, {
    type: 'audio', // audio, video or video+audio
    quality: 'best', // best, bestefficiency, 144p, 240p, 480p, 720p and so on.
    format: 'mp4' // media container format 
  });

  // Write the stream to a file and calculate the download speed and time
  const file = fs.createWriteStream(`${__dirname}/../temp/music.mp3`);

  async function writeToStream(stream) {
    const startTime = Date.now();
    let bytesDownloaded = 0;

    for await (const chunk of stream) {
      await new Promise((resolve, reject) => {
        file.write(chunk, (error) => {
          if (error) {
            reject(error);
          } else {
            bytesDownloaded += chunk.length;
            resolve();
          }
        });
      });
    }

    const endTime = Date.now();
    const downloadTimeInSeconds = (endTime - startTime) / 1000;
    const downloadSpeedInMbps = (bytesDownloaded / downloadTimeInSeconds) / (1024 * 1024);

    return new Promise((resolve, reject) => {
      file.end((error) => {
        if (error) {
          reject(error);
        } else {
          resolve({ downloadTimeInSeconds, downloadSpeedInMbps });
        }
      });
    });
  }

  async function getLyrics(title) {
    return axios.get(`https://sampleapi-mraikero-01.vercel.app/get/lyrics?title=${title}`)
      .then(response => response.data.result)
      .catch(error => {
        console.error(error);
        return null;
      });
  }

  async function main() {
    const { downloadTimeInSeconds, downloadSpeedInMbps } = await writeToStream(stream);
    const fileSizeInMB = file.bytesWritten / (1024 * 1024);

    const messageBody = `🎵 | تم تحميل الأغنية بنجاح ✅!\n\nحجم الملف : ${fileSizeInMB.toFixed(2)} ميغابايت \nسرعة التحميل : ${downloadSpeedInMbps.toFixed(2)} ميغابت في الثانية\nمدة التحميل : ${downloadTimeInSeconds.toFixed(2)} ثانية`;

    if (isLyricsIncluded) {
      const lyricsData = await getLyrics(songTitle);
      if (lyricsData) {
        const lyricsMessage = `عنوان الأغنية 📃 : "${lyricsData.s_title}"\n من طرف  : ${lyricsData.s_artist}:\n\n${lyricsData.s_lyrics}`;

        api.sendMessage({
          body: `${lyricsMessage}`,
          attachment: fs.createReadStream(`${__dirname}/../temp/music.mp3`)
        }, event.threadID);
        return;
      }
    }

    const titleMessage = isLyricsIncluded ? '' : `عنوان الأغنية 📃: ${info.basic_info['title']}\n\n`;
    api.sendMessage({
      body: `${titleMessage}${messageBody}`,
      attachment: fs.createReadStream(`${__dirname}/../temp/music.mp3`)
    }, event.threadID, event.messageID);
  }

  main();
}

module.exports = music;
