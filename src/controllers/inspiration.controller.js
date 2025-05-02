import { PrismaClient } from "../generated/prisma/index.js";
import { ApiError } from "../utils/ApiError.js";
import extractUrlLinks from "../utils/scrapeInternalLinks.js";
import scrapeAndUpload from "../utils/scrapeURLInformation.js";
import asyncHandler from "../utils/asyncHandler.js";

const prisma = new PrismaClient();

const extractLinks = asyncHandler(async (req, res) => {
  if (!req.body.url) {
    throw new ApiError("Url is required");
  }

  const links = await extractUrlLinks(req.body.url);
  res.status(200).json({
    links: [...links],
    message: "Links has been extracted successfully1",
  });
});

const extractLinksDetailsAndSave = asyncHandler(async (req, res) => {
  const { urls } = req.body;
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new ApiError(400, "URLs array is required");
  }

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
      throw new ApiError(409, `Data for ${isUrlDataExist.slug} already exist`);
    }

    const saveData = await prisma.inspiration.create({
      data: {
        ...data,
      },
    });

    results.push(saveData);
  }

  res.status(201).json({ inspirations: results });
});

const getAllInspirations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [totalCount, inspirations] = await Promise.all([
    prisma.inspiration.count(),
    prisma.inspiration.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  res.status(200).json({
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    inspirations,
  });
});

/**
 * Get a inspiration
 *
 * @param {string} slug - Unique slug for each inspiration.
 * @returns {Type} Returns details of a inspiration.
 */
const getInspiration = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const data = await prisma.inspiration.findUnique({ where: { slug } });

  if (!data) {
    throw new ApiError(404, `Inspiration not found for slug: ${slug}`);
  }
  res.status(200).json({ data });
});

export {
  extractLinks,
  extractLinksDetailsAndSave,
  getAllInspirations,
  getInspiration,
};
