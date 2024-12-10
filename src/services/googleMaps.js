import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

// Fetch places using Places API
export const getPlaces = async (query, location) => {
  try {
    const response = await client.textSearch({
      params: {
        query,
        location,
        radius: 1000,
        key: process.env.GOOGLE_MAPS_API_KEY,
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
        key: process.env.GOOGLE_MAPS_API_KEY,
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
        key: process.env.GOOGLE_MAPS_API_KEY,
        language: "zh-TW",
      },
    });
    return response.data.rows;
  } catch (error) {
    throw new Error(`Google Distance Matrix API error: ${error.message}`);
  }
};
