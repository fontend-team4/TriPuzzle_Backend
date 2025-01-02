import { getDirections, getDistanceMatrix } from "../services/googleMaps.js";

export const getRoute = async (req, res) => {
  const { origin, destination } = req.body;
  const directions = await getDirections(origin, destination);
  res.json(directions);
};

export const calculateDistances = async (req, res) => {
  const { origins, destinations, mode } = req.body;
  const results = await getDistanceMatrix(origins, destinations, mode);
  const distances = results.map((row, place) => ({
    origin: origins[place],
    elements: row.elements.map((element, place) => ({
      destination: destinations[place],
      distance: element.distance?.value || "None",
      duration: element.duration?.text || "None",
    })),
  }));

  res.json(distances);
};
