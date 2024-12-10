import { Client } from "@googlemaps/google-maps-services-js";
const client = new Client({});

export const searchPlaces = async (req, res) => {
  const { keyword, city, lat, lng, radius, category } = req.query;

  try {
    let location;

    // If city available Using Geocoding API
    if (city) {
      const geocodeResponse = await client.geocode({
        params: {
          address: city,
          key: process.env.GOOGLE_MAPS_API_KEY,
          language: "zh-TW",
        },
      });

      if (geocodeResponse.data.results.length === 0) {
        return res.status(404).json({ error: "為搜尋到此區域" });
      }

      location = geocodeResponse.data.results[0].geometry.location;
    } else if (lat && lng) {
      location = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    // Compose the params set from the input
    const params = {
      key: process.env.GOOGLE_MAPS_API_KEY,
      query: keyword || city || "", //Keyword or City
      location: location ? `${location.lat},${location.lng}` : undefined,
      radius: parseInt(radius, 10) || 5000,
      type: category || undefined,
      language: "zh-TW",
    };

    // textSearch or nearbySearch
    const response = keyword
      ? await client.textSearch({ params })
      : await client.nearbySearch({ params });

    res.json(response.data.results);
  } catch (error) {
    console.error("搜尋失敗:", error.message);
    res.status(500).json({ error: "搜尋失敗，請檢查輸入參數" });
  }
};
