import { PrismaClient } from "../generated/prisma/index.js";
import { ApiError } from "../utils/ApiError.js";
import extractUrlLinks from "../utils/scrapeInternalLinks.js";
import scrapeAndUpload from "../utils/scrapeURLInformation.js";

const prisma = new PrismaClient();

const extractLinks = async (req, res) => {
  console.log("inside the easacacac");

  if (!req.body.url) {
    throw new ApiError("Url is required");
  }

  const links = await extractUrlLinks(req.body.url);
  res.status(200).json({
    links: [...links],
    message: "Links has been extracted successfully1",
  });
};

const extractLinksDetailsAndSave = async (req, res) => {
  const { urls } = req.body;

  console.log(urls);

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "URLs array is required" });
  }

  try {
    const results = [];

    for (const url of urls) {
      const isWebsiteLinkExist = await prisma.inspiration.findFirst({
        where: {
          websiteLink: url,
        },
      });

      if (isWebsiteLinkExist) {
        continue;
      }

      const data = await scrapeAndUpload(url);

      const isUrlDataExist = await prisma.inspiration.findUnique({
        where: {
          title_slug: {
            title: data.title,
            slug: data.slug,
          },
        },
      });

      if (isUrlDataExist) {
        throw new Error(`Data for ${isUrlDataExist.slug} already exist`);
      }

      const saveData = await prisma.inspiration.create({
        data: {
          ...data,
        },
      });

      results.push(saveData);
    }

    res.status(201).json({ inspirations: results });
  } catch (error) {
    console.error("Error adding inspirations:", error.message);
    res.status(500).json({ error: "Failed to add inspirations" });
  }
};

const getAllInspirations = async (req, res) => {
  try {
    
  } catch (err) {}
};

/**
 * Get a inspiration
 *
 * @param {string} slug - Unique slug for each inspiration.
 * @returns {Type} Returns details of a inspiration.
 */
const getInspiration = async (req, res) => {
  const { slug } = req.params;

  if (!slug.trim()) throw new Error("Enter a valid slug");

  try {
    const data = await prisma.inspiration.findUnique({
      where: {
        slug: slug.trim(),
      },
    });

    if (!data) {
      res.status(404).json({
        message: `Data not present for ${slug}`,
      });
    }

    res.status(200).json({
      data: data,
    });
  } catch (err) {
    console.log(`Error: ${err}`);
  }
};

export {
  extractLinks,
  extractLinksDetailsAndSave,
  getAllInspirations,
  getInspiration,
};
