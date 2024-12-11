import {
  getPlaces,
  getDirections,
  getDistanceMatrix,
} from "../services/googleMaps.js";
import { savePlaceToDB } from "../services/dataBase.js";

export const searchPlaces = async (req, res) => {
  try {
    const { query, location } = req.body;
    const places = await getPlaces(query, location);
    res.json(places);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

// *Search and store places
// export const searchAndStorePlaces = async (req, res) => {
//   try {
//     const { query, location } = req.body;

//     // Fetch places from Google Maps API
//     const places = await getPlaces(query, location);

//     // Save each place to the database
//     const savedPlaces = [];
//     for (const place of places) {
//       const mappedPlace = {
//         name: place.name,
//         name_en: place.name, // Assuming the same name for now
//         description: place.types?.join(", "), // Optional: join types for description
//         image_url:
//           `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos?.[0]?.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}` ||
//           "",
//         country:
//           place.address_components?.find((c) => c.types.includes("country"))
//             ?.long_name || "",
//         city:
//           place.address_components?.find((c) => c.types.includes("locality"))
//             ?.long_name || "",
//         address: place.formatted_address,
//         phone: place.international_phone_number || null,
//         website: place.website || null,
//         rating: place.rating || 0.0,
//         business_hours: place.opening_hours?.weekday_text?.join("; ") || null,
//         google_map_url: place.url || null,
//         web_map: `https://www.google.com/maps?q=${place.geometry.location.lat},${place.geometry.location.lng}`,
//         share_url: place.url || null, // Use the same Google Maps URL
//         share_code: null, // Placeholder for future logic
//         search_code: place.place_id || null, // Store place_id for uniqueness
//       };

//       const savedPlace = await savePlaceToDB(mappedPlace);
//       savedPlaces.push(savedPlace);
//     }

//     res.status(201).json({ message: "Places saved successfully", savedPlaces });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
