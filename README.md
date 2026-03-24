# 🎯 Code-Pair — Peer-to-Peer Mock Interview Platform API

A Node.js + Express + MongoDB backend for booking mock interviews using a credit system.

---

## 📁 Folder Structure

```
code-pair/
├── config/
│   └── db.js                  ← MongoDB connection
├── controllers/
│   ├── authController.js      ← Register & Login logic
│   ├── creditController.js    ← Credit balance logic
│   ├── slotController.js      ← Slot creation & listing
│   └── bookingController.js   ← Book, complete, cancel
├── middleware/
│   └── authMiddleware.js      ← JWT verification (protect)
├── models/
│   ├── User.js                ← User schema (name, email, password, credits)
│   ├── Slot.js                ← Availability slot schema
│   └── Booking.js             ← Booking/interview schema
├── routes/
│   ├── authRoutes.js          ← /api/auth/*
│   ├── creditRoutes.js        ← /api/credits/*
│   ├── slotRoutes.js          ← /api/slots/*
│   └── bookingRoutes.js       ← /api/bookings/*
├── .env.example               ← Sample environment variables
├── package.json
└── server.js                  ← App entry point
```

---

## 🚀 Step-by-Step Setup in VS Code

### Step 1 — Prerequisites

Make sure you have these installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) **OR** a free [MongoDB Atlas](https://www.mongodb.com/atlas) account
- [VS Code](https://code.visualstudio.com/)

### Step 2 — Open the Project

1. Extract the `code-pair` folder
2. Open VS Code → File → Open Folder → select `code-pair`

### Step 3 — Install Dependencies

Open the VS Code terminal (`Ctrl + `` ` ``):

```bash
npm install
```

This installs: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `dotenv`, `nodemon`

### Step 4 — Create Your .env File

```bash
# In VS Code terminal:
cp .env.example .env
```

Then open `.env` and update the values:

```
MONGO_URI=mongodb://localhost:27017/codepair
JWT_SECRET=pick_any_long_random_string_here
JWT_EXPIRES_IN=7d
PORT=5000
```

> 💡 If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### Step 5 — Run the Server

```bash
# Development mode (auto-restarts on file changes):
npm run dev

# OR normal mode:
npm start
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ MongoDB Connected: localhost
```

---

## 📡 API Reference

All protected routes require this header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 🔐 Auth Routes — `/api/auth`

| Method | Endpoint            | Auth? | Description              |
|--------|---------------------|-------|--------------------------|
| POST   | `/api/auth/register`| ❌    | Create a new account     |
| POST   | `/api/auth/login`   | ❌    | Login and get JWT token  |

**Register — Request Body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123"
}
```

**Login — Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

---

### 💳 Credit Routes — `/api/credits`

| Method | Endpoint              | Auth? | Description                |
|--------|-----------------------|-------|----------------------------|
| GET    | `/api/credits/balance`| ✅    | Get your credit balance    |

---

### 🗓️ Slot Routes — `/api/slots`

| Method | Endpoint               | Auth? | Description                                  |
|--------|------------------------|-------|----------------------------------------------|
| POST   | `/api/slots/create`    | ✅    | Create an availability slot (as interviewer) |
| GET    | `/api/slots/available` | ✅    | View all unbooked slots (excluding yours)    |
| GET    | `/api/slots/my-slots`  | ✅    | View slots you created                       |

**Create Slot — Request Body:**
```json
{
  "date": "2025-02-15",
  "startTime": "10:00",
  "endTime": "11:00"
}
```

---

### 📋 Booking Routes — `/api/bookings`

| Method | Endpoint                             | Auth? | Description                                |
|--------|--------------------------------------|-------|--------------------------------------------|
| POST   | `/api/bookings/book`                 | ✅    | Book a slot (costs 1 credit)               |
| GET    | `/api/bookings/my-bookings`          | ✅    | Get all your bookings                      |
| PATCH  | `/api/bookings/:bookingId/complete`  | ✅    | Mark as completed (+1 credit to interviewer)|
| PATCH  | `/api/bookings/:bookingId/cancel`    | ✅    | Cancel booking (credit refunded)           |

**Book Interview — Request Body:**
```json
{
  "slotId": "64abc123...",
  "topic": "DSA"
}
```
> `topic` must be one of: `"DSA"`, `"Web"`, `"HR"`

---

## 💡 Credit System Logic

| Event                       | Who         | Credits Change |
|-----------------------------|-------------|---------------|
| Account created             | New user    | +2 (starts with 2) |
| Book an interview           | Interviewee | -1 credit      |
| Interview marked complete   | Interviewer | +1 credit      |
| Interview cancelled         | Interviewee | +1 credit (refund) |

---

## 🧪 Testing with Postman

1. Import the routes into Postman
2. Register a user → copy the `token` from the response
3. In Postman, go to the **Authorization** tab → select **Bearer Token** → paste the token
4. You're now authenticated for all protected routes

---

## 🔧 VS Code Recommended Extensions

- **REST Client** — test APIs directly from `.http` files in VS Code
- **MongoDB for VS Code** — browse your database visually
- **Thunder Client** — lightweight Postman alternative inside VS Code
