// Tests for getRedirectUrlForUser function
const { getRedirectUrlForUser } = require("../controllers/authController");

describe("getRedirectUrlForUser", () => {
  // Should return super-admin dashboard URL
  test("returns super-admin dashboard url", () => {
    const user = { role: "super-admin" };
    expect(getRedirectUrlForUser(user)).toBe("/super-admin/dashboard");
  });

  // Should return restaurant dashboard URL
  test("returns restaurant dashboard url", () => {
    const user = { role: "restaurant-admin" };
    expect(getRedirectUrlForUser(user)).toBe("/restaurant/dashboard");
  });

  // Should return null for unknown role
  test("returns null for unknown role", () => {
    const user = { role: "user" };
    expect(getRedirectUrlForUser(user)).toBeNull();
  });
});
