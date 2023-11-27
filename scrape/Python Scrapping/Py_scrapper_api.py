import asyncio
from pyppeteer import launch
from Crypto.Cipher import PKCS1_OAEP
from Crypto.PublicKey import RSA
import base64
import json
from quart import Quart, jsonify

request_data_list = []
app = Quart(__name__)


async def intercept_request(request):
    request_data = {
        "url": request.url,
        "method": request.method,
        "headers": request.headers,
        "postData": request.postData,
    }
    request_data_list.append(request_data)

    # Continue with the request
    await request.continue_()


async def handle_scraping():
    browser = await launch(headless=True)
    page = await browser.newPage()

    try:
        await page.setRequestInterception(True)
        page.on('request', lambda request: asyncio.ensure_future(intercept_request(request)))

        # URL of the webpage to scrape
        target_url = "https://d247.com/casino/ballbyball"

        while True:
            await page.goto(target_url)
            await page.waitForSelector('body', timeout=10000)
            await page.keyboard.press('End')
            await asyncio.sleep(2)

            # Extract and decrypt payload data from the last intercepted request
            if request_data_list:
                last_request_data = request_data_list[-1]
                if 'postData' in last_request_data:
                    encoded_payload = last_request_data['postData']
                    print(f"Encoded_payload: {encoded_payload}")
                    decrypted_payload = await decrypt_payload(encoded_payload)
                    if decrypted_payload:
                        # Output the decrypted payload data as JSON
                        print(json.dumps(decrypted_payload, indent=4))

            # Clear the request_data_list for the next iteration
            request_data_list.clear()

            # Wait for some time before the next iteration
            await asyncio.sleep(4)

    except Exception as e:
        print("An error occurred:", e)

    finally:
        await page.setRequestInterception(False)
        await browser.close()


async def decrypt_payload(encoded_payload):
    # Replace this with your actual private key
    private_key_str = "[Your Private Key Here]"

    private_key = RSA.import_key(private_key_str)
    cipher = PKCS1_OAEP.new(private_key)
    decrypted_payload = cipher.decrypt(base64.b64decode(encoded_payload))
    return decrypted_payload.decode('utf-8')


@app.route('/get_response', methods=['GET'])
async def get_response():
    asyncio.create_task(run_scraping())
    return jsonify({"message": "Scraping task started successfully."}), 200


async def run_scraping():
    await handle_scraping()


if __name__ == '__main__':
    app.run(debug=True, port=5000)
