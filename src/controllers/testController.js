import { Client } from "@googlemaps/google-maps-services-js";
const client = new Client({});

// Search API
export const test = async (req, res) => {
  const { keyword, city, lat, lng, radius, category } = req.query;

  try {
    let location;

    // Step 1: If city is provided, use Geocoding API to get coordinates
    if (city) {
      const geocodeResponse = await client.geocode({
        params: {
          address: city,
          key: process.env.GOOGLE_MAPS_API_KEY,
          language: "zh-TW",
        },
      });

      if (geocodeResponse.data.results.length === 0) {
        return res.status(404).json({ error: "City not found" });
      }

      location = geocodeResponse.data.results[0].geometry.location;
    } else if (lat && lng) {
      // Use provided latitude and longitude if available
      location = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    // Step 2: Build search parameters
    let response;
    if (keyword) {
      // Text-based search (findPlaceFromText)
      response = await client.findPlaceFromText({
        params: {
          input: keyword,
          inputtype: "textquery",
          key: process.env.GOOGLE_MAPS_API_KEY,
          fields: ["name", "geometry", "formatted_address", "rating"],
          language: "zh-TW",
        },
      });
    } else if (location) {
      // Nearby search (placesNearby)
      response = await client.placesNearby({
        params: {
          location: `${location.lat},${location.lng}`,
          radius: parseInt(radius, 10) || 5000,
          type: category || undefined,
          key: process.env.GOOGLE_MAPS_API_KEY,
          language: "zh-TW",
        },
      });
    } else {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    // Return results
    res.json(response.data.results);
  } catch (error) {
    console.error("Search failed:", error.message);
    res.status(500).json({ error: "Search failed" });
  }
};
