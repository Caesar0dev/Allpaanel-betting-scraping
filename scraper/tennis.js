import { launch } from "puppeteer";
import { Solver } from "2captcha-ts";
import { readFileSync } from "fs";
import pkg from 'crypto-js';
const { CryptoJS } = pkg;
import {sendToDBServer} from "./utils.js";

const APIKEY = "4679dfcd5b6712edad67469236c15362";
const solver = new Solver(APIKEY);

const launchTennis = async () => {
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
            const params = JSON.parse(
                txt.replace("intercepted-params:", "")
            );
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

    page.on('request', async (request) => {
        const requestHeaders = request.headers();

        // You can also check for specific headers
        if (requestHeaders['x-csrf-token']) {
            x_csrf_token = requestHeaders['x-csrf-token'];
        }
        if (requestHeaders['x-xsrf-token']) {
            x_xsrf_token = requestHeaders['x-xsrf-token'];
        }
    });

    let isLoggingIn = false;
    let isUsername = false;
    let isPassword=false
    page.on('response', async (response) => {

        const url = response.url();

        console.log(url)
        console.log(page.url())
        if (page.url().includes("login")&&isLoggingIn==false) {
         
            try {
                page.waitForNavigation()
                const userIdPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[1]/input';
                const userIdField = await page.$x(userIdPath);
                if (!isUsername) {
                    
                    await userIdField[0].type('jcpbook3');
                }
               
            
                const userPassPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[2]/input';
                const userPassField = await page.$x(userPassPath);
                if (!isPassword) {
                    
                    await userPassField[0].type('Abcd2233');
                }
            
                // click login button
                const loginButtonPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[3]/button';
                const [loginButton] = await page.$x(loginButtonPath);

                
                loginButton.click()
                await page.waitForNavigation()
                isLoggingIn = false;
                isUsername = true;
                isPassword = true
                delay(5000)
                await page.goto('https://www.allpaanel.com/game-list/tennis');
            } catch (error) {
                console.error("Error during login:", error);
            }
        }

        // Check if the response URL matches the desired URL
        if (url === 'https://www.allpaanel.com/api/user/gamehighlightall2') {

            const responseBody = await response.text()

            try {
                const decryptedData = await page.evaluate((responseBody) => {
                    const responseJSONData = CryptojsDecrypt(responseBody);
                    return responseJSONData.data.t1;
                }, responseBody);
                let fullMatch = []
                for (let i = 0; i < decryptedData.length; i++) {
                    const match = decryptedData[i];
                  const matchID = match.gmid;
                  const dataID = match.mid;
                    const etid = match.etid;
                    const m = match.m;
                    let matchURL = null;
                    let apiTag = null;
                  let dataToServer = null;
                  
                  let data = {}
                  Object.assign(data,{ id: matchID, marketId: dataID })

                    if (etid == 2) {
                        matchURL = `https://www.allpaanel.com/game-detail-other/2/${matchID}`;
                        apiTag = '/api/game/getgamedata2';
                        dataToServer = await page.evaluate(async (matchID, m, etid, apiTag, matchURL, x_csrf_token, x_xsrf_token) => {
                            // defined body
                            
                            const resultBody = {gameId: matchID, m: m, etid: etid, mod: 101};
                            const encryptedresult = CryptojsEncrypt(resultBody);
                            const result = await fetch(apiTag, {
                                "headers": {
                                    "accept": "application/json, text/plain, */*",
                                    "accept-language": "en-US,en;q=0.9",
                                    "authorization": "Bearer b221bcdb159109973fb08ab1b70cbb04fdec7783",
                                    "content-type": "application/json;charset=UTF-8",
                                    "sec-ch-ua": "\"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                                    "sec-ch-ua-mobile": "?0",
                                    "sec-ch-ua-platform": "\"Windows\"",
                                    "sec-fetch-dest": "empty",
                                    "sec-fetch-mode": "cors",
                                    "sec-fetch-site": "same-origin",
                                    "x-csrf-token": x_csrf_token,
                                    "x-requested-with": "XMLHttpRequest",
                                    "x-xsrf-token": x_xsrf_token,
                                    // "cookie": "_cfuvid=imHu0tuQFA8FMZpNkgyZUVgB17kZatpw33dUodvIzAk-1702410993140-0-604800000; betToken=eyJpdiI6ImZOXC9tMGdhSElcL2pBMVVrdG5VeFwvY2c9PSIsInZhbHVlIjoiZnlhTVdIQTlWNE1sMkRFeG5VaEFuektzRkFSSG1jSHZTNlYyWFRlaVBQalwvdm1SeWVKRUcza0RsYUJ5XC85U2I0IiwibWFjIjoiNzQ0YzM0ZjAxZDcyMmFkZjhlYWY5N2FlZjEzODI3YWUwZGQzYzI5MjllN2NlOThjNTY4MTZjYTYyNDA5ODExNCJ9; rememberMe=true; cf_chl_2=39f65ad036e28dd; cf_clearance=4PtpJU6oR8_8.UwjtnK1lRRjf3dcEyBOEgLvuIaXN1s-1702413123-0-1-312ca73.3e9ef278.54139593-250.1.1702413123; XSRF-TOKEN=eyJpdiI6Ik9idUo1ZHp2ZE5xUmxTMzByV1RyNEE9PSIsInZhbHVlIjoiVFJSeml1eG9maTdcL2lTcDFZNXowWlhWdTdvWWhkcG9ZTnp1XC83RWhQcVh3TTlldlg4NXR5V2NjZTB4OTV5aFZqaVJqb0dDenFVQ1VlYjF4WUNGSkJVOW9DN2NiU01aOTg1VnVQSnkwUmxKUzJcLzFRTDlIa0JmRFVhdVVGS3pTdEEiLCJtYWMiOiI2MDA4ZDc4OGI0MTM5YzhiMDgwNzI0MmFiNmE1OTZjOTljNjM2ZTUyZDA4OWEzYzQ5YzQwZjk0MDRkOThkMzIwIn0%3D; laravel_session=eyJpdiI6ImxrYlNHaTlNUytFQVNJdWtXQU9LcUE9PSIsInZhbHVlIjoid1wvSWdYZ0t1SlpIWkFLM0NVbUs1U3RrXC9jYXI1a0hEcGoxekI3eEhVN1J0ak5QT3lrUGxZR2M3S2ZUdHJUSG5DRXdCVklxM2xTWkZMdGV0WGo4dnRpb2tTMDdRb215MXUzNHppdzVHTFhxY21TczlhamdKN0dlTFVPVXhpQ2JBcCIsIm1hYyI6ImI2ZmRhMWZmZWQ5NDJjN2YxNWM0ODkyMTY3ZGM1YjVjOWY3NTYyYTdhYzc4Yjc0NTU0YjlkYjA4OTYxZGIxM2UifQ%3D%3D",
                                    "Referer": matchURL,
                                    "Referrer-Policy": "strict-origin-when-cross-origin"
                                },
                                "body": `{"data": "${encryptedresult.data}"}`,
                                "method": "POST"
                            })
                                .then(response => response.text())
                                .then(data => {
                                    console.log("response data ---->>>>> ", data);
                                    const resultDecryptedData = CryptojsDecrypt(data);
                                    console.log("success! ----->>>>> ", resultDecryptedData);
                                    return resultDecryptedData;
                                })
                                .catch(error => {
                                    console.log("My Error : ", error);
                                });
                                
                            return result;
                        }, matchID, m, etid, apiTag, matchURL, x_csrf_token, x_xsrf_token);
                      Object.assign(data, dataToServer)
                      fullMatch.push(data)

                    }

                 
              }
              console.log("data to server >>> ", fullMatch);
              const tennisServerURL = `https://scraper-backend-yg6r.onrender.com/tennisdata`;
              await sendToDBServer(tennisServerURL, fullMatch);
            } catch (error) {
                console.log("JSON input error!", error);
            }
        }
    });

    // Disable request interception
    await page.setRequestInterception(false);

    /////////////////////////////// end hook response ////////////////////////////////////

    await page.goto('https://www.allpaanel.com/', { waitUntil: 'networkidle2', timeout: 0 });
    await page.reload();

    if (page.url().includes("login")) {
      const userIdPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[1]/input';
      const userIdField = await page.$x(userIdPath);
      await userIdField[0].type('jcpbook');
    
      const userPassPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[2]/input';
      const userPassField = await page.$x(userPassPath);
      await userPassField[0].type('Abcd2233');
    
      await delay(2000);
      // click login button
      const loginButtonPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[3]/button';
      const [loginButton] = await page.$x(loginButtonPath);
      await loginButton.click({timeout:300000});
}
 
    // close modal
    await delay(10000);
    try {
        const modalCloseButtPath = '/html/body/div[3]/div[1]/div/div/header/button';
        const [modalCloseButton] = await page.$x(modalCloseButtPath);
        await modalCloseButton.click({timeout:300000});
    } catch (error) {
        console.log("No modal!")
    }

    await page.goto('https://www.allpaanel.com/game-list/tennis');
  // await browser.close();


};

launchTennis();
