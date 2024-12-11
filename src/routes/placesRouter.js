import express from "express";
import {
  searchPlaces,
  getRoute,
  calculateDistances,
} from "../controllers/mapController.js";
import { searchPlacesB } from "../controllers/placesController.js";
import { test } from "../controllers/testController.js";

const router = express.Router();

router.post("/places", searchPlaces);
router.post("/directions", getRoute);
router.post("/distances", calculateDistances);

router.post("/search", searchPlacesB); //Testing
router.get("/search2", test); //Testing

export default router;
