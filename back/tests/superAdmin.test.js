// Tests for ensureSuperAdmin middleware
const { ensureSuperAdmin } = require("../controllers/authController");

describe("ensureSuperAdmin middleware", () => {
  // Should allow when user is super-admin
  test("allows when user is super-admin", () => {
    const req = { user: { role: "super-admin" } };
    const res = {};
    let called = false;
    const next = (err) => {
      if (err) throw err;
      called = true;
    };

    ensureSuperAdmin(req, res, next);
    expect(called).toBe(true);
  });

  // Should return 403 when user is not super-admin
  test("returns 403 when user is not super-admin", () => {
    const req = { user: { role: "restaurant-admin" } };
    const res = {};
    const next = (err) => {
      expect(err).toBeDefined();
      expect(err.statusCode).toBe(403);
      expect(err.message).toMatch(/Only Super Admins/);
    };

    ensureSuperAdmin(req, res, next);
  });

  // Should return 401 when not logged in
  test("returns 401 when not logged in", () => {
    const req = {};
    const res = {};
    const next = (err) => {
      expect(err).toBeDefined();
      expect(err.statusCode).toBe(401);
    };

    ensureSuperAdmin(req, res, next);
  });
});
