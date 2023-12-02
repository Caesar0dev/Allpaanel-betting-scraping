from playwright.async_api import async_playwright
from parsel import Selector

playwright = await async_playwright().start()
browser = await playwright.chromium.launch(
    headless=False,
    channel="chrome",
    args=["--disable-blink-features", "--disable-blink-features=AutomationControlled"],
)

context = await browser.new_context(
    user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
)

page = await context.new_page()
page.set_default_timeout(0)

await page.goto("https://d247.com/home")
# await page.get_by_label('Login with demo ID').click()
await page.wait_for_timeout(8000)
await page.locator("//button[@class='btn btn-primary btn-block mt-2']").click()
await page.wait_for_timeout(1000)
await page.reload()