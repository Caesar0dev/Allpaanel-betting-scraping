// import fs from 'fs'
import { launch } from "puppeteer";
import { Solver } from "2captcha-ts";
import { readFileSync } from "fs";
import pkg from 'crypto-js';
const { CryptoJS } = pkg;

const APIKEY = "4679dfcd5b6712edad67469236c15362";
const solver = new Solver(APIKEY);
const targetScriptUrl = 'app.js';
const newScriptPath = './replace.js';

const launchCricket = async () => {
    const browser = await launch({
        headless: false,
        devtools: true,
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
                reject();
            }
        } else {
        }
    });

    /////////////////////////////// start hook response ////////////////////////////////////

    await page.setRequestInterception(true);


    page.on('request', (request) => {
        if (request.url().includes(targetScriptUrl)) {
            const newScriptContent = readFileSync(newScriptPath, 'utf8');
            console.log(newScriptContent);
            request.respond({
                status: 200,
                contentType: 'application/javascript; charset=utf-8',
                body: newScriptContent
            });
            // console.log("show data >>> ", showData);
            console.log('replaced source')
        } else {
            request.continue();
        }
    });

    page.on('response', async (response) => {

        let count = 0;
        
        const url = response.url();

        // Check if the response URL matches the desired URL
        if (url === 'https://www.allpaanel.com/api/user/gamehighlight') {
            const responseBody = await response.text();

            // console.log("response data >>> ", responseBody);
            // const encryptedBody = "xPjkbuyevfVwolWhLWhy7HFy7a46TSisqTcfxuZwLi2kitBf7o4SsssL54uzv7TzPrTt4FE9ZbNcLQdhC09903csa5TjnhR8iw514qn8sto=##@##989108fa038b945f2908b98636019154##@##f636113cec29885a";
            // console.log("encryptedBody >>> ", encryptedBody);
            

        }
    });
    
    // Disable request interception
    // await page.setRequestInterception(false);

    /////////////////////////////// end hook response ////////////////////////////////////

    await page.goto('https://www.allpaanel.com/', { waitUntil: 'networkidle2', timeout: 0 });
    // await page.goto("https://emload.com/");
    await page.reload();

    await delay(35000);

    // login
    // const userIdPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[1]/input';
    // const userIdField = await page.$x(userIdPath);
    // await userIdField[0].type('jcpbook1');

    // const userPassPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[2]/input';
    // const userPassField = await page.$x(userPassPath);
    // await userPassField[0].type('Abcd2233');

    // await delay(5000);
    // // click login button
    // const loginButtonPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[3]/button';
    // // console.log("loginButton >>> ", loginButtonPath);
    // const [loginButton] = await page.$x(loginButtonPath);
    // await loginButton.click({timeout:300000});
    // // close modal
    // await delay(10000);
    // try {
    //     const modalCloseButtPath = '/html/body/div[3]/div[1]/div/div/header/button';
    //     const [modalCloseButton] = await page.$x(modalCloseButtPath);
    //     await modalCloseButton.click({timeout:300000});
    // } catch (error) {
    //     console.log("No modal!")
    // }

    // await delay(3000);
    // const firstMatchPath = '/html/body/div[1]/div[2]/div/div/div/div[2]/div/div[1]/div/div/div/div/table/tbody/tr[2]/td[1]/div[1]/a';
    // const [firstMatch] = await page.$x(firstMatchPath);
    // await firstMatch.click({timeout:300000});

    // await browser.close();
        
};

launchCricket();
