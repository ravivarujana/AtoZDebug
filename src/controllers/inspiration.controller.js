import { ApiError } from "../utils/ApiError.js";
import extractUrlLinks from "../utils/scrapeInternalLinks.js";

const extractLinks = async (req, res) => {
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

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "URLs array is required" });
  }

  try {
    const results = [];

    for (const url of urls) {
      const data = await scrapeAndUpload(url);

      const inspiration = await Inspiration.create({
        ...data,
        description: "Placeholder description",
        fonts: [],
        technologyStack: [],
        categories: [],
        niche: "",
        metaTitle: data.title,
      });

      results.push({
        slug: inspiration.slug,
        websiteLink: inspiration.websiteLink,
      });
    }

    res.status(201).json({ inspirations: results });
  } catch (error) {
    console.error("Error adding inspirations:", error.message);
    res.status(500).json({ error: "Failed to add inspirations" });
  }
};

const getAllInspirations = (req, res) => {};

/**
 * Get a inspiration
 *
 * @param {string} slug - Unique slug for each inspiration.
 * @returns {Type} Returns details of a inspiration.
 */
const getInspiration = (req, res) => {};

export {
  extractLinks,
  extractLinksDetailsAndSave,
  getAllInspirations,
  getInspiration,
};
