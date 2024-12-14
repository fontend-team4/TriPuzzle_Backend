import express from "express";
import { searchPlaces } from "../controllers/placesController.js";
import { getRoute, calculateDistances } from "../controllers/mapController.js";

const router = express.Router();

router.get("/search", searchPlaces);
router.post("/directions", getRoute);
router.post("/distances", calculateDistances);

export default router;
