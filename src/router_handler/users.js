import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../configs/db.js";
import { config } from "../../config.js";

// 註冊
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // 檢查用戶是否已存在
  const existingUser = await prisma.users.findFirst({
    where: {
      OR: [{ email }, { name }],
    },
  });
  if (existingUser) {
    return res.status(409).json({
      status: 409,
      message: "Email or Username is already registered",
    });
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

  res.status(201).json({
    status: 201,
    message: "Registration successful",
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  });
};

// 登入
const login = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      status: 400,
      message: "Email、Username or Phonenumber and password are required",
    });
  }

  // 處理電話號碼格式
  const formattedIdentifier =
    identifier.startsWith("09") && identifier.length === 10
      ? `886${identifier.slice(1)}`
      : identifier;

  // 查找用戶
  const user = await prisma.users.findFirst({
    where: {
      OR: [
        { email: formattedIdentifier },
        { name: formattedIdentifier },
        { phone: formattedIdentifier },
      ],
    },
  });
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
  const tokenPayload = {
    id: user.id,
    email: user.email,
  };
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
