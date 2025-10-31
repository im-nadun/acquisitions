# Acquisitions API - Usage Guide

## 🎯 What Was Fixed

### Bugs Fixed:

1. ✅ Fixed validation logic (was checking `success` instead of `!success`)
2. ✅ Fixed undefined `jwbtoken` → changed to `jwtToken`
3. ✅ Added missing `await` in database query
4. ✅ Fixed missing `password` parameter in `createUser` call
5. ✅ Fixed route typo (`'sign-up'` → `'/sign-up'`)

### Features Implemented:

1. ✅ Complete **sign-in** functionality with password verification
2. ✅ Complete **sign-out** functionality
3. ✅ Authentication middleware to protect routes
4. ✅ Authorization middleware for role-based access
5. ✅ Password comparison utility
6. ✅ User lookup service

---

## 📡 API Endpoints

### Public Endpoints (No authentication required)

#### 1. Sign Up

```http
POST /api/auth/sign-up
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "user"  // Optional: "user" or "admin" (default: "user")
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

_Note: JWT token is set in HTTP-only cookie_

---

#### 2. Sign In

```http
POST /api/auth/sign-in
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response:**

```json
{
  "message": "Signed in successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

_Note: JWT token is set in HTTP-only cookie_

---

### Protected Endpoints (Authentication required)

#### 3. Sign Out

```http
POST /api/auth/sign-out
Cookie: token=<jwt-token>
```

**Response:**

```json
{
  "message": "Signed out successfully"
}
```

---

#### 4. Get Profile (Example)

```http
GET /api/profile
Cookie: token=<jwt-token>
```

**Response:**

```json
{
  "message": "Profile data",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

#### 5. Admin Dashboard (Example - Admin only)

```http
GET /api/admin
Cookie: token=<jwt-token>
```

**Response (if user is admin):**

```json
{
  "message": "Admin dashboard",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response (if user is not admin):**

```json
{
  "error": "Access denied",
  "message": "Insufficient permissions"
}
```

---

## 🔐 Middleware Usage

### How to Protect Routes

#### 1. Require Authentication Only

```javascript
import { authenticate } from '#middleware/auth.middleware.js';

router.get('/protected', authenticate, (req, res) => {
  // req.user contains: { id, email, role }
  res.json({ user: req.user });
});
```

#### 2. Require Specific Role(s)

```javascript
import { authenticate, authorize } from '#middleware/auth.middleware.js';

// Admin only
router.get('/admin', authenticate, authorize('admin'), (req, res) => {
  res.json({ message: 'Admin area' });
});

// Admin or moderator
router.get(
  '/moderate',
  authenticate,
  authorize('admin', 'moderator'),
  (req, res) => {
    res.json({ message: 'Moderation panel' });
  }
);
```

---

## 🧪 Testing with cURL

### Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123"}'
```

### Sign In

```bash
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"john@example.com","password":"secret123"}'
```

### Access Protected Route

```bash
curl http://localhost:3000/api/profile \
  -b cookies.txt
```

### Sign Out

```bash
curl -X POST http://localhost:3000/api/auth/sign-out \
  -b cookies.txt
```

---

## 🗂️ File Structure

```
src/
├── middleware/
│   └── auth.middleware.js       ✨ NEW - Authentication & authorization
├── controllers/
│   └── auth.controller.js       ✅ FIXED - signup, signin, signout
├── services/
│   └── auth.service.js          ✅ FIXED - Added comparePassword, getUserByEmail
├── routes/
│   └── auth.routes.js           ✅ FIXED - Connected all endpoints
└── app.js                       ✅ UPDATED - Example protected routes
```

---

## 🎯 What Each File Does

### `auth.middleware.js` (NEW)

- `authenticate()` - Verifies JWT token from cookie
- `authorize(...roles)` - Checks user has required role

### `auth.controller.js` (FIXED)

- `signup()` - Register new user
- `signin()` - Login existing user
- `signout()` - Clear auth cookie

### `auth.service.js` (ENHANCED)

- `hashPassword()` - Hash password with bcrypt
- `comparePassword()` - Verify password
- `getUserByEmail()` - Find user by email
- `createUser()` - Create new user in DB

---

## 🚀 Next Steps

1. Run the server:

   ```bash
   npm run dev
   ```

2. Test the endpoints with Postman, Insomnia, or cURL

3. Add more protected routes using the middleware

4. Consider adding:
   - Password reset functionality
   - Email verification
   - Refresh tokens
   - Rate limiting
   - Input sanitization
