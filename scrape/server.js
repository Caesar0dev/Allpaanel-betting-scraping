import { launch } from "puppeteer";
import { Solver } from "2captcha-ts";
import { readFileSync } from "fs";

const APIKEY = "4679dfcd5b6712edad67469236c15362";
const solver = new Solver(APIKEY);

const example = async () => {
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
    await page.goto('https://d247.com/', { waitUntil: 'networkidle2', timeout: 0 });
    // await page.goto("https://emload.com/");
    await page.reload();

    await delay(25000);
    // click demo login
    const loginButtonPath = '//*[@id="root"]/div[2]/div/div/div[2]/form/div[3]/button[2]';
    console.log("loginButton >>> ", loginButtonPath);
    const [loginButton] = await page.$x(loginButtonPath);
    await loginButton.click({timeout:300000});
    // close modal
    await delay(10000);
    try {
        const modalCloseButtPath = '/html/body/div[3]/div/div/div[1]/button';
        const [modalCloseButton] = await page.$x(modalCloseButtPath);
        await modalCloseButton.click({timeout:300000});
    } catch (error) {
        console.log("No modal!")
    }
        
};

example();
