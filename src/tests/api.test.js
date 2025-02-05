import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.js";
import bcrypt from "bcryptjs";
import { config } from "../../config.js";
import { prisma } from "../../src/configs/db.js";

// 後續測試使用
let token;
let scheduleId;
let testUserId;
let billId;
let billData;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash("testpassword123", 10); // ✅ 正確加密密碼
  // 🔹 使用 transaction，一次性插入測試數據，提高效能
  const [testUser, testSchedule, testPlace] = await prisma.$transaction([
    prisma.users.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        email: "test@example.com",
        name: "Test User",
        password: hashedPassword,
        token: null,
      },
    }),
    prisma.schedules.create({
      data: {
        create_by: 1,
        title: "Test Schedule",
        total_users: 1,
        transportation_way: "CAR",
        start_date: new Date(),
        end_date: new Date(),
      },
    }),
    prisma.places.upsert({
      where: { place_id: "test-place-1" },
      update: {},
      create: {
        place_id: "test-place-1",
        name: "Test Place",
        location: "Test Location",
        photos: ["https://example.com/photo.jpg"],
        geometry: { lat: 25.033, lng: 121.5654 },
        opening_hours: { open_now: true, periods: [{ open: "09:00", close: "18:00" }] },
      },
    }),
  ]);

  testUserId = testUser.id;
  scheduleId = testSchedule.id;

  await prisma.schedules.update({
    where: { id: scheduleId },
    data: { create_by: testUserId },
  });

  token = jwt.sign({ id: testUserId, email: testUser.email }, config.jwtSecretKey, { expiresIn: "1h" });

  await prisma.users.update({
    where: { id: testUserId },
    data: { token: token },
  });

  billData = {
    title: "Dinner Bill",
    price: 100,
    category: "Food",
    date: new Date(),
    schedule_id: scheduleId,
    created_by: testUserId,
    split_among: [testUserId],
    is_personal: false,
    remarks: "Test",
  };

  console.log("✅ 測試用戶 testUserId:", testUserId);
  console.log("✅ 測試行程 scheduleId:", scheduleId);
});

describe("🔥 測試 `index.js` API", () => {
  describe("🏠 首頁 (Home)", () => {
    it("應該回傳 `Welcome to the API!` (GET /)", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.text).toBe("Welcome to the API!");
    });
  });

  describe("👤 用戶 API (Users)", () => {
    it("應該回傳 401 (沒有 Token) (GET /users)", async () => {
      const response = await request(app).get("/users/check");
      expect(response.status).toBe(401);
    });

    it("應該回傳 200 (使用 Token) (GET /users)", async () => {
      const response = await request(app)
        .get("/users/check")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
    });
  });

  describe("🗓️ 行程 API (Schedules)", () => {
    it("應該回傳 401 (沒有 Token) (GET /schedules)", async () => {
      const response = await request(app).get("/schedules");
      expect(response.status).toBe(401);
    });

    it("應該回傳所有行程 (GET /schedules)", async () => {
      const response = await request(app)
        .get("/schedules")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
    });
  });

  describe("🏞️ 景點 API (Places)", () => {
    it("應該回傳景點資料 (GET /places)", async () => {
      const response = await request(app).get("/places");
      expect(response.status).toBe(200);
    });
  });

  describe("👥 群組 API (Groups)", () => {
    it("應該新增帳目 (POST /groups/:scheduleId/bills)", async () => {
      const response = await request(app)
        .post(`/groups/${scheduleId}/bills`)
        .set("Authorization", `Bearer ${token}`)
        .send(billData);

      expect(response.status).toBe(201);
      billId = response.body.bill.id;
    });

    it("應該刪除帳目 (DELETE /groups/:scheduleId/bills/:billId)", async () => {
      expect(billId).toBeDefined();

      const response = await request(app)
        .delete(`/groups/${scheduleId}/bills/${billId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });22
  });

  describe("🚫 錯誤處理 (404 Not Found)", () => {
    test.each([
      ["/schedules/999999", "不存在的行程"],
      ["/favorites/999999", "不存在的收藏"],
      ["/groups/999999/bills", "不存在的群組"],
    ])("應該回傳 404 (%s)", async (route) => {
      const response = await request(app)
        .get(route)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });


    it("應該回傳 401 (查詢不存在的自己) (GET /users/:id)", async () => {
      const fakeToken = jwt.sign({ id: 999999, email: "fake@example.com" }, config.jwtSecretKey, { expiresIn: "1h" });

      const response = await request(app)
        .get("/users/999999")
        .set("Authorization", `Bearer ${fakeToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Token 已失效或無效");
    });
  });
});

afterAll(async () => {
  if (!prisma || !prisma.$disconnect) {
    console.warn("⚠️ Prisma 連線已關閉，跳過清除數據");
    return;
  }

  // Due to foreign key, need check any foreign key table
  await prisma.$transaction([
    prisma.users_bills.deleteMany({ where: { schedule_id: testUserId } }),
    prisma.bills.deleteMany({ where: { created_by: testUserId } }),
    prisma.favorites.deleteMany({ where: { favorite_user: testUserId } }),
    prisma.schedules.deleteMany({ where: { create_by: testUserId } }),
    prisma.places.deleteMany({ where: { place_id: "test-place-1" } }),
  ]);

  console.log("✅ 測試數據已清除");

  await prisma.$disconnect(); // ✅ 確保 Prisma 連線關閉
});
