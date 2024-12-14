import { textSearchPlaces, getPlacesInfo } from "../services/googleMaps.js";
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

export const keywordSearch = async (req, res) => {
  const { query } = req.query;

  try {
    const placesID = await textSearchPlaces(query);
    const placesInfo = await Promise.all(
      placesID.map(async (place) => await getPlacesInfo(place.place_id))
    );
    res.json(placesInfo);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};

export const mapSearch = async (req, res) => {
  const { lat, lng, category } = req.query;

  try {
    const nearbyResponse = await client.placesNearby({
      params: {
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: 2000,
        type: category || "tourist_attraction",
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    const places = nearbyResponse.data.results;

    // 呼叫 Place Details API 獲取詳細資料
    const placesInfo = await Promise.all(
      places.map(async (place) => {
        const details = await getPlacesInfo(place.place_id);
        return details;
      })
    );
    res.json(placesInfo);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};

export const filterSearch = async (req, res) => {
  const { city, type, latitude, longitude } = req.query;

  try {
    let location;

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
    } else if (latitude && longitude) {
      location = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
    }

    const nearbyResponse = await client.placesNearby({
      params: {
        location,
        radius: 5000,
        type,
        key: process.env.GOOGLE_MAPS_API_KEY,
        language: "zh-TW",
      },
    });

    const places = nearbyResponse.data.results;
    const placesInfo = await Promise.all(
      places.map(async (place) => {
        const details = await getPlacesInfo(place.place_id);
        return details;
      })
    );
    res.json(placesInfo);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};
