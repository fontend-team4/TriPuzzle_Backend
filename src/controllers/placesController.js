// import { Client } from "@googlemaps/google-maps-services-js";
// const client = new Client({});

// export const searchPlaces = async (req, res) => {
//   const { keyword, city, lat, lng, radius, category } = req.query;

//   try {
//     let location;

//     // If city available Using Geocoding API
//     if (city) {
//       const geocodeResponse = await client.geocode({
//         params: {
//           address: city,
//           key: process.env.GOOGLE_MAPS_API_KEY,
//           language: "zh-TW",
//         },
//       });

//       if (geocodeResponse.data.results.length === 0) {
//         return res.status(404).json({ error: "為搜尋到此區域" });
//       }

//       location = geocodeResponse.data.results[0].geometry.location;
//     } else if (lat && lng) {
//       location = { lat: parseFloat(lat), lng: parseFloat(lng) };
//     }

//     // Compose the params set from the input
//     const params = {
//       key: process.env.GOOGLE_MAPS_API_KEY,
//       query: keyword || city || "", //Keyword or City
//       location: location ? `${location.lat},${location.lng}` : undefined,
//       radius: parseInt(radius, 10) || 5000,
//       type: category || undefined,
//       language: "zh-TW",
//     };

//     // textSearch or nearbySearch
//     const response = keyword
//       ? await client.textSearch({ params })
//       : await client.nearbySearch({ params });

//     res.json(response.data.results);
//   } catch (error) {
//     console.error("搜尋失敗:", error.message);
//     res.status(500).json({ error: "搜尋失敗，請檢查輸入參數" });
//   }
// };
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});

export const searchPlacesB = async (req, res) => {
  const { keyword, category, region, lat, lng, radius = 1000 } = req.body;

  try {
    const params = {
      key: GOOGLE_MAPS_API_KEY,
      radius,
    };

    // Geocode the region if provided
    if (region) {
      const geocodeResponse = await client.geocode({
        params: { address: region, key: GOOGLE_MAPS_API_KEY },
      });

      const location = geocodeResponse.data.results[0]?.geometry.location;
      if (!location) {
        return res
          .status(400)
          .json({ error: `Could not find location for region: ${region}` });
      }

      params.location = `${location.lat},${location.lng}`;
    } else if (lat && lng) {
      params.location = `${lat},${lng}`;
    } else {
      return res
        .status(400)
        .json({ error: "Either lat/lng or region must be provided." });
    }

    // Add keyword or category
    if (keyword) {
      params.keyword = keyword;
    } else if (category) {
      params.keyword = category;
    }

    // Call the Google Places API
    const response = await client.placesNearby({ params });
    return res.json(response.data.results);
  } catch (error) {
    console.error(
      "Error fetching places:",
      error.response?.data || error.message
    );
    return res
      .status(500)
      .json({ error: "Failed to fetch places. Please try again later." });
  }
};

// (1) Search by keyword
// { keyword: "松山文創園區", lat: 25.033964, lng: 121.564468 }

// (2) Search by category and region (city name)
// {
//   category: "美食",
//   region: "台北市",
//   radius: 2000,
// }

// (3) Search by map center
// { lat: 24.990484, lng: 121.577667, radius: 1500 }
