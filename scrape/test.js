import puppeteer from 'puppeteer';
import fs from 'fs'
const targetScriptUrl = 'main-es2015.a4e6641b5c978fa1b647.js';
const newScriptPath = './source/main-es2015.a4e6641b5c978fa1b647.js';

const scrapeCricketData = async () => {
  const url = 'https://crex.live/'
  // const url = 'https://google.com'
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
  });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  const client = await page.target().createCDPSession();
  await client.send('Network.enable');

  client.on('Network.webSocketFrameReceived', ({ requestId, timestamp, response }) => {
    console.log('Live Update:', response.payloadData);
  });

  client.on('Network.webSocketFrameSent', ({ requestId, timestamp, response }) => {
    // console.log('WebSocket Frame Sent:', response.payloadData);
  });

  page.on('request', (interceptedRequest) => {
    if (interceptedRequest.url().includes(targetScriptUrl)) {
      const newScriptContent = fs.readFileSync(newScriptPath, 'utf8');
      interceptedRequest.respond({
        status: 200,
        contentType: 'application/javascript; charset=utf-8',
        body: newScriptContent
      });
      console.log('replaced source')
    } else {
      interceptedRequest.continue();
    }
  });

  // page.on('response', async response => {
  //   const responseUrl = response.url();
  //   // console.log('Response: ', responseUrl)
  // });

  // await page.setRequestInterception(false);

  const fetchUrl = 'https://ce-api-v1.appspot.com/liveMatches2.php'; // Replace with your target URL

  const responseData = await page.evaluate(async (url) => {
    try {
      const response = await fetch(url);
      return response.json(); // Assuming the response is JSON
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }, fetchUrl);

  // console.log('Initial Data: ', responseData);

  await page.goto(url, {timeout: 0})
  console.info('page loaded')

  // await page.waitForSelector('YOUR_SELECTOR');
  //
  // const cricketData = await page.evaluate(() => {
  //   const data = [];
  //   const elements = document.querySelectorAll('YOUR_SELECTOR');
  //
  //   elements.forEach((element) => {
  //     const matchDetail = element.innerText; // Modify as needed
  //     data.push(matchDetail);
  //   });
  //
  //   return data;
  // });
  //
  // console.log(cricketData);

  // Close the browser
  // await browser.close();
};

await scrapeCricketData();
