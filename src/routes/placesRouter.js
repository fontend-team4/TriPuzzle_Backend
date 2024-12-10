import express from "express";
import {
  searchAndStorePlaces,
  getRoute,
  calculateDistances,
} from "../controllers/mapController.js";
import { searchPlaces } from "../controllers/placesController.js";
import { test } from "../controllers/testController.js";

const router = express.Router();

router.post("/places", searchAndStorePlaces);
router.post("/directions", getRoute);
router.post("/distances", calculateDistances);

router.get("/search", searchPlaces); //Testing
router.get("/search2", test); //Testing

export default router;
