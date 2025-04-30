import puppeteer, { Browser } from "puppeteer";

async function extractUrlLinks(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url);
    const data = await page.evaluate(() => {
      const anchorTags = document.querySelectorAll("a");
      const getMeta = (name, attr = "name") =>
        document.querySelector(`meta[${attr}="${name}"]`)?.content ||
        document.title;

      const fontFamilies = Array.from(document.fonts).map((f) => f.family);

      return {
        metaData: {
          title: document.title,
          metaTitle: getMeta("og:title", "property"),
          description: getMeta("description"),
          metaDescription: getMeta("og:description", "property"),
          themeColor: getMeta("theme-color"),
          fonts: fontFamilies,
        },
        links: Array.from(anchorTags).map((anchor) => anchor.href),
      };
    });

    console.log(data.metaData);

    const webSiteInfo = {
      uniqueLinks: new Set(data.links),
      metaData: data.metaData,
    };

    return webSiteInfo;
  } catch (err) {
    console.log(err);
  } finally {
    await browser.close();
  }
}

export { extractUrlLinks };
