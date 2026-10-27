const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

let browser;
before(async () => {
    browser = await chromium.launch({
        headless: true,
        ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
    });
});
after(async () => { await browser?.close(); });

async function openMenu(t, width = 390) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    page.setDefaultTimeout(2000);
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    t.after(() => page.close());
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    return page;
}

test('coca cola finds Coca-Cola and clearing search restores the menu', async t => {
    const page = await openMenu(t);
    await page.getByLabel('Search the menu', { exact: true }).fill('coca cola');
    assert.equal(await page.locator('#coldDrinks .menu-item:visible h3').allTextContents().then(names => names.includes('Coca-Cola · 600ml')), true);
    await page.getByRole('button', { name: 'Clear menu search' }).click();
    assert.equal(await page.locator('#burgers .menu-item:visible').count(), 16);
});

test('multiword search matches across a dish title and ingredients', async t => {
    const page = await openMenu(t);
    await page.getByLabel('Search the menu', { exact: true }).fill('bowral bacon');
    assert.deepEqual(await page.locator('.menu-item:visible h3').allTextContents(), ['Big Bowral Beef Burger']);
});

test('common drink and food aliases find their dishes', async t => {
    const page = await openMenu(t);
    for (const [query, title] of [
        ['coke', 'Coca-Cola · 600ml'],
        ['redbull', 'Red Bull'],
        ['barbecue chicken', 'Whole Roast BBQ Chicken'],
        ['milk shake', 'Classic Milkshake'],
        ["joes juice", "Joe's Fruit Juice"],
    ]) {
        await page.getByLabel('Search the menu', { exact: true }).fill(query);
        assert.ok((await page.locator('.menu-item:visible .item-header h3').allTextContents()).includes(title), query);
    }
});

test('switching category while scrolled lands below sticky navigation', async t => {
    const page = await openMenu(t);
    await page.locator('#coldDrinks').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Burgers and Rolls', exact: true }).click();
    const bounds = await page.evaluate(() => ({
        title: document.querySelector('#burgers .section-title').getBoundingClientRect().top,
        nav: document.querySelector('#categoryNav').getBoundingClientRect().bottom,
    }));
    assert.ok(bounds.title >= bounds.nav && bounds.title < bounds.nav + 80, JSON.stringify(bounds));
});

test('search hides empty drink groups and unrelated introduction panels', async t => {
    const page = await openMenu(t);
    await page.getByLabel('Search the menu', { exact: true }).fill('Monster');
    assert.equal(await page.locator('#coldDrinks .drink-group:visible').count(), 1);
    assert.equal(await page.locator('#milkshakes .milkshake-promo-banner:visible').count(), 0);
    assert.equal(await page.locator('#milkshakes .drinks-showcase:visible').count(), 0);
});

test('milkshake search retains its flavour choices but cold-drink search does not', async t => {
    const page = await openMenu(t);
    await page.getByLabel('Search the menu', { exact: true }).fill('milkshake');
    assert.equal(await page.locator('.flavor-chips-container:visible').count(), 1);
    assert.match(await page.locator('.flavor-chips-container').innerText(), /Chocolate/);
    await page.getByLabel('Search the menu', { exact: true }).fill('Monster');
    assert.equal(await page.locator('.flavor-chips-container:visible').count(), 0);
});

test('standalone kids burger offers the existing any-burger meal upgrade', async t => {
    const page = await openMenu(t);
    const card = page.locator('#burgers .menu-item').filter({ has: page.getByRole('heading', { name: "Kid's Burger", exact: true }) });
    assert.equal(await card.locator('.meal-upgrade-link').count(), 1);
});

test('meal hint takes customers to the existing upgrade prices', async t => {
    const page = await openMenu(t);
    await page.locator('#burgers .meal-upgrade-link').first().click();
    assert.equal(await page.locator('#deals:visible .deal-card').count(), 1);
    assert.match(await page.locator('#deals .deal-card').innerText(), /\+\$6/);
    assert.match(await page.locator('#deals .deal-card').innerText(), /\+\$8/);
});

test('existing categories, Chef filter and zero-result recovery still work', async t => {
    const page = await openMenu(t);
    await page.getByRole('button', { name: "Chef's Choice", exact: true }).click();
    assert.ok(await page.locator('.menu-item:visible').count() > 0);
    assert.equal(await page.locator('.menu-item:not(.chef-choice):visible').count(), 0);
    await page.getByLabel('Search the menu', { exact: true }).fill('zzzznotadish');
    assert.equal(await page.locator('#noResults:visible').count(), 1);
    await page.getByRole('button', { name: 'Clear menu search' }).click();
    assert.equal(await page.locator('#noResults:visible').count(), 0);
});

test('carousel controls are keyboard accessible', async t => {
    const page = await openMenu(t);
    const control = page.getByRole('button', { name: 'Battered', exact: true });
    await control.focus();
    await page.keyboard.press('Enter');
    assert.equal(await control.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.carousel-img.active').getAttribute('alt'), 'Battered Barramundi and chips');
});

test('third Grilled option shows its photo and preserves the meal price', async t => {
    const page = await openMenu(t);
    const control = page.getByRole('button', { name: 'Grilled', exact: true });
    assert.equal(await control.count(), 1, 'A third preparation choice is available');
    await control.click();
    await page.waitForFunction(() => {
        const img = document.querySelector('.carousel-img.active');
        return img?.complete && img.naturalWidth > 0;
    });
    assert.deepEqual(await page.locator('.item-img-carousel').evaluate(carousel => ({
        photo: carousel.querySelector('.carousel-img.active').getAttribute('src'),
        selected: carousel.querySelector('.carousel-label.active').textContent,
        price: carousel.closest('.menu-item').querySelector('.price').textContent,
        pressedCount: carousel.querySelectorAll('[aria-pressed="true"]').length,
    })), { photo: 'image/grilled-barramundi.jpg', selected: 'Grilled', price: '$20', pressedCount: 1 });
    if (process.env.SWEET_SALT_SCREENSHOT) {
        await page.locator('.menu-item').filter({ has: control }).screenshot({
            path: process.env.SWEET_SALT_SCREENSHOT,
            animations: 'disabled',
        });
    }
    await page.getByRole('button', { name: 'Crumbed', exact: true }).click();
    assert.equal(await page.locator('.carousel-img.active').getAttribute('alt'), 'Crumbed Barramundi and chips');
});

test('no cards or prices overflow at phone, tablet or desktop widths', async t => {
    for (const width of [320, 390, 480, 768, 1024, 1280]) {
        const page = await openMenu(t, width);
        assert.deepEqual(await page.evaluate(() => ({
            page: document.documentElement.scrollWidth > innerWidth,
            cards: [...document.querySelectorAll('.menu-item')].some(el => el.scrollWidth > el.clientWidth + 1),
            prices: [...document.querySelectorAll('.price-options')].some(el => el.scrollWidth > el.clientWidth + 1),
            carouselControls: [...document.querySelectorAll('.carousel-label')].some(el => {
                const box = el.getBoundingClientRect();
                const image = el.closest('.item-img-carousel').getBoundingClientRect();
                return box.left < image.left || box.right > image.right;
            }),
        })), { page: false, cards: false, prices: false, carouselControls: false }, `width ${width}`);
    }
});
