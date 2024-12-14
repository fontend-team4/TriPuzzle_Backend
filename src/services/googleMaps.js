import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

// Fetch places using Places API
export const getPlaces = async (query, location) => {
  try {
    const response = await client.textSearch({
      params: {
        query,
        location,
        radius: 1000,
        key: apiKey,
        language: "zh-TW",
      },
    });
    return response.data.results;
  } catch (error) {
    throw new Error(`Google Places API error: ${error.message}`);
  }
};

// Get directions using Directions API
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

// Calculate distance matrix using Distance Matrix API
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
