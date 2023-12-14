
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

// Delay function
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// login

export async function login(page, username, password) {
  try {
    const userIdPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[1]/input';
    const userIdField = await page.$x(userIdPath);
    if (!userIdField) {
      throw new Error("Timeout")
    }
    await userIdField[0].type(username);

    const userPassPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[2]/input';
    const userPassField = await page.$x(userPassPath);
    if (!userPassField) {
      throw new Error("Timeout")
    }
    await userPassField[0].type(password);

    await delay(5000);
    // click login button
    const loginButtonPath = '//*[@id="app"]/div[2]/div/div/div/div/div/div[2]/form/div[3]/button';
    const [loginButton] = await page.$x(loginButtonPath);
    if (!loginButton) {
      throw new Error("Timeout")
    }
    await loginButton.click({timeout:300000});
  } catch (error) {
    throw error
  }
    
  
}


