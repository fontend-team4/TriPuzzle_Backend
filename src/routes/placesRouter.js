import express from "express";
import {
  searchPlaces,
  getRoute,
  calculateDistances,
} from "../controllers/mapController.js";
import {
  keywordSearch,
  mapSearch,
  filterSearch,
} from "../controllers/placesController.js";

const router = express.Router();

router.post("/places", searchPlaces);
router.post("/directions", getRoute);
router.post("/distances", calculateDistances);

router.get("/search", filterSearch);
router.get("/search2", keywordSearch);
router.get("/search3", mapSearch);

export default router;
