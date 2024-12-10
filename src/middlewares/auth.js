import jwt from "jsonwebtoken";
import { config } from "../../config.js";

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: 1, message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1]; // 提取真正的 token

  try {
    const decoded = jwt.verify(token, config.jwtSecretKey); // 驗證 token 是否有效
    req.user = decoded; // 將解碼的使用者資訊附加到 req 上
    next(); // 繼續執行下一個 middleware 或路由邏輯
  } catch (err) {
    return res.status(401).json({ status: 1, message: "Invalid token" });
  }
};

export { authenticate };