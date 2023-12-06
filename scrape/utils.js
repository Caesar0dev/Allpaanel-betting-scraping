// const sendToServer = (baseUrl, data) => {
//   console.log(data);
//   fetch(baseUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   })
//     .then((response) => {
//       console.log("success");
//       // Handle the response data
//     })
//     .catch((error) => {
//       console.error("error", error);
//       // Handle any errors that occurred during the request
//     });
// };

// // module.exports = {
// //     sendToServer,
// // };

// export default sendToServer;

// body = {
//   gameId: this["gameId"],
//   fn: this["fancyNumber"],
//   ism: 0x0,
//   dataid: _0x49cea3,
//   mod: this["placebetPort"],
// };

export const sendToDBServer = async (data) => {
  const testCricketURL = `http://localhost:5000/cricketdata`;
  // const resultData = {getdata: decryptedGetData, userdata: decryptedUserData}
  const resultData = { data: data };
  try {
    fetch(testCricketURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resultData),
    })
      .then((response) => {
        console.log("success!!!");
        // Handle the response data
      })
      .catch((error) => {
        // console.log("send to server error!");
        console.error("data isn't sent! >>> ", error);
        // Handle any errors that occurred during the request
      });
  } catch (error) {
    console.log("send to server error! >>> ", error);
  }
  console.log("-------------------------------------------------------------");
};
