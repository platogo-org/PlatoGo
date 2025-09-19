Role rules
==========

Roles:

- `super-admin`: Full access to the platform. Can manage users, restaurants, products and orders across all restaurants.
- `restaurant-admin`: Limited access to manage only their assigned restaurant. Can create/update/delete products and orders that belong to their restaurant and manage users associated to their restaurant.

Enforcement:

- Authentication is required for all protected endpoints via `authController.protect`.
- Super-admin is verified with `authController.ensureSuperAdmin`.
- Restaurant ownership and restaurant-admin checks are performed by `utils/authorization.js` -> `ensureRestaurantOwnership` which:
  - Allows `super-admin` to bypass ownership checks.
  - Allows `restaurant-admin` only when `req.user.restaurant` matches the target restaurant id (from `req.params.id`, `req.body.restaurant` or `req.params.restaurantId`).

Notes:

- Frontend redirect rules are implemented in `authController.getRedirectUrlForUser` and `createSendToken` payloads.
# Role Rules (Super Admin)

This file documents the Super Admin authorization rule.

Super Admin

- Role identifier: `super-admin` (stored on `User.role`).
- Privileges: full platform access. Can manage users, restaurants, products and orders across the system.
- Enforcement: the `ensureSuperAdmin` middleware verifies the authenticated user's `role` equals `super-admin`. If not, returns `403`.

Integration

- The `ensureSuperAdmin` middleware must be used after `protect` (authentication) so `req.user` is populated.
- Example usage in routes:

  - `router.get('/admin-only', protect, ensureSuperAdmin, adminController.index)`

Testing

- Unit tests should check:
  - `ensureSuperAdmin` allows a request when `req.user.role === 'super-admin'`.
  - `ensureSuperAdmin` returns `403` when role is different.
  - `ensureSuperAdmin` returns `401` when `req.user` is missing.
