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

    const getColors = () => {
      const colors = new Set();
      const elements = document.querySelectorAll("*");
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        if (style.color) colors.add(style.color);
        if (style.backgroundColor) colors.add(style.backgroundColor);
      }
      return Array.from(colors).slice(0, 8); // limit to top 8
    };

    const getStackHints = () => {
      const libs = [];
      const scripts = Array.from(document.scripts).map((s) => s.src);
      if (scripts.some((s) => s.includes("react"))) libs.push("React");
      if (scripts.some((s) => s.includes("vue"))) libs.push("Vue");
      if (scripts.some((s) => s.includes("angular"))) libs.push("Angular");
      if (scripts.some((s) => s.includes("jquery"))) libs.push("jQuery");
      if (scripts.some((s) => s.includes("bootstrap"))) libs.push("Bootstrap");
      if (document.querySelector('link[href*="tailwind"]'))
        libs.push("Tailwind");
      return libs;
    };

    return {
      title: document.title,
      description: getMetaData("description") || document.title,
      metaTitle: getMetaData("title"),
      metaDescription:
        document.querySelector("meta[name='description']")?.content || "",
      // fonts: window.getComputedStyle(document.querySelector("body")).fontFamily,
      fonts: getFonts(),
      colorScheme: getColors(),
      technologyStack: getStackHints(),
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
