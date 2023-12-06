import { launch } from "puppeteer";
import { Solver } from "2captcha-ts";
import { readFileSync } from "fs";
import pkg from 'crypto-js';
const { CryptoJS } = pkg;
import {sendToDBServer} from "./utils.js";

const APIKEY = "4679dfcd5b6712edad67469236c15362";
const solver = new Solver(APIKEY);

const launchCricket = async () => {
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
                // reject();
            }
        } else {
        }
    });

    /////////////////////////////// start hook response ////////////////////////////////////

    await page.setRequestInterception(true);

    page.on('response', async (response) => {

        let count = 0;
        
        const url = response.url();

        // Check if the response URL matches the desired URL
        if (url === 'https://www.allpaanel.com/api/user/gamehighlight') {
            const responseBody = await response.text();

            console.log("response data >>> ", responseBody);
            // const encryptedBody = "xPjkbuyevfVwolWhLWhy7HFy7a46TSisqTcfxuZwLi2kitBf7o4SsssL54uzv7TzPrTt4FE9ZbNcLQdhC09903csa5TjnhR8iw514qn8sto=##@##989108fa038b945f2908b98636019154##@##f636113cec29885a";
            // console.log("encryptedBody >>> ", encryptedBody);
            try {
                const decryptedData = await page.evaluate((responseBody) => {
                    // console.log("=========>>>>>>>>>>>>>>>>>>>>>>>> ", responseBody);
                    const responseJSONData = CryptojsDecrypt(responseBody);
                    // const decryptedBody = CryptojsDecrypt(encryptedBody);
                    return responseJSONData.data;
                }, responseBody);
                console.log("response JSON >>> ", decryptedData);
                let matchURLs = [];
                for (let i = 0; i < decryptedData.length; i++) {
                    const match = decryptedData[i];
                    const matchID = match.gameId;
                    const dataID = match.marketId;
                    const matchType = match.eid;
                    const vir = match.vir;
                    let matchURL = null;
                    let apiTag = null;
                    // let fetchBody = null;

                    if (vir == 0) {
                        matchURL = `https://www.allpaanel.com/casino/cricketv/${matchID}`;
                        apiTag = 'https://www.allpaanel.com/api/cricketv/data';
                        // newRequestBody = {gameId: matchID, fn: 0, ism: 0, dataid: '682406', mod: 101}
                        // fetchBody = "";
                    } else if (vir == 1) {
                        matchURL = `https://www.allpaanel.com/game-detail/${matchID}`;
                        apiTag = 'https://www.allpaanel.com/api/game/getdata';
                        // fetchBody = "{\"data\":\"5jkAo2gAyji39q9i8jMJM+/O0mT2g4dw6pr13W20uZ++hrbbz3QWQ478RAxLSjBbESHCIhAVLvLF9szS4yGFjEp7MLgWXXt3AST5GmQWXYo=##@##376392c8cb90ed01378fb86541009fc5##@##2423f71419682726\"}";
                    } else if (vir ==2) {
                        matchURL = `https://www.allpaanel.com/casino/cricketvirtual/${matchID}`;
                        apiTag = 'https://www.allpaanel.com/api/cricketv/data';
                        // fetchBody = "";
                    }

                    const encryptedBody = await page.evaluate((matchID, dataID, apiTag, matchURL) => {
                        const resultBody = {gameId: matchID, fn: 0, ism: 0, dataid: dataID, mod: 101};
                        let functionResult = "initial value";
                        const encryptedresult = CryptojsEncrypt(resultBody);
                        console.log("COOKIE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ");
                        fetch(apiTag, {
                            "headers": {
                                "accept": "application/json, text/plain, */*",
                                "accept-language": "en-US,en;q=0.9,ko;q=0.8",
                                "authorization": "Bearer e224786baa223506ecf3ae69a9b81013408353f1",
                                "content-type": "application/json;charset=UTF-8",
                                "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-platform": "\"Windows\"",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                // "x-csrf-token": "hrdkOjb7asgixLbVBO0XSc0xgjRPKAiIGbJnC6pg",
                                "x-requested-with": "XMLHttpRequest",
                                // "x-xsrf-token": "eyJpdiI6Imk5ZDM0TmIzbVRjVW5HOFVcLzZjY1ZBPT0iLCJ2YWx1ZSI6IkJjWDc2R2g5c0VqMk50SFkwXC9QQTU1eTFcL1lMd1Jia0ViT0RXaE9tcW90alppVFJHUFJVRUFPdkQrSHpEVFRydEVmR0JjZjZwOE0zMGo0dnc1RGVxd2JlYjF1cFwvOHlxUnJ5QVlDZks0K0RJRStrOXJpVGtTbjVzaVNPQkpNbWZ3IiwibWFjIjoiZjMzOWQ3ZDA3MGIwZDk1MTU3MWNlZWUwOTJhYmI4ZDhiOWVmOThlMDE4YzU4ZDM4Y2FhZjI2OTQzYjFiNTg2NSJ9",
                                // "cookie": "_cfuvid=zsACIycUMvP_pM8yTPrsKxsF8yrXO9LaqiLR1Xnw4KY-1701523582768-0-604800000; cf_clearance=IFMzrYMG9.XLCekqSl8Pv3BytSS_HhYtfdkOSo_UQrs-1701731921-0-1-312ca73.6ba6483.54139593-160.2.1701731921; betToken=eyJpdiI6Inh1VXk0M0RFXC9jSkUzQVJzOXlKUjJBPT0iLCJ2YWx1ZSI6IlJwNnF3Q2NYN0xGVkw2U3VFOXRtdUFNakwxVGw4akNjbG9idzQxdVkycW1HZ0l0SmJyZkxYOGx3M3VCdVBcL2djIiwibWFjIjoiMmVmNGFkMmVmNzdkZDQzMWU4NWZlMmZlNmFlZWJiZTc3M2ZmYmMwNDdiNWFlNTFkOWJjMDEwNzVmOWZjYmRiNiJ9; rememberMe=true; XSRF-TOKEN=eyJpdiI6Imk5ZDM0TmIzbVRjVW5HOFVcLzZjY1ZBPT0iLCJ2YWx1ZSI6IkJjWDc2R2g5c0VqMk50SFkwXC9QQTU1eTFcL1lMd1Jia0ViT0RXaE9tcW90alppVFJHUFJVRUFPdkQrSHpEVFRydEVmR0JjZjZwOE0zMGo0dnc1RGVxd2JlYjF1cFwvOHlxUnJ5QVlDZks0K0RJRStrOXJpVGtTbjVzaVNPQkpNbWZ3IiwibWFjIjoiZjMzOWQ3ZDA3MGIwZDk1MTU3MWNlZWUwOTJhYmI4ZDhiOWVmOThlMDE4YzU4ZDM4Y2FhZjI2OTQzYjFiNTg2NSJ9; laravel_session=eyJpdiI6Ik42MEVESnZQbzNXNXBxdExvODhZMHc9PSIsInZhbHVlIjoiaFNCZFwvSzZCMEt0RlpScHoxajUzVjI0amg4dVNITm83T3RDU0srYkVFOHc4dmtSZGVlMkhQazNBcXRTcFFUZDk0aHRLRTZLSGxwZjVDN0RcL2xDdlwvMmN5dmdYcTFYMFZab1d6TkhMTTRyRFwvc09ZVVZtb0krNUZ6MEhPbUxEclBpIiwibWFjIjoiZGIyNzk2YmVhM2MzMDIwZTE2N2I3MjM1OWJmZDY5ZDI4MDAxYzE2NTY3YThmZTNmYzAxYjI1ZDJhNjNmN2RlMCJ9",
                                "Referer": matchURL,
                                "Referrer-Policy": "strict-origin-when-cross-origin"
                            },
                            "body": encryptedresult.data,
                            "method": "POST"
                        })
                            .then(response => {
                                if (response.ok) {
                                    console.log("response okay >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                                    return response.json(); // assuming the response is in JSON format
                                } else {
                                    throw new Error("Request failed with status " + response.status);
                                }
                            })
                            .then(data => {
                                // handle the response data here
                                const resultDecryptedData = CryptojsDecrypt(data);
                                sendToDBServer(resultDecryptedData);
                                functionResult = "success!";
                            })
                            .catch(error => {
                                // handle any errors that occurred during the request
                                functionResult = error;
                            });

                        return functionResult;

                    }, matchID, dataID, apiTag, matchURL)

                    console.log("result >>> ", encryptedBody);
                    // const sendToServer = await page.evaluate((encryptedBody) => {
                    //     const resultDecryptedData = CryptojsDecrypt(encryptedBody);
                    //     return resultDecryptedData.data;
                    // }, encryptedBody);
                    // await sendToDBServer(sendToServer);
                    // const fetchBody = encryptedBody;
                    // console.log("fetch Body >>> ", fetchBody);
                }
            } catch (error) {
                console.log("JSON input error!", error);
            }
        }
    });

    // Disable request interception
    await page.setRequestInterception(false);

    /////////////////////////////// end hook response ////////////////////////////////////

    await page.goto('https://www.allpaanel.com/', { waitUntil: 'networkidle2', timeout: 0 });
    // await page.goto("https://emload.com/");
    await page.reload();

    await delay(35000);

    // login
    const userIdPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[1]/input';
    const userIdField = await page.$x(userIdPath);
    await userIdField[0].type('jcpbook1');

    const userPassPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[2]/input';
    const userPassField = await page.$x(userPassPath);
    await userPassField[0].type('Abcd2233');

    await delay(5000);
    // click login button
    const loginButtonPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[3]/button';
    // console.log("loginButton >>> ", loginButtonPath);
    const [loginButton] = await page.$x(loginButtonPath);
    await loginButton.click({timeout:300000});

    // get cookie
    const pageCookie = await page.cookies();
    console.log("Cookie >>> ", pageCookie);

    // close modal
    await delay(10000);
    try {
        const modalCloseButtPath = '/html/body/div[3]/div[1]/div/div/header/button';
        const [modalCloseButton] = await page.$x(modalCloseButtPath);
        await modalCloseButton.click({timeout:300000});
    } catch (error) {
        console.log("No modal!")
    }

    // await browser.close();

};

launchCricket();
