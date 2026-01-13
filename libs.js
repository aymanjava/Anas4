// ────────────── جميع مكتبات مشروع 𝑯𝑬𝑩𝑨 𝑩𝑶𝑻 ──────────────

// NPM Libraries الأساسية
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const canvas = require('canvas');
const cheerio = require('cheerio');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const fetch = require('node-fetch');
const sqlite3 = require('sqlite3').verbose();
const stringSimilarity = require('string-similarity');

// أدوات البوت ووسائط
const ytdl = require('ytdl-core');
const distube = require('@distube/ytdl-core');
const youtubeSearch = require('youtube-search-api');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const fluentFfmpeg = require('fluent-ffmpeg');
const admZip = require('adm-zip');
const figlet = require('figlet');
const chalk = require('chalk');
const cfonts = require('cfonts');
const gifencoder = require('gifencoder');
const gtts = require('gtts');
const helmet = require('helmet');
const imageDownloader = require('image-downloader');
const imgur = require('imgur');
const javascriptObfuscator = require('javascript-obfuscator');
const jimp = require('jimp');
const npmlog = require('npmlog');

// قواعد البيانات وORM
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// الذكاء الاصطناعي
const gpti = require('gpti');

// الشبكات وAPI
const got = require('got');
const pino = require('pino');
const winston = require('winston');
const redis = require('redis');
const ioredis = require('ioredis');
const mqtt = require('mqtt');

// أدوات أخرى متنوعة
const qrcode = require('qrcode');
const formidable = require('formidable');
const pdfLib = require('pdf-lib');
const pdfkit = require('pdfkit');
const nodeCron = require('node-cron');
const nodeSchedule = require('node-schedule');
const tinyurl = require('tinyurl');
const totpGenerator = require('totp-generator');
const wikijs = require('wikijs');

// الصوتيات والموسيقى
const playDl = require('play-dl');
const musicMetadata = require('music-metadata');
const soundcloudDownloader = require('soundcloud-downloader');

// التخزين والكاش
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const axiosRetry = require('axios-retry');

// أدوات مساعدة
const inquirer = require('inquirer');
const enquirer = require('enquirer');
const cliProgress = require('cli-progress');
const ora = require('ora');
const nodeNotifier = require('node-notifier');
const emojiRegex = require('emoji-regex');
const chance = require('chance').Chance();
const randomWords = require('random-words');

// ⬅️ تصدير جميع المكتبات للاستخدام الخارجي
module.exports = {
  fs,
  path,
  axios,
  bodyParser,
  canvas,
  cheerio,
  cors,
  express,
  rateLimit,
  moment,
  momentTimezone,
  fetch,
  sqlite3,
  stringSimilarity,
  ytdl,
  distube,
  youtubeSearch,
  ffmpegInstaller,
  fluentFfmpeg,
  admZip,
  figlet,
  chalk,
  cfonts,
  gifencoder,
  gtts,
  helmet,
  imageDownloader,
  imgur,
  javascriptObfuscator,
  jimp,
  npmlog,
  Sequelize,
  bcrypt,
  jwt,
  gpti,
  got,
  pino,
  winston,
  redis,
  ioredis,
  mqtt,
  qrcode,
  formidable,
  pdfLib,
  pdfkit,
  nodeCron,
  nodeSchedule,
  tinyurl,
  totpGenerator,
  wikijs,
  playDl,
  musicMetadata,
  soundcloudDownloader,
  cookie,
  cookieParser,
  axiosRetry,
  inquirer,
  enquirer,
  cliProgress,
  ora,
  nodeNotifier,
  emojiRegex,
  chance,
  randomWords
};
