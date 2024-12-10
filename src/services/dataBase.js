import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const savePlaceToDB = async (place) => {
  try {
    const savedPlace = await prisma.places.create({
      data: {
        name: place.name,
        name_en: place.name_en || null,
        description: place.description || null,
        image_url: place.image_url || "",
        country: place.country || "",
        city: place.city || "",
        address: place.address || "",
        phone: place.phone || null,
        website: place.website || null,
        rating: place.rating || 0.0,
        business_hours: place.business_hours || null,
        google_map_url: place.google_map_url || null,
        web_map: place.web_map || null,
        share_url: place.share_url || null,
        share_code: place.share_code || null,
        search_code: place.search_code || null,
      },
    });
    return savedPlace;
  } catch (error) {
    throw new Error(`Failed to save place: ${error.message}`);
  }
};
