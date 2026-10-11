# Market-i API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/express-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-mongoose-green.svg)](https://mongoosejs.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

A production-ready, feature-complete RESTful backend API for the **Market-i** E-Commerce platform, built using **Node.js**, **Express**, **MongoDB (Mongoose)**, and **JSON Web Tokens (JWT)**.

---

## 🌟 Key Features

- **Authentication & Authorization**:
  - Secure account registration with input sanitization and password hashing (`bcryptjs`).
  - Email verification with timed JWT activation tokens (`nodemailer`).
  - Two-step password reset workflow utilizing 6-digit verification codes.
  - Token-based route protection with automated CORS preflight (`OPTIONS`) handling.
- **Product & Catalog Management**:
  - Browse and filter products by category, brand, and text search with pagination.
  - Single product details lookup via `GET /api/v1/home/products/:id`.
  - Sorting options: rating, price (ascending/descending), discounts, and popularity.
  - Auto-tracked search analytics with top search term rankings (`topSearch`).
  - Multi-image uploads via `multer` with automatic filesystem cleanup on product deletion.
  - Geospatial location coordinates support for stores and products.
  - **IDOR Protection**: Strict ownership verification so sellers can only modify or delete their own products.
- **User Shopping Experience**:
  - Cart management (add, view, remove items) using atomic MongoDB operators (`$addToSet`, `$pull`).
  - Wishlist / Favorites tracking with duplicate prevention.
  - Product rating system with weighted score averaging.
  - "Buy Again" order history re-purchasing list.
  - Stripe Checkout session integration for payments (`POST /api/v1/user/checkout`).
- **User Profile & Media Management**:
  - Profile avatar upload with automatic cleanup of previous custom images.
  - User details retrieval and profile modification.
  - Static asset serving for banners, brands, categories, avatars, and product uploads.
- **Robustness & Performance**:
  - Atomic database queries to prevent race conditions.
  - Search regex escaping to prevent ReDoS (Regular Expression Denial of Service).
  - Centralized global error handling and graceful fallbacks.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) / [Mongoose](https://mongoosejs.com/)
- **Security & Cryptography**: `bcryptjs`, `jsonwebtoken`
- **File Uploads**: `multer`
- **Mailing**: `nodemailer`
- **Payments**: `stripe`
- **Utilities**: `dotenv`, `cors`

---

## 📁 Project Structure

```text
market-i/
├── app.js                         # Application entrypoint & middleware configuration
├── package.json                   # Dependencies & npm scripts
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignored files & folders
│
├── controllers/                   # Request controllers & business logic
│   ├── auth/
│   │   ├── basicAuth.js           # Sign-up and Sign-in logic
│   │   ├── verifyEmail.js         # Email verification mailing & activation
│   │   ├── resetPassword.js       # Password reset with 6-digit verification code
│   │   ├── googleAuth.js          # Google OAuth Strategy setup
│   │   └── facebookAuth.js        # Facebook OAuth Strategy setup
│   └── home/
│       ├── basicUser.js           # Cart, favorites, rating, checkout & products
│       ├── bacicUser.js           # Backward-compatibility alias
│       ├── portfolio.js           # User profile & avatar handling
│       └── show.js                # Public catalog, filters & top searches
│
├── middlewares/                   # Custom Express middlewares
│   ├── jwt.js                     # JWT authorization & public route exemption
│   ├── jwtError.js                # JWT error handling helper
│   └── topSearch.js               # Search query counter & ranking cleanup
│
├── models/                        # Mongoose data schemas
│   ├── banner.js                  # Promotional banners
│   ├── brand.js                   # Product brands
│   ├── category.js                # Product categories
│   ├── googleUser.js              # Google OAuth accounts
│   ├── facebookUser.js            # Facebook OAuth accounts
│   ├── product.js                 # Product catalog & geolocation
│   ├── topSearch.js               # Search frequency tracking
│   └── user.js                    # User account, cart, favorites, & profile
│
├── routers/                       # Express route definitions
│   ├── auth.js                    # /api/v1/auth routes
│   ├── data.js                    # /api/v1/data seed & test routes
│   ├── home.js                    # /api/v1/home catalog routes
│   ├── portfolio.js               # /api/v1/portfolio user profile routes
│   └── user.js                    # /api/v1/user cart, favorites & products
│
└── images/                        # Static file storage
    ├── banners/                   # Banner images
    ├── brands/                    # Brand logos
    ├── categories/                # Category icons
    ├── portfolio/                 # User avatars
    └── uploads/                   # Uploaded product images
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or newer)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas cluster URI)
- npm or yarn

### 2. Installation

Clone the repository and install dependencies:

```bash
cd market-i
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Configure your variables inside `.env`:

```env
PORT=3000
API_URL=/api/v1
CONNECTION_STRING=mongodb://localhost:27017/market-i
SECRET=your_jwt_super_secret_key_here

# Nodemailer Gmail credentials (optional for testing)
USER=your_email@gmail.com
PASSWORD=your_gmail_app_password

# Stripe Payments (optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

### 4. Running the Application

- **Development Mode** (with auto-reload using `nodemon`):
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

Once started, the server will be available at:
`http://localhost:3000/api/v1`

---

## 📖 API Documentation

All API endpoints are prefixed with `/api/v1` (or your configured `API_URL`).

### 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/signUp` | No | Register a new user and receive verification email |
| `POST` | `/auth/signIn` | No | Log in with email & password, returns JWT token |
| `GET` | `/auth/verify/:token` | No | Activate user email via JWT link |
| `POST` | `/auth/sendPassEmail` | No | Send 6-digit password reset code to user's email |
| `POST` | `/auth/activeResetPass` | No | Verify 6-digit reset code |
| `POST` | `/auth/resetPassword` | No | Reset user password after verification |

#### Registration Request Example (`POST /api/v1/auth/signUp`):
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "password": "Password123#",
  "confirmPassword": "Password123#"
}
```

---

### 2. Public Catalog & Home (`/api/v1/home`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/home/products` | No | List products with pagination, search, & filters |
| `GET` | `/home/products/:id` | No | Retrieve details of a specific product by ID |
| `GET` | `/home/categories` | No | Retrieve all product categories |
| `GET` | `/home/brands` | No | Retrieve all product brands |
| `GET` | `/home/banners` | No | Retrieve promotional banners |
| `GET` | `/home/topSearch` | No | Retrieve top 10 most popular search terms |

