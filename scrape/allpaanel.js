import { launch } from "puppeteer";
import { Solver } from "2captcha-ts";
import { readFileSync } from "fs";

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
        if (url === 'https://www.allpaanel.com/api/user/gamehighlight') {
            const responseBody = await response.text();

            console.log("response data >>> ", responseBody.length);

            const decryptedData = await page.evaluate((responseBody) => {
                // console.log("=========>>>>>>>>>>>>>>>>>>>>>>>> ", responseBody);
                const responseJSONData = CryptojsDecrypt(responseBody);
                return responseJSONData.data;
            }, responseBody);
            // console.log("response JSON >>> ", decryptedData);

            for (let i = 0; i < decryptedData.length; i++) {
                const match = decryptedData[i];
                const matchID = match.gameId;
                const matchType = match.eid;
                const matchURL = `https://www.allpaanel.com/game-detail/${matchID}`;

                async function launchMatch() {
                    const page = await browser.newPage();
    
                    // Navigate to a page that triggers AJAX requests
                    await page.goto(matchURL, {
                        timeout: 300000
                    });
                    console.log("match page loaded!");
                    await page.setRequestInterception(true);

                    // Listen for the 'response' event
                    page.on('response', async (response) => {
                        const responseURL = response.url();
                        let decryptedGetData = null;
                        let decryptedUserData = null;

                        if (response.url().includes('getdata')) {
                            try {
                                const responseText = await response.text();
                                decryptedGetData = await page.evaluate((responseText) => {
                                    // console.log("=========>>>>>>>>>>>>>>>>>>>>>>>> ", responseText);
                                    const matchJSONData = CryptojsDecrypt(responseText);
                                    return matchJSONData.data;
                                }, responseText);
                                console.log("decrypted get data --->>> ", decryptedGetData);
                            } catch (error) {
                                console.log(error);
                            }
                        }
                        // if (response.url().includes('userdata')) {
                        //     try {
                        //         const responseText = await response.text();
                        //         decryptedUserData = await page.evaluate((responseText) => {
                        //             // console.log("=========>>>>>>>>>>>>>>>>>>>>>>>> ", responseText);
                        //             const matchJSONData = CryptojsDecrypt(responseText);
                        //             return matchJSONData.data;
                        //         }, responseText);
                        //         console.log("decrypted user data --->>> ", decryptedUserData);
                                
                        //     } catch (error) {
                        //         console.log(error);
                        //     }
                        // }

                        const testCricketURL = `http://localhost:5000/cricketdata`;
                        // const resultData = {getdata: decryptedGetData, userdata: decryptedUserData}
                        const resultData = {getdata: decryptedGetData}
                        try {
                            fetch(testCricketURL, {
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(resultData),
                            })
                                .then((response) => {
                                    console.log("success");
                                    // Handle the response data
                                })
                                .catch((error) => {
                                    // console.log("send to server error!");
                                    console.error("error",error);
                                    // Handle any errors that occurred during the request
                                });
                        } catch (error) {
                            console.log("send to server error!")
                        }
                        console.log("-------------------------------------------------------------");
                        // const queryUrl = JSON.parse(responseText).url();
                    })
                    
                    // Disable request interception
                    await page.setRequestInterception(false);

                }

                await launchMatch();

            }

        }
    });
    
    // Disable request interception
    await page.setRequestInterception(false);

    /////////////////////////////// end hook response ////////////////////////////////////

    await page.goto('https://www.allpaanel.com/', { waitUntil: 'networkidle2', timeout: 0 });
    // await page.goto("https://emload.com/");
    await page.reload();

    await delay(25000);

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
    // close modal
    await delay(10000);
    try {
        const modalCloseButtPath = '/html/body/div[3]/div[1]/div/div/header/button';
        const [modalCloseButton] = await page.$x(modalCloseButtPath);
        await modalCloseButton.click({timeout:300000});
    } catch (error) {
        console.log("No modal!")
    }
        
};

launchCricket();
