import { extractUrlLinks } from "../utils/puppeter.js";

const extractLinks = async (req, res) => {
  console.log("req ---- ", req.body.url);

  await extractUrlLinks(req.body.url);

  res.status(200).json({
    message: "Links has been extracted successfully1",
  });
};

const extractLinksDetails = (req, res) => {};
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
  extractLinksDetails,
  getAllInspirations,
  getInspiration,
};
