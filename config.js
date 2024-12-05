//全局文件

import dotenv from "dotenv";

// 初始化 dotenv
dotenv.config();

const config = {
  jwtSecretKey: process.env.JWT_SECRET, // 從環境變數讀取 secretKey
};

export { config };
