import jwt, { decode } from "jsonwebtoken";
import { config } from "../../config.js";

//  JWT 認證中間件
const authenticator = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: 401, message: "未提供授權憑證" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecretKey);
    // 將解碼後的用戶信息附加到請求對象
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ status: 403, message: "無效的 Token" });
  }
};

export { authenticator };
