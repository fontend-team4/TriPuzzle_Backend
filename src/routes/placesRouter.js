import express from "express";
import {
  searchAndStorePlaces,
  calculateRoute,
  getDistances,
} from "../controllers/mapController.js";

const router = express.Router();

router.post("/places", searchAndStorePlaces); // Search for places
router.post("/directions", calculateRoute); // Get directions
router.post("/distances", getDistances); // Calculate distances

export default router;
