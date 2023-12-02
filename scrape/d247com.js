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

    /////////////////////////////// start hook response ////////////////////////////////////

    await page.setRequestInterception(true);

    page.on('response', async (response) => {

        let count = 0;
        
        const url = response.url();

        // Check if the response URL matches the desired URL
        if (url === 'https://d247.com/api/front/userdata') {
            const responseBody = await response.text();

            console.log("response data >>> ", responseBody);

            await page.evaluate((responseBody) => {
                const responseJSONData = CryptojsDecrypt(responseBody);
                console.log("response JSON >>> ", responseJSONData);
            }, responseBody);

            
            // const events = JSON.parse(responseBody).events;
            
            // for (let i = 0; i < events.length; i++) {
            //     const event = events[i];
            //     try {
            //         const market = event.markets[0];
            //         const eventId = market.eventId;
            //         // console.log("eventID >>> ", eventId);
            //         const marketId = market.marketId;
            //         // console.log("marketId >>> ", marketId);
            //         count = count + 1;
            //         const resultURL = `https://www.skyexch.art/exchange/member/fullMarket?eventType=4&eventId=${eventId}&marketId=${marketId}`;
            //         // console.log("requestURL >>> ", resultURL);
            //         const targetURL = `https://54.158.38.118/exchange/member/fullMarket?eventType=4&eventId=${eventId}&marketId=${marketId}`;
            //         const testCricketURL = `http://localhost:5000/cricketdata`;
            //         console.log("------------------------Cricket-"+count+"-----------------------");
            //         // console.log("Cricket URL: ", targetURL);

            //         const eventType = "4";
            //         const FETCH_FullMarket = `https://www.skyexch.art/exchange/member/playerService/queryFullMarkets`
            //         const FETCH_FancyMarket = `https://www.skyexch.art/exchange/member/playerService/queryFancyBetMarkets`
            //         const FETCH_BookMarket = `https://www.skyexch.art/exchange/member/playerService/queryBookMakerMarkets`
            //         const FETCH_WithoutSelection = `https://www.skyexch.art/exchange/member/playerService/queryMarketsWithoutSelection`
            //         let FullMarketResponse = await utils.fetchData(FETCH_FullMarket, resultURL, eventId, marketId, eventType)
            //         let FullMarketData = await FullMarketResponse.json();
            //         let FuncyMarketResponse = await utils.fetchData(FETCH_FancyMarket, resultURL, eventId, marketId, eventType)
            //         let FuncyMarketData = await FuncyMarketResponse.json();
            //         let BookMarketResponse = await utils.fetchData(FETCH_BookMarket, resultURL, eventId, marketId, eventType)
            //         let BookMarketData = await BookMarketResponse.json();
            //         let WithoutMarketResponse = await utils.fetchData(FETCH_WithoutSelection, resultURL, eventId, marketId, eventType)
            //         let WithoutMarketData = await WithoutMarketResponse.json();
                    
            //         /////////////////////////////////////////////////////////////////////
            //         //get url of number request
            //         async function launchMatch() {
            //             const page = await browser.newPage();
        
            //             // Navigate to a page that triggers AJAX requests
            //             await page.goto(resultURL, {
            //                 timeout: 300000
            //             });
            //             console.log("page loaded!");
            //             await page.setRequestInterception(true);

            //             // Listen for the 'response' event
            //             page.on('response', async (response) => {
            //                 const responseURL = response.url();

            //                 if (response.url().includes('get_scorecard')) {
            //                     try {
            //                         const responseText = await response.text();
            //                         const ScoreData = JSON.parse(responseText).doc[0].data.score;

            //                         var data1 = {FullMarketData, FuncyMarketData, BookMarketData, WithoutMarketData, ScoreData};
            //                         utils.sendToServer(testCricketURL, data1)
            //                         console.log("---------------------------------------------------");
                                    
            //                     } catch (error) {
            //                         console.log(error);
            //                     }
            //                 }
            //                 // const queryUrl = JSON.parse(responseText).url();
            //             })
                        
            //             // Disable request interception
            //             await page.setRequestInterception(false);

            //         }
            //         await launchMatch();

            //         /////////////////////////////////////////////////////////////////////

            //     } catch (error) {
            //         console.log("There isn't a market.");
            //     }
                
            // }
            
        }
    });
    
    // Disable request interception
    await page.setRequestInterception(false);

    /////////////////////////////// end hook response ////////////////////////////////////

    await page.goto('https://d247.com/', { waitUntil: 'networkidle2', timeout: 0 });
    // await page.goto("https://emload.com/");
    await page.reload();

    await delay(25000);
    // click demo login
    const loginButtonPath = '//*[@id="root"]/div[2]/div/div/div[2]/form/div[3]/button[2]';
    // console.log("loginButton >>> ", loginButtonPath);
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
