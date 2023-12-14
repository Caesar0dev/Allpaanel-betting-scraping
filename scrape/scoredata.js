import { launch } from "puppeteer";
import { Solver } from "2captcha-ts";
import { readFileSync } from "fs";
import pkg from "crypto-js";
const { CryptoJS } = pkg;
import { sendToDBServer } from "./utils.js";

const APIKEY = "4679dfcd5b6712edad67469236c15362";
const solver = new Solver(APIKEY);

const launchFootball = async () => {
  const browser = await launch({
    headless: false,
    // devtools: true,
  });
  const page = await browser.newPage();
  const preloadFile = readFileSync("./inject.js", "utf8");
  await page.evaluateOnNewDocument(preloadFile);

  // Delay function
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // await delay(3000);

  page.on("console", async (msg) => {
    const txt = msg.text();
    if (txt.includes("intercepted-params:")) {
      const params = JSON.parse(txt.replace("intercepted-params:", ""));
      console.log(params);

      try {
        console.log(`Solving the captcha...`);
        const res = await solver.cloudflareTurnstile(params);
        console.log(`Solved the captcha ${res.id}`);
        console.log(res);

        await page.evaluate((token) => {
          cfCallback(token);
        }, res.data);

        console.log("loaded captacha");
        let delay = 10000; // 100 miliseconds

        setTimeout(async () => {
          // Code to execute after the delay
          console.log("100 seconds have passed");
        }, delay);
      } catch (e) {
        console.log(e.err);
      }
    } else {
    }
  });

  /////////////////////////////// start hook response ////////////////////////////////////
  let x_csrf_token = null;
  let x_xsrf_token = null;
  await page.setRequestInterception(true);

  page.on("request", async (request) => {
    const requestHeaders = request.headers();

    // You can also check for specific headers
    if (requestHeaders["x-csrf-token"]) {
      x_csrf_token = requestHeaders["x-csrf-token"];
    }
    if (requestHeaders["x-xsrf-token"]) {
      x_xsrf_token = requestHeaders["x-xsrf-token"];
    }
  });

  page.on("response", async (response) => {
    const url = response.url();

    // Check if the response URL matches the desired URL
    if (url === "https://www.allpaanel.com/api/user/gamehighlightall2") {
      const responseBody = await response.text();

      try {
        const decryptedData = await page.evaluate((responseBody) => {
          const responseJSONData = CryptojsDecrypt(responseBody);
          // console.log("response data >>> ", responseJSONData);
          return responseJSONData.data.t1;
        }, responseBody);

        for (let i = 0; i < decryptedData.length; i++) {
          const match = decryptedData[i];
          const matchID = match.gmid;
          const iplay = match.iplay;
          // console.log("game status >>> ", iplay);
          let ScoreData = "No data";

          const launchGame = async (iplay) => {
            // console.log("--- >>> ", iplay, " <<< ---");
            if (iplay) {
              console.log("--- >>> live game <<< ---");
              const matchURL = `https://www.allpaanel.com/game-detail-other/1/${matchID}`;

              page.on("response", async (response) => {
                if (response.url().includes("get_pushes")) {
                  console.log("score data >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                  try {
                    const responseJson = await response.text();
                    ScoreData = await JSON.parse(responseJson)[0].data.event;
                  } catch (error) {
                    console.log(error);
                  }
                }
              });

              await page.goto(matchURL);
              await delay(5000);
              await page.goto("https://www.allpaanel.com/game-list/football");
            } else {
              console.log(">>> no live game!");
            }
          };
          await launchGame(iplay);

          const footballServerURL = `http://localhost:5000/scoredata`;
          console.log("score data >>> ", ScoreData);
          await sendToDBServer(footballServerURL, ScoreData);
          console.log("---------------------------------------------------");

          // console.log("data to server >>> ", dataToServer);
          // const footballServerURL = `http://localhost:5000/soccerdata`;
          // await sendToDBServer(footballServerURL, dataToServer);
        }
      } catch (error) {
        console.log("JSON input error!", error);
      }
    }
  });

  // Disable request interception
  await page.setRequestInterception(false);

  /////////////////////////////// end hook response ////////////////////////////////////

  await page.goto("https://www.allpaanel.com/", {
    waitUntil: "networkidle2",
    timeout: 0,
  });
  await page.reload();

  while (true) {
    try {
      await delay(10000);

      // login
      const userIdPath =
        '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[1]/input';
      const userIdField = await page.$x(userIdPath);
      await userIdField[0].type("JCPUNT02");

      const userPassPath =
        '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[2]/input';
      const userPassField = await page.$x(userPassPath);
      await userPassField[0].type("Jcpunt1234");

      await delay(1000);
      // click login button
      const loginButtonPath =
        '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[3]/button';
      const [loginButton] = await page.$x(loginButtonPath);
      await loginButton.click({ timeout: 300000 });

      // close modal
      await delay(2000);
      try {
        const modalCloseButtPath =
          "/html/body/div[3]/div[1]/div/div/header/button";
        const [modalCloseButton] = await page.$x(modalCloseButtPath);
        await modalCloseButton.click({ timeout: 300000 });
      } catch (error) {
        console.log("No modal!");
      }

      await page.goto("https://www.allpaanel.com/game-list/football");
    } catch (error) {}
    await delay(40000);
  }
  // await browser.close();
};

launchFootball();
