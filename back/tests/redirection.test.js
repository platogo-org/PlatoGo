const { getRedirectUrlForUser } = require('../controllers/authController');

describe('getRedirectUrlForUser', () => {
  test('returns super-admin dashboard url', () => {
    const user = { role: 'super-admin' };
    expect(getRedirectUrlForUser(user)).toBe('/super-admin/dashboard');
  });

  test('returns restaurant dashboard url', () => {
    const user = { role: 'restaurant-admin' };
    expect(getRedirectUrlForUser(user)).toBe('/restaurant/dashboard');
  });

  test('returns null for unknown role', () => {
    const user = { role: 'user' };
    expect(getRedirectUrlForUser(user)).toBeNull();
  });
});
