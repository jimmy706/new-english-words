const BASE_URL = 'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000';
const puppeteer = require('puppeteer');
const fs = require("fs");

async function fetchWords() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(BASE_URL);
    try {
        const hrefElements = await page.$$eval('.top-g a', languages => languages.map((lang, index) => {

            return {
                name: lang.textContent,
                url: lang.href
            }


        }));

        console.log('start write file...')
        const jsonStr = JSON.stringify(hrefElements)
        if (fs.existsSync(FILE_PATH)) {
            fs.writeFileSync(FILE_PATH, jsonStr);
        }
        console.log("Write complete!!")
        await page.close();
        await browser.close();
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = fetchWords;