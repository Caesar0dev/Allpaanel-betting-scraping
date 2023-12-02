console.clear = () => console.log('Console was cleared')
const i = setInterval(() => {
    console.log('there')
    if (window.turnstile) {
        clearInterval(i)
        window.turnstile.render = (a, b) => {
            let params = {
                sitekey: b.sitekey,
                pageurl: 'https://www.allpaanel.com/',
                data: b.cData,
                pagedata: b.chlPageData,
                action: b.action,
                userAgent: navigator.userAgent,
                json: 1
            }
            // we will intercept the message in puppeeter
            console.log('intercepted-params:' + JSON.stringify(params))
            let delay = 5000;  // 100 miliseconds

            setTimeout(() => {
                // Code to execute after the delay
                console.log("100 seconds have passed");
            }, delay);

            window.cfCallback = b.callback
            return
        }
    }
}, 50)