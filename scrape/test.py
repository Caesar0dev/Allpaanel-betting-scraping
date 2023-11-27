# Import necessary libraries
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import requests
from seleniumbase import Driver



def capture_ajax_responses(driver, game_link):
    # Initialize empty response list
    responses = []

    # Navigate to the game URL
    driver.get(game_link)

    # Capture AJAX requests and responses
    for request in driver.requests:
        if request.response:
            # Extract response data
            url = request.url
            status_code = request.response.status_code
            headers = request.headers
            response_text = request.response.text

            # Store response data in a dictionary
            response_data = {
                "url": url,
                "status_code": status_code,
                "headers": headers,
                "response_text": response_text
            }

            # Append response data to the list
            responses.append(response_data)

    # Return the captured responses
    return responses


# Initialize Selenium WebDriver
driver = Driver(uc=True)

driver.maximize_window()
url = 'https://d247.com/'
driver.get(url)

url = 'https://d247.com/home'
apikey = '4679dfcd5b6712edad67469236c15362'
params = {
    'url': url,
    'apikey': apikey,
	'js_render': 'true',
}
response = requests.get('https://api.zenrows.com/v1/', params=params)
print(response.text)

# Wait for page to load
time.sleep(10)

# Click "Log In" button
login_button = driver.find_element(By.XPATH, '/html/body/div/div[2]/div/div/div[2]/form/div[3]/button[2]')
login_button.click()

# Wait for login to complete
time.sleep(15)

# Close modal if it appears
try:
    modal_button = driver.find_element(By.XPATH, '/html/body/div[3]/div/div/div[1]/button')
    modal_button.click()
except:
    print("No modal!")

# Extract cricket match URLs
cricket_list = driver.find_elements(By.CLASS_NAME, 'bet-nation-game-name')
game_urls = []

for i in range(1, len(cricket_list)):
    game_url = cricket_list[i].get_attribute("href")
    game_urls.append(game_url)

# Capture AJAX responses for each game
for game_link in game_urls:
    # Capture responses for the current game
    responses = capture_ajax_responses(driver, game_link)

    # Process and store the captured responses
    # ... (Implement response processing here)

# Close the browser
driver.quit()
