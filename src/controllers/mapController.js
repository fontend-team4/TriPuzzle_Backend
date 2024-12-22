import { getDirections, getDistanceMatrix } from "@/services/googleMaps";

export const getRoute = async (req, res) => {
  try {
    const { origin, destination } = req.body;
    const directions = await getDirections(origin, destination);
    res.json(directions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const calculateDistances = async (req, res) => {
  try {
    const { origins, destinations } = req.body;
    const distances = await getDistanceMatrix(origins, destinations);
    res.json(distances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
