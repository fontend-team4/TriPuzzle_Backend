//全局文件

import dotenv from "dotenv";

dotenv.config();

const config = {
  jwtSecretKey: process.env.JWT_SECRET,
};

export { config };
