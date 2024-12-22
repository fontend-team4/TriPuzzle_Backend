import {
  getCoordinates,
  textSearchPlaces,
  nearbySearchPlaces,
  getPlacesInfo,
} from "../services/googleMaps.js";

export const searchPlaces = async (req, res) => {
  const { city, type, query, latitude, longitude } = req.query;

  try {
    let location;
    let placesID;

    if (city) {
      location = await getCoordinates(city);
    }
    if (latitude && longitude) {
      location = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
    }

    if (query) {
      placesID = await textSearchPlaces(query, location);
    }
    if (type) {
      placesID = await nearbySearchPlaces(type, location);
    }

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
