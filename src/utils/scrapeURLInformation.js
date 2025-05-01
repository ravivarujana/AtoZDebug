import puppeteer from "puppeteer";
import { uploadBufferToCloudinary } from "../service/cloudinary.service.js";
import slugify from "slugify";
import { URL } from "url";

const scrapeAndUpload = async (url) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

  const metadata = await page.evaluate(() => {
    const getMetaData = (name, attr = "name") =>
      document.querySelector(`meta[${attr}="${name}"]`)?.content;

    return {
      title: document.title,
      description: getMetaData("description") || document.title,
      metaTitle: getMetaData("title"),
      metaDescription:
        document.querySelector("meta[name='description']")?.content || "",
      // fonts: window.getComputedStyle(document.querySelector("body")).fontFamily,
      fonts: [],
      colorScheme: [],
      technologyStack: [],
      categories: [],
      niche: "",
    };
  });

  const safeSlug = slugify(metadata.title || new URL(url).hostname, {
    lower: true,
    strict: true,
  });

  const desktopBuffer = await page.screenshot({ fullPage: true });
  const desktopUrl = await uploadBufferToCloudinary(
    desktopBuffer,
    `${safeSlug}-desktop`
  );

  await page.setViewport({ width: 375, height: 812, isMobile: true });
  const mobileBuffer = await page.screenshot({ fullPage: true });
  const mobileUrl = await uploadBufferToCloudinary(
    mobileBuffer,
    `${safeSlug}-mobile`
  );

  await browser.close();

  return {
    ...metadata,
    websiteLink: url,
    slug: safeSlug,
    desktopScreenshotUrl: desktopUrl,
    mobileScreenshotUrl: mobileUrl,
  };
};

export default scrapeAndUpload;
