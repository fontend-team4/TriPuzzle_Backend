import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../configs/db.js";
import { config } from "../../config.js";

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await prisma.users.findFirst({
    where: {
      OR: [{ email }, { name }],
    },
  });
  if (existingUser) {
    return res.status(409).json({
      status: 409,
      message: "信箱或使用者暱稱已經被使用",
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
    message: "註冊成功",
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  });
};

const login = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      status: 400,
      message: "信箱、使用者暱稱或是電話為必填欄位",
    });
  }

  // 處理電話號碼格式
  const formattedIdentifier =
    identifier.startsWith("09") && identifier.length === 10
      ? `886${identifier.slice(1)}`
      : identifier;

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
    return res.status(404).json({ status: 404, message: "找不到使用者" });
  }

  // 驗證密碼
  const isValidPassword = bcrypt.compareSync(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ status: 401, message: "輸入密碼錯誤" });
  }
  // 生成 JWT
  const tokenPayload = {
    id: user.id,
    email: user.email,
  };
  const token = jwt.sign(tokenPayload, config.jwtSecretKey, {
    expiresIn: "24h",
  });

  // 存儲 token 到資料庫
  await prisma.users.update({
    where: { id: user.id },
    data: { token },
  });

  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_pic_url: user.profile_pic_url,
      phone: user.phone,
      gender: user.gender,
      birthday: user.birthday,
      description: user.description,
      login_way: user.login_way,
      create_at: user.create_at,
    },
    status: 200,
    message: "登入成功",
    token: `Bearer ${token}`,
  });
};

//登出
const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: 401, message: "無法讀取Token" });
  }

  const token = authHeader.split(" ")[1];

  // 先驗證 token 基本有效性
  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecretKey);
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ status: 401, message: "Token已過期，請重新登入" });
  }

  // 檢查 token 是否在黑名單
  const isBlacklisted = await prisma.tokenblacklist.findUnique({
    where: { token },
  });

  if (isBlacklisted) {
    return res.status(401).json({ message: "請重新登入" });
  }

  // 查詢使用者並檢查 token 一致性
  const user = await prisma.users.findUnique({
    where: { id: decoded.id },
  });

  if (!user || user.token !== token) {
    return res.status(401).json({ status: 401, message: "無效的Token" });
  }

  // 更新使用者資料庫紀錄，清除 token
  await prisma.users.update({
    where: { id: user.id },
    data: { token: null },
  });

  // 將 token 放入黑名單以防後續使用
  await prisma.tokenblacklist.create({
    data: { token },
  });

  res.status(200).json({ status: 200, message: "登入成功" });
};

//檢查登入狀態
const check = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "無效的Token或是未登入" });
    }

    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "找不到使用者" });
    }

    // 若使用者存在，則證明 token 有效，表示目前處於登入狀態
    res.status(200).json({
      message: "你已經登入",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        // 可視需要增加其他使用者資訊
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { register, login, logout, check };
