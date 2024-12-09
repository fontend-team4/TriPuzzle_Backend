import {
  // getPlaces,
  getDirections,
  getDistanceMatrix,
} from "../services/googleMaps.js";
// import { savePlaceToDB } from "../services/dataBase.js";

import { Client } from "@googlemaps/google-maps-services-js";
const client = new Client({});

export const searchPlaces = async ({
  keyword,
  center,
  radius,
  city,
  category,
}) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    // Step 1: 如果有城市名稱，使用 Geocoding API 取得城市座標
    let location = center;
    if (city) {
      const geocodeResponse = await client.geocode({
        params: {
          address: city,
          key: apiKey,
          language: "zh-TW", // 確保 Geocoding API 返回中文資料
        },
      });

      if (geocodeResponse.data.results.length === 0) {
        throw new Error("為搜尋到此地區");
      }
      location = geocodeResponse.data.results[0].geometry.location;
    }

    // Step 2: 根據需求選擇 textSearch 或 nearbySearch
    const params = {
      key: apiKey,
      location: location ? `${location.lat},${location.lng}` : undefined,
      radius: radius || 5000, // 預設半徑
      query: keyword || city, // 中文關鍵字或城市
      type: category || undefined, // 過濾類別
      language: "zh-TW", // 確保返回結果為中文
    };

    const response = keyword
      ? await client.textSearch({ params }) // 使用關鍵字搜尋
      : await client.nearbySearch({ params }); // 搜尋附近景點

    return response.data.results;
  } catch (error) {
    console.error("搜尋失敗:", error.message);
    return [];
  }
};

// // 範例使用
// (async () => {
//   const results = await searchPlaces({
//     keyword: "咖啡廳", // 中文輸入關鍵字
//     center: { lat: 25.033, lng: 121.565 }, // 台北 101 為中心
//     radius: 1000, // 搜尋半徑
//     city: "", // 可以傳空字串表示不用城市篩選
//     category: "cafe", // 景點類別
//   });

//   console.log(results);
// })();

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

// export const searchPlaces = async (req, res) => {
//   try {
//     const { query, location } = req.body;
//     const places = await getPlaces(query, location);
//     res.json(places);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
