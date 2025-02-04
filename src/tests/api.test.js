import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../index.js";
import { config } from "../../config.js";
import { prisma } from "../../src/configs/db.js"; // Prisma 客戶端
import { PrismaClientUnknownRequestError } from "@prisma/client/runtime/library";


let token;
let scheduleId

beforeAll(async () => {
  // 🔹 先建立測試用戶
  const testUser = await prisma.users.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {email: "test@example.com", name: "Test User", password:"12345678",token:null },
  });

  // 🔹 建立測試行程，確保用戶有 `schedule_id`
  const testSchedule = await prisma.schedules.create({
    data: {
      create_by:testUser.id,
      title: "test",
      total_users: 1,
      transportation_way:"CAR",
      start_date: new Date(),
      end_date: new Date(),
    },
  });

  scheduleId = testSchedule.id; // 記錄行程 ID

  // 🔹 產生測試 Token，包含正確的 `user_id`
  const testPayload = { id: testUser.id, email: testUser.email };
  token = jwt.sign(testPayload, config.jwtSecretKey, { expiresIn: "1h" });
   // 🔹 更新 `users` 表，確保 `token` 存入
  await prisma.users.update({
    where: { id: testUser.id },
    data: { token: token },
  });
});


describe("API 測試 - 需要 Token 的 API", () => {
  // 🔹 產生測試用 JWT Token
  
  it("應該回傳 200 (使用有效的 Token) (GET /users)", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${token}`)
        .redirects(1); // 允許重定向

      expect(response.status).toBe(200); // 確保最後的狀態是 200
    });
    
  });

  it("應該回傳 401 (沒有 Token)", async () => {
    const response = await request(app).get("/users/check"); // 🔹 沒有 Token
    expect(response.status).toBe(401);
  });

  it("應該回傳 401 (使用無效的 Token)", async () => {
    const response = await request(app)
      .get("/users/check")
      .set("Authorization", "Bearer invalid_token"); // 🔹 使用錯誤的 Token

    expect(response.status).toBe(401);
  });


describe("GET /places", () => {
  it("回傳景點資料", async () => {
    const response = await request(app).get("/places");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});


describe("API 測試 - 用戶 (Users)", () => {
  // ✅ 測試 `/users` API，確保需要 Token
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

describe("API 測試 - 行程 (Schedules)", () => {
  it("應該回傳所有行程 (GET /schedules)", async () => {
    const response = await request(app)
    .get("/schedules")
    .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("應該回傳 404 錯誤（如果行程 ID 不存在）", async () => {
    const response = await request(app)
      .get("/schedules/999999") // 這裡使用不存在的 ID
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(404);
  });
  
});


describe("刪除行程", ()=>{
it("應該刪除行程 (DELETE /schedules/:id)", async () => {
  const response = await request(app)
    .delete(`/schedules/${scheduleId}`) // `scheduleId` 是測試用的行程 ID
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.message).toBe("成功刪除");
});
})

