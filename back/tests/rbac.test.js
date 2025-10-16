// Tests for ensureRestaurantOwnership middleware
const { ensureRestaurantOwnership } = require("../utils/authorization");
const AppError = require("../utils/appError");

describe("ensureRestaurantOwnership", () => {
  // Should allow super-admin without checking restaurant
  test("allows super-admin without checking restaurant", () => {
    const req = { user: { role: "super-admin" } };
    const res = {};
    let called = false;
    const next = (err) => {
      if (err) throw err;
      called = true;
    };
    return ensureRestaurantOwnership(req, res, next).then(() => {
      expect(called).toBe(true);
    });
  });

  // Should deny access for non-logged-in user
  test("denies non-logged-in user", () => {
    const req = {};
    const res = {};
    const next = (err) => {
      expect(err).toBeDefined();
      expect(err.statusCode).toBe(401);
    };
    ensureRestaurantOwnership(req, res, next);
  });

  // Should allow restaurant-admin for their own restaurant
  test("allows restaurant-admin for own restaurant", () => {
    const req = {
      user: { role: "restaurant-admin", restaurant: "abc123" },
      params: { id: "abc123" },
    };
    const res = {};
    let called = false;
    const next = (err) => {
      if (err) throw err;
      called = true;
    };
    return ensureRestaurantOwnership(req, res, next).then(() => {
      expect(called).toBe(true);
    });
  });

  // Should deny restaurant-admin for other restaurant
  test("denies restaurant-admin for other restaurant", () => {
    const req = {
      user: { role: "restaurant-admin", restaurant: "abc123" },
      params: { id: "other" },
    };
    const res = {};
    const next = (err) => {
      expect(err).toBeDefined();
      expect(err.statusCode).toBe(403);
    };
    ensureRestaurantOwnership(req, res, next);
  });
});
