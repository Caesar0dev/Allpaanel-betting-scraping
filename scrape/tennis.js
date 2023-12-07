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

    page.on('response', async (response) => {

        const url = response.url();

        // Check if the response URL matches the desired URL
        if (url === 'https://www.allpaanel.com/api/user/gamehighlightall2') {

            const responseBody = await response.text()
            // console.log("response Body >>> ", responseBody);

            try {
                const decryptedData = await page.evaluate((responseBody) => {
                    const responseJSONData = CryptojsDecrypt(responseBody);
                    return responseJSONData.data.t1;
                }, responseBody);

                console.log("decrypted data >>> ", decryptedData);

                for (let i = 0; i < decryptedData.length; i++) {
                    const match = decryptedData[i];
                    const tennisServerURL = `http://localhost:5000/tennisdata`;
                    await sendToDBServer(tennisServerURL, match);
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
    await delay(3000);
    await page.goto('https://www.allpaanel.com/game-list/tennis');

    // await browser.close();

};

launchTennis();
