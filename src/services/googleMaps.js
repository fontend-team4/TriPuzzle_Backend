import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

// Directions API
export const getDirections = async (origin, destination) => {
  try {
    const response = await client.directions({
      params: {
        origin,
        destination,
        key: apiKey,
        language: "zh-TW",
      },
    });
    return response.data.routes;
  } catch (error) {
    throw new Error(`Google Directions API error: ${error.message}`);
  }
};

// Distance Matrix API
export const getDistanceMatrix = async (origins, destinations) => {
  try {
    const response = await client.distancematrix({
      params: {
        origins,
        destinations,
        key: apiKey,
        language: "zh-TW",
      },
    });
    return response.data.rows;
  } catch (error) {
    throw new Error(`Google Distance Matrix API error: ${error.message}`);
  }
};

// Places API (Text Search)
export const textSearchPlaces = async (query) => {
  try {
    const response = await client.textSearch({
      params: {
        query,
        key: apiKey,
        language: "zh-TW",
      },
    });

    const placesID = response.data.results.map((place) => ({
      name: place.name,
      place_id: place.place_id,
    }));

    return placesID;
  } catch (error) {
    throw new Error(`錯誤: ${error.response?.data || error.message}`);
  }
};

// Places API (Nearby Search)
export const nearbySearchPlaces = async (lat, lng, category) => {
  try {
    const response = await client.placesNearby({
      params: {
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: 2000,
        type: category || "tourist_attraction",
        key: process.env.GOOGLE_MAPS_API_KEY,
        language: "zh-TW",
      },
    });

    const placesID = response.data.results.map((place) => ({
      name: place.name,
      place_id: place.place_id,
    }));

    return placesID;
  } catch (error) {
    throw new Error(`錯誤: ${error.response?.data || error.message}`);
  }
};

// Places API (Place Details)
export const getPlacesInfo = async (placeId) => {
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        key: apiKey,
        language: "zh-TW",
      },
    });

    const details = response.data.result;
    return {
      name: details.name,
      address: details.formatted_address,
      phone: details.formatted_phone_number || "N/A",
      rating: details.rating,
      opening_hours: details.opening_hours?.weekday_text || [],
    };
  } catch (error) {
    throw new Error(`錯誤: ${error.response?.data || error.message}`);
  }
};
