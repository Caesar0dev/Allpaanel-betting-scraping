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