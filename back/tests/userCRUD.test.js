// Integration test for CRUD operations on users
const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
let superAdminToken;
let userId;

describe("User CRUD Integration", () => {
  beforeAll(async () => {
    // Log in as super-admin to get token
    const res = await request(app)
      .post("/api/v1/users/login")
      .send({ email: "superadmin@email.com", password: "superadminpass" });
    superAdminToken = res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("Create user", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "Test User",
        email: "testuser@email.com",
        password: "testpass",
        passwordConfirm: "testpass",
        role: "restaurant-admin",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.name).toBe("Test User");
    userId = res.body.data.user._id;
  });

  test("Get all users", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${superAdminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.users)).toBe(true);
  });

  test("Update user", async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({ name: "Updated User" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.name).toBe("Updated User");
  });

  test("Delete user", async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);
    expect(res.statusCode).toBe(204);
  });
});
