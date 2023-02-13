const router = require('koa-router')()
// const superagent = require('superagent'); 
// const cheerio = require('cheerio');
// const Nightmare = require('nightmare')
// const nightmare = new Nightmare({
//   show: true,
//   openDevTools: {
//     mode: 'detach'
//   }
// })
const puppeteer = require('puppeteer');
const fs = require('fs');
const jsmediatags = require("jsmediatags");

router.get('/', async (ctx, next) => {
  const browser = await puppeteer.launch({ timeout: 50000, headless: false, slowMo: 250, executablePath: '/opt/homebrew/bin/chromium' });
  const page = await browser.newPage();

  // 从目标找hrefs
  await page.goto('http://www.baroquemusic.org/5012Web.html');
  await page.waitFor(2000);

  const hrefs = await page.$$eval('a', elements => {
    const patt = /(mp3)$/g
    const ctn = elements.reduce((total, current) => {
      let returnStr = ''
      if (patt.test(current.href)) {
        returnStr += current.href;
      }
      return returnStr ? total + '\n' + returnStr : total
    }, '');
    return ctn;
  });

  // 写入文件
  let writerStream = fs.createWriteStream('href列表.text');
  writerStream.write(hrefs, 'UTF8');
  writerStream.end();

  // 到下载网站 下载
  let _arr = hrefs.split('\n');
  for (let i = 0; i < _arr.length; i++) {
    console.log('参数：' + _arr[i])
    if (_arr[i]) {
      await upload(_arr[i])
    }
  }
  // 等待所有的音乐下载完毕，大概1分钟足够了，我用4g还是很快的
  await page.waitFor(60000);

  // 将下载到本地的音乐重命名
  // 使用jsmediatags 获取mp3文件的详细信息  title作为文件名

  const path = '/Users/xxx/Downloads/'
  const files = fs.readdirSync(path);
  const musicFilePaths =
    files.filter(function (file, index) {
      const stat = fs.statSync(path + file);
      let _arr = file.split('.');
      return !stat.isDirectory() && _arr[_arr.length - 1] === 'mp3'
    })
      .map((musicFile) => {
        return path + musicFile
      })
  musicFilePaths.map((musicFilePath) => {
    jsmediatags.read(musicFilePath, {
      onSuccess: function (tag) {
        fs.rename(musicFilePath, path + tag.tags.title + ' ' + tag.tags.artist + '.mp3', function (err) {
          if (err) {
            console.error(error);
            throw err;
          }
        })
      },
      onError: function (error) {
        console.log(':(', error.type, error.info);
      }
    });
  })


  // 不能模拟contextmenu事件，只能通过点击video的下载按钮下载，坐标我就写死了,
  // 如果在不同电脑上位置不对，需要自己去改
  // 点击下载按钮下载  无法在下载前更改下载的文件名，所以只能最后做一次修改
  async function upload(param) {
    try {
      await page.goto(param);
      await page.waitFor(2000);
      await page.mouse.click(526, 348);
      await page.mouse.click(516, 286);
    } catch (error) {
      console.error('href: ' + param)
    }

  }
  console.log('任务执行完毕')
  // await browser.close();
})




module.exports = router
