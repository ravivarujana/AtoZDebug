import { Router } from "express";
import {
  extractLinks,
  extractLinksDetailsAndSave,
  getAllInspirations,
  getInspiration,
} from "../controllers/inspiration.controller.js";

const router = Router();

router.route("/extract-links").post(extractLinks);
router.route("/inspirations").post(extractLinksDetailsAndSave);
router.route("/inspirations").get(getAllInspirations);
router.route("/inspirations/:slug").get(getInspiration);

export default router;
