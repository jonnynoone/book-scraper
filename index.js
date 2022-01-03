const request = require('request-promise');
const cheerio = require('cheerio');

const root = 'http://books.toscrape.com/';

(async () => {
    console.log('Processing...');

    const books = await getBooks();
    console.log(await getDetails(books));
    
    console.log('Finished.');
})();

async function getDetails(books) {
    return await Promise.all(books.map(async (book, index) => {
        console.log(`Scraping full data for book ${index + 1}...`);
        const $ = await loadHTML(book.url);

        book.price = $('.product_main > p.price_color').text().trim();
        book.description = $('#product_description + p').text().trim().replace(' ...more', '');
        $('.instock').children('.icon-ok').remove();
        book.stock = $('.product_main > .instock').text().trim();
        book.upc = $('.product_page table tr:first-child > td').text().trim();

        return book;
    }));
}

async function getBooks() {
    try {
        const books = [];
        const $ = await loadHTML(root);

        $('article.product_pod').each((index, elem) => {
            console.log(`Grabbing link for book ${index + 1}...`)
            const url = root + $(elem).find('a[title]').attr('href');
            const title = $(elem).find('a[title]').attr('title');

            const book = { url, title };
            books.push(book);
        });

        return books;
    } catch (err) {
        console.error(err);
    }
}

async function loadHTML(url) {
    try {
        const html = await request({
            uri: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
            }
        });

        const result = await cheerio.load(html);
        return result;
    } catch (err) {
        console.error(err);
    }
}