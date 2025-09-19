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
