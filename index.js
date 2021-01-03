const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render("./index");
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

const puppeteer = require('puppeteer');
const fs = require("fs");


class Word {
    constructor(name, define, spell, example = []) {
        this.name = name;
        this.define = define;
        this.spell = spell;
        this.example = example,
            this.createdDate = new Date()
    }
}
const MAX = 5000;
const FILE_PATH = "words.json";
const STORE_WORDS_PATH = "created-words.json";
let createdWords = [];

fs.readFile(STORE_WORDS_PATH, 'utf-8', (err, data) => {
    if (err) {
        console.log(err);
    }
    else {
        createdWords = JSON.parse(data);
    }
});

async function getWordInfo(word) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(word.url);

    try {
        const spellElement = await page.$eval(".phons_br span.phon", ele => ele.innerHTML);
        const defineElement = await page.$eval(".def", ele => ele.innerHTML);
        const exampleElements = await page.$$eval("ul.examples > li > .x", (elements) => elements.map(ele => ele.innerHTML));
        const newWorld = new Word(word.name, defineElement, spellElement, exampleElements);
        console.log("New Word: ");
        console.warn('Store new word...')

        createdWords.push(newWorld);
        fs.writeFileSync(STORE_WORDS_PATH, JSON.stringify(createdWords));
        console.log('Store complete!')
        return newWorld;
    }
    catch (err) {
        console.log(err);
    }

    await page.close();
    await browser.close();
}

app.get("/random", function (req, res) {
    const randNumber = Math.floor(Math.random(MAX) * MAX);

    fs.readFile(FILE_PATH, 'utf-8', async (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            const words = JSON.parse(data);
            const randomWord = words[randNumber];
            const word = await getWordInfo(randomWord);
            console.log(word);
            res.render("random", {
                name: word.name,
                spell: word.spell,
                define: word.define,
                example: word.example
            })
        }
    })
})