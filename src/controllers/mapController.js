import {
  getPlaces,
  getDirections,
  getDistanceMatrix,
} from "../services/googleMaps.js";

export const searchPlaces = async (req, res) => {
  try {
    const { query, location } = req.body;
    const places = await getPlaces(query, location);
    res.json(places);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const calculateRoute = async (req, res) => {
  try {
    const { origin, destination } = req.body;
    const directions = await getDirections(origin, destination);
    res.json(directions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDistances = async (req, res) => {
  try {
    const { origins, destinations } = req.body;
    const distances = await getDistanceMatrix(origins, destinations);
    res.json(distances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
