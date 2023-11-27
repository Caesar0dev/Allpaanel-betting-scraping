import express from "express";
import { launch } from "puppeteer";
import { Solver } from "2captcha-ts";
import { readFileSync } from "fs";

const app = express();
const port = 5000; // Choose a port number

const APIKEY = "4679dfcd5b6712edad67469236c15362";
const solver = new Solver(APIKEY);

const example = async () => {
    let data = {};
    const proxy = "https://oeasueae:3glasbcgbqak@45.158.184.126:9202";
    data = {
        ...data,
        proxy: proxy,
    };
    const browser = await launch({
        // args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: false,
        devtools: true,
        args: [
            `--proxy-server=${proxy.split("@")[1]}`, // Include only the proxy server address and port
        ],
    });
    const page = await browser.newPage();
    await page.authenticate({
        username: "oeasueae", // Proxy username
        password: "3glasbcgbqak", // Proxy password
    });
    const preloadFile = readFileSync("./inject.js", "utf8");
    await page.evaluateOnNewDocument(preloadFile);

    return await new Promise(async (resolve, reject) => {
        page.on("console", async (msg) => {
            const txt = msg.text();
            if (txt.includes("intercepted-params:")) {
                const params = JSON.parse(
                    txt.replace("intercepted-params:", "")
                );
                console.log(params);

                data = {
                    ...data,
                    userAgent: params.userAgent,
                };

                try {
                    console.log(`Solving the captcha...`);
                    const res = await solver.cloudflareTurnstile(params);
                    console.log(`Solved the captcha ${res.id}`);
                    console.log(res);
                    // data = {
                    //     ...data,
                    //     res: res,
                    // };

                    await page.evaluate((token) => {
                        cfCallback(token);
                    }, res.data);

                    console.log("loaded captacha");
                    let delay = 10000; // 100 miliseconds

                    setTimeout(async () => {
                        // Code to execute after the delay
                        console.log("100 seconds have passed");
                        const cookies = await page.cookies();
                        const cfClearanceCookie = await cookies.find(
                            (cookie) => cookie.name === "cf_clearance"
                        );
                        console.log("cookie:", cfClearanceCookie);
                        data = {
                            ...data,
                            cookie: cfClearanceCookie,
                        };

                        console.log("first", data);                        
                        resolve(data);
                        browser.close()
                    }, delay);
                } catch (e) {
                    console.log(e.err);
                    reject();
                }
            } else {
            }
        });
        await page.goto('https://emload.com/', { waitUntil: 'networkidle2', timeout: 0 });
        // await page.goto("https://emload.com/");
        await page.reload();
    });
};

app.get("/", async (req, res) => {
    console.log("request : Start");
    res.json(await example());
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
