const { chromium } = require("playwright");
const fs = require("fs");

(async () => {

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // open login page
    await page.goto("https://eln-dev.digital-lab.ai/login");

    // wait for Keycloak login form
    await page.waitForSelector('#username');

    // fill login form
    await page.fill('#username', 'pinkan');
    await page.fill('#password', 'pinkan');

    // click login
    await page.click('#kc-login');

    // wait until navigation finishes
    await page.waitForLoadState('networkidle');

    // go to recipe protocol page
    await page.goto("https://eln-dev.digital-lab.ai/project/35ab22e5-0b67-497a-939b-25e313853972/experiment/ece924a0-1eba-4744-a8a1-a095412c1dcf/recipe-protocol");

    await page.waitForTimeout(5000);

    // screenshot
    await page.screenshot({
        path: "web-capture/recipe-protocol.png",
        fullPage: true
    });

    // save HTML
    const html = await page.content();
    fs.writeFileSync("web-capture/recipe-protocol.html", html);

    console.log("Capture complete");

})();