#### Query Parameters for `/home/products`:
- `search` *(string)*: Search title or description (e.g. `?search=phone`)
- `category` *(string)*: Filter by category (e.g. `?category=electronics`)
- `brand` *(string)*: Filter by brand (e.g. `?brand=apple`)
- `price` *("up" \| "down")*: Sort by price ascending/descending
- `rating` *("up" \| "down")*: Sort by rating
- `discount` *("up" \| "down")*: Sort by discount percentage
- `popular` *(boolean)*: Sort by rating and sold count
- `skip` *(number)*: Page offset (default `0`)
- `limit` *(number)*: Products per page (default `10`)

---

### 3. User, Cart & Products (`/api/v1/user`)

> **Note**: These endpoints require an `Authorization: Bearer <TOKEN>` header.

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/user/getCart` | Yes | Get all items currently in user's cart |
| `POST` | `/user/addCart` | Yes | Add product to user's cart |
| `DELETE` | `/user/deleteCart/:productId?` | Yes | Remove product from cart (via URL param, query or body) |
| `GET` | `/user/getFavorite` | Yes | Get user's favorited items |
| `POST` | `/user/addFavorite` | Yes | Add product to user's favorites |
| `DELETE` | `/user/deleteFavorite/:productId?` | Yes | Remove product from favorites |
| `POST` | `/user/addRate` | Yes | Rate a product (1 to 5) |
| `GET` | `/user/getBuyAgain` | Yes | Get user's repurchase history |
| `POST` | `/user/addProduct` | Yes | Create a product (`multipart/form-data`, up to 5 images) |
| `PUT` | `/user/editProduct/:productId?` | Yes | Update an owned product (`multipart/form-data`) |
| `DELETE` | `/user/deleteProduct/:productId?` | Yes | Delete an owned product & clean up disk images |
| `POST` | `/user/checkout` | Yes | Create a Stripe Checkout session for cart items |

---

### 4. User Profile (`/api/v1/portfolio`)

> **Note**: These endpoints require an `Authorization: Bearer <TOKEN>` header.

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/portfolio/userData` | Yes | Retrieve current user profile details |
| `POST` / `PUT` | `/portfolio/editUserData` | Yes | Update user details (name, address, phone, etc.) |
| `POST` | `/portfolio/addImage` | Yes | Upload custom profile avatar (`multipart/form-data`) |

---

### 5. Static Assets

Static assets are accessible directly over HTTP:
- Product Uploads: `http://localhost:3000/api/v1/uploads/<filename>`
- User Avatars: `http://localhost:3000/api/v1/portfolio/<filename>`
- General Images: `http://localhost:3000/api/v1/images/<banners|brands|categories>/<filename>`

---

## 🔒 Security Best Practices

1. **Password Safety**: Passwords require mixed case, numbers, and special characters, and are hashed with a salt factor of 8.
2. **JWT Expiration**: Access tokens expire in 7 days, and email verification tokens expire in 24 hours.
3. **IDOR Protection**: Product edits and deletions verify that the requesting user owns the product or is an administrator.
4. **Data Protection**: Mongoose models strictly validate types, and passwords are never returned in responses.
5. **File Upload Restrictions**: Multer filters files to image types only with a strict 5MB size limit.

---

## 📄 License

This project is licensed under the **ISC License**.
