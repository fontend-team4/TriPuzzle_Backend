import express from "express";
import {
  searchPlaces,
  calculateRoute,
  getDistances,
} from "../controllers/mapController.js";

const router = express.Router();

router.post("/places", searchPlaces); // Search for places
router.post("/directions", calculateRoute); // Get directions
router.post("/distances", getDistances); // Calculate distances

export default router;
