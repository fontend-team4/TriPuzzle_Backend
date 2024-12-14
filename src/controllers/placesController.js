import { textSearchPlaces, getPlacesInfo } from "../services/googleMaps.js";
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

export const keywordSearch = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ 錯誤: "請輸入關鍵字" });
  }

  try {
    const placesID = await textSearchPlaces(query);
    const placesInfo = await Promise.all(
      placesID.map(async (place) => await getPlacesInfo(place.place_id))
    );

    return res.json(placesInfo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "無法取得景點資料",
      details: error.response?.data || error.message,
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
    console.error(error);
    res.status(500).json({
      error: "無法取得景點資料",
      details: error.response?.data || error.message,
    });
  }
};
