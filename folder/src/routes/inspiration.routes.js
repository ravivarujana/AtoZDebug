import { Router } from "express";
import {
  extractLinks,
  extractLinksDetails,
  getAllInspirations,
  getInspiration,
} from "../controllers/inspiration.controller.js";

const router = Router();

router.route("/extract-links").post(extractLinks);
router.route("/inspirations").post(extractLinksDetails);
router.route("/inspirations").get(extractLinksDetails);
router.route("/inspirations").get(getAllInspirations);
router.route("/inspirations/:slug").get(getInspiration);

export default router;
