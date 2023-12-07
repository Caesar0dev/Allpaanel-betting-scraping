
export const sendToDBServer = async (url, data) => {
  console.log("server data >>> ", data);
  const resultData = { data: data };
  try {
    fetch(url, {
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
        console.error("no backend response! >>> ", error);
        // Handle any errors that occurred during the request
      });
  } catch (error) {
    console.log("send to server error! >>> ", error);
  }
  console.log("-------------------------------------------------------------");
};
