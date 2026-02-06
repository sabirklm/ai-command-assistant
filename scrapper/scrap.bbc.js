const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://www.bbc.com"

async function scrapeSite(url) {
    // 1️⃣ Fetch homepage
    let articlesRawData = [];
    const { data } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const links = new Set();

    $('a[href^="/news"]').each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.split("/").length > 2) {
            links.add(url + href);
        }
    });

    console.log(`Found ${links.size} articles`);

    // 2️⃣ Scrape first 3 articles only (important!)
    for (const articleUrl of [...links].slice(0, 7)) {
        console.log("\nScraping:", articleUrl);

        const articleHtml = await axios.get(articleUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const $$ = cheerio.load(articleHtml.data);
        const title = $$("h1").first().text().trim();

        const paragraphs = [];
        $$("article p").each((_, p) => {
            const text = $$(p).text().trim();
            if (text.length > 50) paragraphs.push(text);
        });

        const content = paragraphs.join("\n\n");

        // console.log("Title:", title);
        console.log("Content preview:", content.length);
        articlesRawData.push({
            title: title,
            content: content,
            sourceUrl: articleUrl,
            contentSize: content.length,
            source: url,
            language: "en"

        });
        // ⏱ rate limit
        await new Promise(r => setTimeout(r, 1500));
    }
    return articlesRawData;
}

// scrapeSite(url).catch(console.error);
module.exports = { scrapeSite }