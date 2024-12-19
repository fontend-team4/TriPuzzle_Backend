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
    throw new Error(`錯誤: ${error.response?.data || error.message}`);
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
    throw new Error(`錯誤: ${error.response?.data || error.message}`);
  }
};

// GeoCoding API
export const getCoordinates = async (city) => {
  try {
    const response = await client.geocode({
      params: {
        address: city,
        key: apiKey,
        language: "zh-TW",
      },
    });
    return response.data.results[0].geometry.location;
  } catch (error) {
    throw new Error(`錯誤: ${error.response?.data || error.message}`);
  }
};

// Places API (Text Search)
export const textSearchPlaces = async (query, location) => {
  try {
    const response = await client.textSearch({
      params: {
        query,
        location,
        radius: 45000,
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
export const nearbySearchPlaces = async (type, location) => {
  try {
    const response = await client.placesNearby({
      params: {
        type,
        location,
        radius: 20000,
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
      place_id: details.place_id,
      name: details.name,
      geometry: details.geometry.location,
      types: details.types,
      address: details.formatted_address,
      phone: details.formatted_phone_number || "N/A",
      rating: details.rating,
      website: details.website || "N/A",
      opening_hours: details.opening_hours?.weekday_text || [],
      photos:
        details.photos.map((photo) => ({
          photo_reference: photo.photo_reference,
        })) || [],
      placeUrl: details.url,
      summary: details.editorial_summary || "N/A",
    };
  } catch (error) {
    throw new Error(`錯誤: ${error.response?.data || error.message}`);
  }
};
