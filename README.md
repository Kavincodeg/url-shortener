# 🔗 Linko – URL Shortener with Analytics

### Shorten. Track. Analyze.

Linko is a modern full-stack URL Shortener and Analytics platform built with **React, Node.js, Express, and MongoDB**. It allows users to create branded short links, track engagement through real-time analytics, generate QR codes, manage custom aliases, monitor visitor behavior, and gain valuable insights through a clean SaaS-style dashboard.

---

## 📸 Project Preview

### Core Modules

- Authentication & Authorization
- URL Shortening
- Custom Aliases
- QR Code Generation
- Click Analytics
- Visit History Tracking
- Device & Browser Analytics
- Location Analytics
- Public Statistics Page
- Expiry Links
- Bulk URL Shortening
- Modern SaaS Dashboard

---

## 🚀 Features

### 🔐 Authentication & Authorization

- User Registration
- User Login
- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Ownership-Based Access Control
- Profile Management

Users can only access and manage their own shortened URLs and analytics.

---

### 🔗 URL Shortening

Convert long URLs into short and shareable links.

#### Example

Input:

```text
https://www.example.com/my-very-long-url
```

Output:

```text
https://linko.io/abc123
```

Features:

- URL Validation
- Unique Short Code Generation
- Instant URL Creation
- Copy to Clipboard
- Share Functionality

---

### 🎯 Custom Alias

Create branded links such as:

```text
https://linko.io/my-portfolio
```

instead of

```text
https://linko.io/abc123
```

Features:

- Custom Alias Validation
- Duplicate Alias Prevention
- SEO-Friendly Links

---

### ⏰ Expiry Links

Set expiration dates for links.

Examples:

- 24 Hours
- 7 Days
- Custom Expiry Date

Expired links:

- Automatically become inactive
- Display Expired Status
- Stop redirecting visitors

---

### 📱 QR Code Generation

Generate QR codes for every shortened URL.

Features:

- QR Code Preview
- Download PNG
- Download SVG
- Mobile-Friendly Sharing

---

### 📊 Analytics Dashboard

Gain valuable insights into link performance.

#### KPI Metrics

- Total Clicks
- Unique Clicks
- Last Click
- Average Daily Clicks

#### Interactive Charts

- Daily Click Trends
- Weekly Performance
- Monthly Growth

#### Analytics Breakdown

- Device Analytics
- Browser Analytics
- Country Analytics
- City Analytics
- Referrer Analytics

---

### 📜 Visit History Tracking

Every click is stored and analyzed.

Tracked Data:

- Timestamp
- Country
- City
- Browser
- Operating System
- Device Type
- Referrer
- IP Address

---

### 🌎 Public Statistics Page

Share analytics publicly.

Example:

```text
https://linko.io/stats/abc123
```

Displays:

- Total Clicks
- Unique Clicks
- Last Click
- Click Trends
- Top Countries

No login required.

---

### 📂 Bulk URL Shortening

Upload multiple URLs using CSV files.

Features:

- CSV Upload
- Batch Processing
- Bulk URL Creation
- Export Results

Supported Format:

```csv
https://google.com
https://github.com
https://linkedin.com
```

---

### 👤 Profile Management

Manage account settings.

Features:

- Update Name
- Update Email
- Change Password
- Profile Settings
- Timezone Settings

---

### 🔔 Notification System

Real-time toast notifications.

#### Success Notifications

- Link Created Successfully
- URL Updated
- URL Deleted
- Link Copied

#### Error Notifications

- Invalid URL
- Duplicate Alias
- Expired Link
- Upload Failed

---

### 📭 Empty States

Dedicated UI for empty content.

Examples:

- No Links Found
- No Analytics Available
- No Search Results

Actions:

- Create New Link
- Import CSV

---

## 🎨 Modern SaaS UI

Inspired by:

- Stripe
- Vercel
- Linear
- Notion

Design Highlights:

- Clean Light Theme
- Responsive Layout
- Accessible Components
- Minimal Dashboard Design
- Mobile-Friendly Experience
- Loading States
- Empty States
- Success/Error States

---

# 🏗️ System Architecture

## Frontend

Built using:

- React.js
- React Router DOM
- Tailwind CSS
- Shadcn UI
- Axios
- React Hook Form
- Recharts
- Lucide React

---

## Backend

Built using:

- Node.js
- Express.js
- JWT
- bcrypt
- Express Validator

---

## Database

- MongoDB Atlas
- Mongoose ODM

---

## Additional Tools

- QRCode
- UA Parser JS
- GeoIP
- Multer
- CSV Parser
- Helmet
- CORS
- Morgan

---

# 📂 Project Structure

```bash
linko/
│
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── routes/
│   │   └── utils/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validators/
│
├── README.md
└── package.json
```

---

# 🗄️ Database Schema

## Users Collection

```javascript
{
  _id,
  name,
  email,
  password,
  createdAt,
  updatedAt
}
```

---

## URLs Collection

```javascript
{
  _id,
  userId,
  originalUrl,
  shortCode,
  customAlias,
  totalClicks,
  expiresAt,
  qrCode,
  createdAt,
  updatedAt
}
```

---

## Visits Collection

```javascript
{
  _id,
  urlId,
  timestamp,
  ip,
  browser,
  os,
  device,
  country,
  city,
  referrer
}
```

---

# 🔌 REST API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

---

## URLs

```http
POST   /api/urls
GET    /api/urls
PUT    /api/urls/:id
DELETE /api/urls/:id
```

---

## Analytics

```http
GET /api/analytics/:id
GET /api/analytics/:id/visits
```

---

## Redirect

```http
GET /:shortCode
```

---

## Public Stats

```http
GET /stats/:shortCode
```

---

## Bulk Upload

```http
POST /api/bulk
```

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Ownership Authorization
- Input Validation
- URL Validation
- Rate Limiting
- Helmet Security
- CORS Protection
- Request Logging
- Centralized Error Handling

---

# 📈 Analytics Features

### Traffic Analytics

- Total Clicks
- Unique Clicks
- Daily Click Trends

### Visitor Analytics

- Device Tracking
- Browser Tracking
- Country Tracking
- City Tracking

### Source Analytics

- Referrer Tracking
- Direct Traffic Tracking

### Historical Analytics

- Visit History
- Recent Visits
- Last Visited Timestamp

---

# 🚀 Deployment

### Frontend

- Vercel
- Netlify

### Backend

- Railway
- Render
- Fly.io

### Database

- MongoDB Atlas

---

# 🌟 Key Highlights

✅ JWT Authentication

✅ Password Hashing

✅ URL Validation

✅ Unique Short Codes

✅ Custom Aliases

✅ QR Code Generation

✅ Analytics Dashboard

✅ Device Analytics

✅ Browser Analytics

✅ Location Analytics

✅ Visit History

✅ Public Statistics

✅ Bulk URL Shortening

✅ Expiry Links

✅ Responsive Design

✅ Modern SaaS UI

✅ Protected Routes

---

# 🔮 Future Enhancements

- Team Collaboration
- Custom Domains
- UTM Builder
- Campaign Tracking
- AI-Powered Insights
- Scheduled Reports
- Email Analytics Reports
- Advanced Marketing Dashboard
- Webhook Integrations

---

# 👨‍💻 Author

Built as a modern SaaS-grade URL management and analytics platform.

### 🔗 Linko

**Shorten. Track. Analyze.**
