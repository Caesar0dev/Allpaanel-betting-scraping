# from selenium import webdriver
# from selenium.webdriver.common.keys import Keys
# from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import Select
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver import ActionChains
# from selenium.webdriver.support import expected_conditions as EC
# from webdriver_manager.chrome import ChromeDriverManager
# from selenium.webdriver.chrome.service import Service
# import undetected_chromedriver as uc
# import pandas as pd
import time
# import re
# import csv
# from datetime import datetime
# from datetime import date
from seleniumbase import Driver
# pip install requests
import requests

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

# Click the "Log In" button
time.sleep(5)
login_button = driver.find_element(By.XPATH, '/html/body/div/div[2]/div/div/div[2]/form/div[3]/button[2]')
login_button.click()

# Close modal
time.sleep(15)
try:
    modal_button = driver.find_element(By.XPATH, '/html/body/div[3]/div/div/div[1]/button')
    modal_button.click()
except:
    print("No modal!")

# get Cricket list
cricket_list = driver.find_elements(By.CLASS_NAME, 'bet-nation-game-name')
print(len(cricket_list))
game_urls = []
# get game URLs
for i in range(1, len(cricket_list)):
    game_url = cricket_list[i].get_attribute("href")
    # game_url = "https://d247.com/all-sports/4" + game_uri
    game_urls.append(game_url)
# hook response from every game
for game_link in game_urls:
    driver.get(game_link)

    try:
        # get response data
        print("get response data ->")
        # for request in driver.requests:
        #     if request.response:
        #         print(
        #             request.url,
        #             request.response.status_code,
        #             request.headers,
        #             request.response.headers
        #         )
    except:
        print("No request!")

while True:
    pass
# # driver.close()
