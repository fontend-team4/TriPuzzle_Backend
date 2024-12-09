import express from "express";
import {
  searchAndStorePlaces,
  getRoute,
  calculateDistances,
} from "../controllers/mapController.js";

const router = express.Router();

router.post("/places", searchAndStorePlaces); // Search for places
router.post("/directions", getRoute); // Get directions
router.post("/distances", calculateDistances); // Calculate distances

export default router;
