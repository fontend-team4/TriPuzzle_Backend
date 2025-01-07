import { getDirections, getDistanceMatrix } from "../services/googleMaps.js";

export const getRoute = async (req, res) => {
  const { origin, destination } = req.body;
  const directions = await getDirections(origin, destination);
  res.json(directions);
};

export const calculateDistances = async (req, res) => {
  try {
    const { origins, destinations, mode } = req.body;
    if (
      !origins ||
      !destinations ||
      !Array.isArray(origins) ||
      !Array.isArray(destinations)
    ) {
      return res.status(400).json({
        error: "無效的參數格式",
        details: "需要提供 origins 和 destinations陣列",
      });
    }
    // 檢查每個 place_id 的格式
    if (
      !origins.every((id) => id.startsWith("place_id:")) ||
      !destinations.every((id) => id.startsWith("place_id:"))
    ) {
      return res.status(400).json({
        error: "無效的 place_id 格式",
        details: '每個 place_id 必須以 "place_id:" 開頭',
      });
    }
    // console.log("處理距離計算請求:", { origins, destinations, mode });

    const results = await getDistanceMatrix(origins, destinations, mode);
    const distances = results.map((row, originIndex) => ({
      origin: origins[originIndex],
      elements: row.elements.map((element, destIndex) => ({
        destination: destinations[destIndex],
        distance: element.distance?.value || null,
        duration: element.duration?.text || null,
      })),
    }));
    // console.log("計算結果:", distances);
    res.json(distances);
  } catch (error) {
    console.error("距離計算錯誤:", error);

    // 發送格式化的錯誤響應
    res.status(500).json({
      error: "距離計算失敗",
      details: error.message,
    });
  }
};
