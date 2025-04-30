import puppeteer, { Browser } from "puppeteer";

async function extractUrlLinks(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url);
    const extractedLinks = await page.evaluate(() => {
      const anchorTags = document.querySelectorAll("a");
      return Array.from(anchorTags).map((anchor) => anchor.href);
    });

    const uniqueLinks = new Set(extractedLinks);

    // console.log(uniqueLinks);

    return uniqueLinks;
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
  }
}

export default extractUrlLinks;
