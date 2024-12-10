//全局文件

import dotenv from "dotenv";

dotenv.config({ path: "./prisma/.env" });

const config = {
  jwtSecretKey: process.env.JWT_SECRET,
};

export { config };
