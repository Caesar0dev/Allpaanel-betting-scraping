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

    page.on('response', async (response) => {

        const url = response.url();

        // Check if the response URL matches the desired URL
        if (url === 'https://www.allpaanel.com/api/user/gamehighlight') {

            const responseBody = await response.text()

            try {
                const decryptedData = await page.evaluate((responseBody) => {
                    const responseJSONData = CryptojsDecrypt(responseBody);
                    return responseJSONData.data;
                }, responseBody);

                for (let i = 0; i < decryptedData.length; i++) {
                    const match = decryptedData[i];
                    const matchID = match.gameId;
                    const dataID = match.marketId;
                    const matchType = match.eid;
                    const vir = match.vir;
                    let matchURL = null;
                    let apiTag = null;
                    let dataToServer = null;

                    if (vir == 1) {
                        matchURL = `https://www.allpaanel.com/game-detail/${matchID}`;
                        apiTag = '/api/game/getdata';
                        dataToServer = await page.evaluate(async (matchID, dataID, apiTag, matchURL, x_csrf_token, x_xsrf_token) => {
                            // defined body
                            const resultBody = {gameId: matchID, fn: 0, ism: 0, dataid: dataID, mod: 101};
                            const encryptedresult = CryptojsEncrypt(resultBody);
                            const result = await fetch(apiTag, {
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
                                    "x-csrf-token": x_csrf_token,
                                    "x-requested-with": "XMLHttpRequest",
                                    "x-xsrf-token": x_xsrf_token,
                                    // "cookie": "_cfuvid=zsACIycUMvP_pM8yTPrsKxsF8yrXO9LaqiLR1Xnw4KY-1701523582768-0-604800000; cf_clearance=IFMzrYMG9.XLCekqSl8Pv3BytSS_HhYtfdkOSo_UQrs-1701731921-0-1-312ca73.6ba6483.54139593-160.2.1701731921; betToken=eyJpdiI6Inh1VXk0M0RFXC9jSkUzQVJzOXlKUjJBPT0iLCJ2YWx1ZSI6IlJwNnF3Q2NYN0xGVkw2U3VFOXRtdUFNakwxVGw4akNjbG9idzQxdVkycW1HZ0l0SmJyZkxYOGx3M3VCdVBcL2djIiwibWFjIjoiMmVmNGFkMmVmNzdkZDQzMWU4NWZlMmZlNmFlZWJiZTc3M2ZmYmMwNDdiNWFlNTFkOWJjMDEwNzVmOWZjYmRiNiJ9; rememberMe=true; XSRF-TOKEN=eyJpdiI6Imk5ZDM0TmIzbVRjVW5HOFVcLzZjY1ZBPT0iLCJ2YWx1ZSI6IkJjWDc2R2g5c0VqMk50SFkwXC9QQTU1eTFcL1lMd1Jia0ViT0RXaE9tcW90alppVFJHUFJVRUFPdkQrSHpEVFRydEVmR0JjZjZwOE0zMGo0dnc1RGVxd2JlYjF1cFwvOHlxUnJ5QVlDZks0K0RJRStrOXJpVGtTbjVzaVNPQkpNbWZ3IiwibWFjIjoiZjMzOWQ3ZDA3MGIwZDk1MTU3MWNlZWUwOTJhYmI4ZDhiOWVmOThlMDE4YzU4ZDM4Y2FhZjI2OTQzYjFiNTg2NSJ9; laravel_session=eyJpdiI6Ik42MEVESnZQbzNXNXBxdExvODhZMHc9PSIsInZhbHVlIjoiaFNCZFwvSzZCMEt0RlpScHoxajUzVjI0amg4dVNITm83T3RDU0srYkVFOHc4dmtSZGVlMkhQazNBcXRTcFFUZDk0aHRLRTZLSGxwZjVDN0RcL2xDdlwvMmN5dmdYcTFYMFZab1d6TkhMTTRyRFwvc09ZVVZtb0krNUZ6MEhPbUxEclBpIiwibWFjIjoiZGIyNzk2YmVhM2MzMDIwZTE2N2I3MjM1OWJmZDY5ZDI4MDAxYzE2NTY3YThmZTNmYzAxYjI1ZDJhNjNmN2RlMCJ9",
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
                        }, matchID, dataID, apiTag, matchURL, x_csrf_token, x_xsrf_token);

                    } else {
                        matchURL = `https://www.allpaanel.com/casino/cricketvirtual/${matchID}`;
                        apiTag = '/api/cricketv/data';
                        dataToServer = await page.evaluate(async (matchID, dataID, apiTag, matchURL, x_csrf_token, x_xsrf_token, matchType) => {
                            // defined body
                            const resultBody = {gameId: matchID, fn: 0, ism: 0, gameType: matchType};
                            const encryptedresult = CryptojsEncrypt(resultBody);
                            const result = await fetch(apiTag, {
                                "headers": {
                                    "accept": "application/json, text/plain, */*",
                                    "accept-language": "en-US,en;q=0.9",
                                    "authorization": "Bearer 82745df2c92b8bd4e9b38bb06c8a955d0c3fc3c8",
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
                                    // "cookie": "_cfuvid=CvqNU4Wira6k2kMSEHAOvqwIfsKrU3afOI9T7sJ_lzI-1701975133090-0-604800000; cf_clearance=PIsCUjSbnaF2TbRX.jvCxBM4_.Ltdwp34Yk_LOayTrM-1701975141-0-1-312ca73.209218c8.54139593-250.1.1701975141; betToken=eyJpdiI6IkRmOERyUXZPWEdnUXgwZkozZ1dEWFE9PSIsInZhbHVlIjoiQldoQzdPSTNPWFdpcHVKMXl4aVduRlZvRUZWSndraER1bEx5bnN2UjJnRkRXRExremNNZTJLMXRIU3FTZFJqNSIsIm1hYyI6ImM4YmVhN2NhMTczOWY4ZDM0NmIyNWEwOGI4MjRmNGRjN2Y3ZDMwZGMxZDFhNTRjMGVlOTYwNWRjNTk3NWVlN2UifQ%3D%3D; rememberMe=true; XSRF-TOKEN=eyJpdiI6IkVON1VCNUZRSUtFSXp0YmxPM3BIemc9PSIsInZhbHVlIjoiemx0K1BTQ3JQcTJPd3JzblRNUWZweXE4cUYrc0N5QmlqR1dld3E5MGwyZzBndlwvK1hXcFFUdnNcL3dkTko5blRpTnRMME5xOG9EaGpaZ3QrcitGMkx0VWs2TG1XdW55MXNFVUM2dTZXVElZSVJpMTdtdE5aYzEyMmNtRUJDQk5YMSIsIm1hYyI6IjhjNTlmYjYwMTliYzNkNTFhNmIxNjYyN2FlNmQ1MjRkMDZmMTVmNjUwNzllNWQ1MTZjNjE4NWZlMGY2NTQ5ZWQifQ%3D%3D; laravel_session=eyJpdiI6IlBBd2Z1YzZHMTBVMTJcL1ZlVU94ZjJ3PT0iLCJ2YWx1ZSI6Ikt1Y2xJRUVvZGsrNWhsRTEycjArNUs1MUE1QTFYN3pzT1hLQ2ZtTXhPVmI2NDc5aHN6bVRwc2ZrSm5vamNRSXNoaEE2NUx0NHJBR0laMW5SRFdJbVUrVExIY3NCeldvWXpvTm5yWXdaTXBOS3lcL1NSWlYrSXBqWktKdm1xcUpNVyIsIm1hYyI6ImViYzJkOTQ4NTlmMTNhOWVlM2RmYTI0YTU2MWUwZjYyNzNlOTk0ZTZkMzZjM2VlZjViODdlOWZkZGM0NTk0NWEifQ%3D%3D",
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
                        }, matchID, dataID, apiTag, matchURL, x_csrf_token, x_xsrf_token, matchType);
                    }

                    console.log("data to server >>> ", dataToServer);
                    const cricketServerURL = `http://localhost:5000/cricketdata`;
                    await sendToDBServer(cricketServerURL, dataToServer);
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
    const [loginButton] = await page.$x(loginButtonPath);
    await loginButton.click({timeout:300000});

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
