import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../configs/db.js";
import { config } from "../../config.js";

// 註冊
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // 檢查用戶是否已存在
  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) {
    return res
      .status(409)
      .json({ status: 409, message: "Email is already registered" });
  }

  // 加密密碼並創建用戶
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  res
    .status(201)
    .json({ status: 0, message: "Registration successful", user: newUser });
};

// 登入
const login = async (req, res) => {
  const { email, password } = req.body;

  // 查找用戶
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ status: 404, message: "User not found" });
  }

  // 驗證密碼
  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) {
    return res
      .status(401)
      .json({ status: 401, message: "Invalid credentials" });
  }

  // 生成 JWT
  const tokenPayload = { id: user.id, email: user.email };
  const token = jwt.sign(tokenPayload, config.jwtSecretKey, {
    expiresIn: "10h",
  });

  res.status(200).json({
    status: 200,
    message: "Login successful",
    token: `Bearer ${token}`,
  });
};

export { register, login };
