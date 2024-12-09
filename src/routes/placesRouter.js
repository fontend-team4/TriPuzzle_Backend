import express from "express";
import {
  // searchAndStorePlaces,
  getRoute,
  calculateDistances,
  searchPlaces,
} from "../controllers/mapController.js";

const router = express.Router();

router.post("/places", searchPlaces); // Search for places
router.post("/directions", getRoute); // Get directions
router.post("/distances", calculateDistances); // Calculate distances

export default router;
