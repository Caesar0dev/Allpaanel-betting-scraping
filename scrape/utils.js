const sendToServer = (baseUrl, data) => {
    console.log(data);
    fetch(baseUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then((response) => {
      console.log("success");
      // Handle the response data
    })
    .catch((error) => {
      console.error("error",error);
      // Handle any errors that occurred during the request
    });
}


// module.exports = {
//     sendToServer,
// };

export default sendToServer;



////////////////////////////////////////////////////////////
fetch("https://www.allpaanel.com/api/game/getdata", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,ko;q=0.8",
    "authorization": "Bearer 75bc90d3068ff81a7fe4a57c585bf9bc97d9950f",
    "content-type": "application/json;charset=UTF-8",
    "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-csrf-token": "5cMpW9sS7v493ls4ARl24Kzzaa1P2PeqjdRgMENT",
    "x-requested-with": "XMLHttpRequest",
    "x-xsrf-token": "eyJpdiI6Ik5USVhpSEN3SXpUbGNXbmd4czFacmc9PSIsInZhbHVlIjoidzIxVGs4U3Nvb2pNaTJmZnlPZTlCXC9jV2dvTkNLWmVWTEEybFZVWTFxQmFTeE13ZHZxSHZiclJYZlMrXC9sNXcxSXY5S1JUcnp2NDlLNjBHbGQzdk44M1locjdNY1MzZW1GMURpUnJJazhhdWlBSVRQRjgrQmpuTlNMRWlBK2pIQiIsIm1hYyI6ImNmMTc1ZGU0OGRmMjI5MTUwMzU4YTZiMjM3YzJiYmU1MjFjODdjMGQ5M2RkYjVjMzU2MDI2NGJiZDIxYWVlODAifQ==",
    "cookie": "_cfuvid=zsACIycUMvP_pM8yTPrsKxsF8yrXO9LaqiLR1Xnw4KY-1701523582768-0-604800000; cf_clearance=q7xVrxq1ykEEUaGYEr6nZt7o.v4BZ_y5GW4BT29nOqY-1701558517-0-1-312ca73.69a1e6cc.54139593-160.2.1701558517; betToken=eyJpdiI6IjRMempySE5GQVorOFhIMytoTEdreVE9PSIsInZhbHVlIjoiYmY0b2xBZmttWDl6YnE3TWNJU2xzMWpcL0VydHJTRVpTM1VMTkhpeWx4d0JHbzNpRWh1MFFvc1pVVzJPeFVvSVUiLCJtYWMiOiJhYjdkMDA4YzY2M2Y2NmI0YzFlOWE5ZmYxN2RjYTM3ZWFkOGM4MzE0OGQwN2JjM2IxYTc0YjlmYWIzNjY0Y2MyIn0%3D; rememberMe=true; XSRF-TOKEN=eyJpdiI6Ik5USVhpSEN3SXpUbGNXbmd4czFacmc9PSIsInZhbHVlIjoidzIxVGs4U3Nvb2pNaTJmZnlPZTlCXC9jV2dvTkNLWmVWTEEybFZVWTFxQmFTeE13ZHZxSHZiclJYZlMrXC9sNXcxSXY5S1JUcnp2NDlLNjBHbGQzdk44M1locjdNY1MzZW1GMURpUnJJazhhdWlBSVRQRjgrQmpuTlNMRWlBK2pIQiIsIm1hYyI6ImNmMTc1ZGU0OGRmMjI5MTUwMzU4YTZiMjM3YzJiYmU1MjFjODdjMGQ5M2RkYjVjMzU2MDI2NGJiZDIxYWVlODAifQ%3D%3D; laravel_session=eyJpdiI6IjhjWTBsbkdYM2c0UUx1K0ZpdUlCZHc9PSIsInZhbHVlIjoiZTdhd0pDenRNVlJSQ1ZaRTU3aFVGejVQQmxjUlM2QWFRbEZ1all6S3o2YUFIdHNTeDZhWWFUc041UzZwN2xVVFBtc2VQMXlIR2lERUJFWENUWU9YaFVEVGkrOVdIRVpWRFQ0eTNPM1VCXC92aU1VTzJiR25sR2RhdXRRRWtCTkpIIiwibWFjIjoiMzNjMDg5YWFkYzBkMjJjOWI3ZDgwY2YxNmU5ZWMxOGM3YWZlYTFlMzljZDkyN2YyN2YwNzU2NWYzZTllZGZlNSJ9",
    "Referer": "https://www.allpaanel.com/game-detail/1811292042",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": "{\"data\":\"zNIacnjbuPjryNOzbFYRqBnWmtlF565zgSo9sUNlQesi8h39wV05wwnhUZyDrQkSvY/lH2w/EOiWJvydOnAv3nvA5Qm1LLm79yFmMkikxAg=##@##4b099764e2bdb9cab2cab857f8f8e986##@##f620bca0db88d58c\"}",
  "method": "POST"
});

body = {
  'gameId': this['gameId'],
  'fn': this['fancyNumber'],
  'ism': 0x0,
  'dataid': _0x49cea3,
  'mod': this['placebetPort']
  }