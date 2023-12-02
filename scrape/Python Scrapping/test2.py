import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests

def get_ajax_response(url, xpath_selector):
    # Create a WebDriver instance
    driver = webdriver.Chrome()

    # Open the URL
    driver.get(url)

    # Wait for the AJAX request to complete
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, xpath_selector))
        )
    except TimeoutException:
        print("AJAX request timed out")
        driver.quit()
        return

    # Get the AJAX response data
    ajax_response_element = driver.find_element_by_xpath(xpath_selector)
    ajax_response_data = ajax_response_element.text

    # Parse the JSON data
    try:
        ajax_response_json = json.loads(ajax_response_data)
    except json.decoder.JSONDecodeError:
        print("Invalid JSON data")
        driver.quit()
        return

    # Print the response data
    print(ajax_response_json)

    # Close the browser window
    driver.quit()

if __name__ == "__main__":
    # Replace with the URL you want to scrape
    url = "https://d247.com/"

    # Replace with the XPath selector for the AJAX response element
    xpath_selector = "//div[@class='ajax-response-data']"

    # Get the AJAX response data
    get_ajax_response(url, xpath_selector)
