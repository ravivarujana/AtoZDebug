import puppeteer from "puppeteer";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import slugify from "slugify";
import { URL } from "url";

const scapeURLInformation = async (url) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

  // Extract title and meta description
  const metadata = await page.evaluate(() => {
    return {
      title: document.title || "",
      metaDescription:
        document.querySelector("meta[name='description']")?.content || "",
    };
  });

  const safeSlug = slugify(metadata.title || new URL(url).hostname, {
    lower: true,
    strict: true,
  });

  // 🖥 Desktop Screenshot
  const desktopBuffer = await page.screenshot({ fullPage: true });
  const desktopUrl = await uploadBufferToCloudinary(desktopBuffer, `${safeSlug}-desktop`);

  // 📱 Mobile Screenshot
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  const mobileBuffer = await page.screenshot({ fullPage: true });
  const mobileUrl = await uploadBufferToCloudinary(mobileBuffer, `${safeSlug}-mobile`);

  await browser.close();

  return {
    title: metadata.title,
    metaDescription: metadata.metaDescription,
    websiteLink: url,
    slug: safeSlug,
    desktopScreenshotUrl: desktopUrl,
    mobileScreenshotUrl: mobileUrl,
  };
};

export default scapeURLInformation