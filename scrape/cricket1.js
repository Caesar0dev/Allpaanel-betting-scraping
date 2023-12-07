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
    let x_csrf_token = null;
    let x_xsrf_token = null;
    await page.setRequestInterception(true);

    page.on('request', async (request) => {
        const requestHeaders = request.headers();
        // console.log('Request Headers:', requestHeaders);

        // You can also check for specific headers
        // For example, if you are looking for a custom header 'X-Custom-Header'
        if (requestHeaders['x-csrf-token']) {
            x_csrf_token = requestHeaders['x-csrf-token'];
            // console.log('x-csrf-token: ', requestHeaders['x-csrf-token']);
        }
        if (requestHeaders['x-xsrf-token']) {
            x_xsrf_token = requestHeaders['x-xsrf-token'];
            // console.log('x-xsrf-token: ', requestHeaders['x-xsrf-token']);
        }
    });

    page.on('response', async (response) => {

        let count = 0;
        
        const url = response.url();

        // Check if the response URL matches the desired URL
        if (url === 'https://www.allpaanel.com/api/user/gamehighlight') {
            // const responseBodyJson = await response.json();
            // const token = responseBodyJson.token;
            // console.log("token >>> ", token)

            const responseBody = await response.text()

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
                        apiTag = '/api/cricketv/data';
                        // newRequestBody = {gameId: matchID, fn: 0, ism: 0, dataid: '682406', mod: 101}
                        // fetchBody = "";
                    } else if (vir == 1) {
                        matchURL = `https://www.allpaanel.com/game-detail/${matchID}`;
                        apiTag = '/game/getdata';
                        // fetchBody = "{\"data\":\"5jkAo2gAyji39q9i8jMJM+/O0mT2g4dw6pr13W20uZ++hrbbz3QWQ478RAxLSjBbESHCIhAVLvLF9szS4yGFjEp7MLgWXXt3AST5GmQWXYo=##@##376392c8cb90ed01378fb86541009fc5##@##2423f71419682726\"}";
                    } else if (vir ==2) {
                        matchURL = `https://www.allpaanel.com/casino/cricketvirtual/${matchID}`;
                        apiTag = '/api/cricketv/data';
                        // fetchBody = "";
                    }

                    await page.evaluate(async (matchID, dataID, apiTag, matchURL, x_csrf_token, x_xsrf_token) => {
                        const resultBody = {gameId: matchID, fn: 0, ism: 0, dataid: dataID, mod: 101};
                        const axiosResult = await axios['post'](apiTag, CryptojsEncrypt({
                            'gameId': matchID,
                            'dataid': dataID,
                            'body': resultBody,
                            'Referer': matchURL
                        }))
                        return axiosResult
                            .then(response => {
                                if (response.ok) {
                                    console.log("response okay >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", response);
                                    return response.json(); // assuming the response is in JSON format
                                } else {
                                    console.log("Bodyyyyyyyyyyyyyyyy >>> ", encryptedResultBody)
                                    throw new Error("Request failed with status " + response.status);
                                }
                            })
                            .then(data => {
                                console.log("success! >>>>>>>>> ", data);
                                // handle the response data here
                                const resultDecryptedData = CryptojsDecrypt(data);
                                sendToDBServer(resultDecryptedData);
                            })
                            .catch(error => {
                                // handle any errors that occurred during the request
                                console.log("My Error : ", error);
                            });

                    }, matchID, dataID, apiTag, matchURL, x_csrf_token, x_xsrf_token)

                    // console.log("result >>> ", encryptedBody);
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

    // // get cookie
    // const pageCookie = await page.cookies();
    // console.log("Cookie >>> ", pageCookie);

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
