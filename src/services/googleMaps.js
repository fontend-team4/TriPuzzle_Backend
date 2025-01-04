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
export const getDistanceMatrix = async (origins, destinations, mode) => {
  try {
    console.log("Distance Matrix 請求參數:", { origins, destinations, mode }); // 添加請求日誌
    const response = await client.distancematrix({
      params: {
        origins,
        destinations,
        mode,
        key: apiKey,
        language: "zh-TW",
      },
    });
    // 檢查 API 響應狀態
    if (response.data.status !== "OK") {
      throw new Error(`Google Maps API 返回狀態錯誤: ${response.data.status}`);
    }
    return response.data.rows;
  } catch (error) {
    // 更詳細的錯誤處理
    console.error("Distance Matrix API 錯誤:", error);

    if (error.response?.data?.error_message) {
      // API 返回的錯誤
      const errorMessage =
        error.response.data.error_message ||
        JSON.stringify(error.response.data);
      throw new Error(`Google Maps API 響應錯誤: ${errorMessage}`);
    } else if (error.request) {
      // 請求未收到響應
      throw new Error("無法連接到 Google Maps API");
    } else {
      // 其他錯誤
      throw new Error(`Distance Matrix API 錯誤: ${error.message}`);
    }
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
  if (!type) {
    throw new Error("地點類型 (type) 是必需的參數");
  }
  if (!location || !location.lat || !location.lng) {
    throw new Error("位置資訊 (location) 格式不正確，需要包含 lat 和 lng");
  }

  try {
    const response = await client.placesNearby({
      params: {
        type,
        location,
        radius: 5000,
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
    console.error("Nearby Search API 錯誤:", error);

    if (error.response?.data?.error_message) {
      const errorMessage =
        error.response.data.error_message ||
        JSON.stringify(error.response.data);
      throw new Error(`Google Maps API 響應錯誤: ${errorMessage}`);
    } else if (error.request) {
      throw new Error("無法連接到 Google Maps API");
    } else {
      throw new Error(`Nearby Search API 錯誤: ${error.message}`);
    }
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
      photos: details.photos[0].photo_reference || "N/A",
      placeUrl: details.url,
      summary: details.editorial_summary || "N/A",
    };
  } catch (error) {
    console.error("Place Details API 錯誤:", error);

    if (error.response?.data?.error_message) {
      const errorMessage =
        error.response.data.error_message ||
        JSON.stringify(error.response.data);
      throw new Error(`Google Maps API 響應錯誤: ${errorMessage}`);
    } else if (error.request) {
      throw new Error("無法連接到 Google Maps API");
    } else {
      throw new Error(`Place Details API 錯誤: ${error.message}`);
    }
  }
};
