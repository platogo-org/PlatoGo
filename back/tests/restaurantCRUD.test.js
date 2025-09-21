// Integration test for CRUD operations on restaurants
const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
let superAdminToken;
let restaurantId;

describe("Restaurant CRUD Integration", () => {
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

  test("Create restaurant", async () => {
    const res = await request(app)
      .post("/api/v1/restaurant")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({ name: "Test Restaurant", address: "123 Main St" });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.restaurant.name).toBe("Test Restaurant");
    restaurantId = res.body.data.restaurant._id;
  });

  test("Get all restaurants", async () => {
    const res = await request(app)
      .get("/api/v1/restaurant")
      .set("Authorization", `Bearer ${superAdminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.restaurants)).toBe(true);
  });

  test("Update restaurant", async () => {
    const res = await request(app)
      .patch(`/api/v1/restaurant/${restaurantId}`)
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({ name: "Updated Restaurant" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.restaurant.name).toBe("Updated Restaurant");
  });

  test("Delete restaurant", async () => {
    const res = await request(app)
      .delete(`/api/v1/restaurant/${restaurantId}`)
      .set("Authorization", `Bearer ${superAdminToken}`);
    expect(res.statusCode).toBe(204);
  });
});
