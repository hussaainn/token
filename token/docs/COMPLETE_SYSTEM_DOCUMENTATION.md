# TOQN - Token Queue Management System
## Complete System Documentation

---

# Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [User Roles](#user-roles)
5. [Database Models](#database-models)
6. [API Endpoints](#api-endpoints)
7. [Core Features & Flows](#core-features--flows)
8. [Real-time Communication](#real-time-communication)
9. [Authentication & Authorization](#authentication--authorization)
10. [Frontend Structure](#frontend-structure)
11. [Key Algorithms](#key-algorithms)

---

# 1. System Overview

TOQN is a comprehensive Token Queue Management System designed for salons and service-based businesses. It enables customers to book services, manage appointments, earn loyalty points, and provides administrators with powerful tools to manage the queue, staff, and services.

### Key Features:
- ✅ Digital token generation with QR codes
- ✅ Real-time queue updates via WebSockets
- ✅ AI-powered wait time prediction
- ✅ Loyalty points system with tiers
- ✅ Staff management
- ✅ Service management
- ✅ Review system
- ✅ Push notifications
- ✅ Geo-location based features

---

# 2. Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React + Vite)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Pages   │  │Components│  │ Context  │  │  Hooks   │  │   API    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │ HTTP + WebSocket
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js + Express)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Routes   │  │Controller│  │Middleware│  │  Utils   │  │ Socket.io│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │ Mongoose ODM
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (MongoDB)                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│  │  User  │ │ Token  │ │Service │ │ Loyalty│ │ Payment│ │ Review │     │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 3. Technology Stack

## Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| React Router | Navigation |
| Axios | HTTP Client |
| Socket.io-client | Real-time Communication |
| React Hot Toast | Notifications |
| Lucide React | Icons |
| date-fns | Date Manipulation |
| html5-qrcode | QR Code Scanning |

## Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| Socket.io | WebSockets |
| JSON Web Tokens | Authentication |
| Bcrypt | Password Hashing |
| QRCode | QR Generation |

---

# 4. User Roles

The system supports three user roles:

| Role | Description | Capabilities |
|------|-------------|-------------|
| **customer** | End users who book services | Book tokens, view queue, manage loyalty, submit reviews |
| **staff** | Service providers | View assigned tokens, update token status, view customers |
| **admin** | Business administrators | Full system access - manage staff, services, analytics, tokens |

---

# 5. Database Models

## User Model (`server/models/User.js`)
```
javascript
{
    name: String,              // Required
    email: String,             // Required, Unique
    phone: String,
    password: String,         // Hashed, Required
    role: String,             // 'customer' | 'staff' | 'admin'
    avatar: String,
    isActive: Boolean,
    fcmToken: String,         // Firebase Cloud Messaging token
    webPushSubscription: Object,
    loyaltyPoints: Number,
    specialization: String,   // For staff
    refreshToken: String
}
```

## Token Model (`server/models/Token.js`)
```
javascript
{
    tokenNumber: String,       // Human-readable (e.g., "T-1234")
    qrToken: String,          // Unique UUID for QR
    qrCode: String,           // QR image URL
    customer: ObjectId,       // Ref: User
    service: ObjectId,        // Ref: Service
    staff: ObjectId,          // Ref: User
    date: Date,               // Booking date
    timeSlot: String,         // Booked time
    status: String,           // 'waiting' | 'serving' | 'completed' | 'cancelled' | 'no-show' | 'arrived'
    arrivalStatus: String,   // 'unknown' | 'arrived'
    estimatedWaitTime: Number,
    notes: String,
    startedAt: Date,
    completedAt: Date,
    checkedInAt: Date,
    rescheduledFrom: ObjectId
}
```

## Service Model (`server/models/Service.js`)
```
javascript
{
    name: String,              // Required
    description: String,
    duration: Number,          // Minutes, Required
    price: Number,            // Required
    category: String,         // 'hair' | 'skin' | 'nail' | 'makeup' | etc.
    isActive: Boolean,
    imageUrl: String,
    averageRating: Number,
    totalReviews: Number
}
```

## Loyalty Model (`server/models/Loyalty.js`)
```
javascript
{
    customer: ObjectId,        // Ref: User, Unique
    totalPoints: Number,
    lifetimeEarned: Number,
    lifetimeRedeemed: Number,
    tier: String,            // 'bronze' | 'silver' | 'gold' | 'platinum'
    history: [
        {
            type: String,    // 'earned' | 'redeemed'
            points: Number,
            description: String,
            token: ObjectId,
            date: Date
        }
    ]
}
```

## Payment Model (`server/models/Payment.js`)
```
javascript
{
    token: ObjectId,          // Ref: Token
    customer: ObjectId,       // Ref: User
    service: ObjectId,       // Ref: Service
    amount: Number,
    discountApplied: Number,
    finalAmount: Number,
    method: String,          // 'cash' | 'card' | 'upi' | 'loyalty'
    status: String,          // 'pending' | 'completed' | 'refunded'
    pointsEarned: Number,
    pointsRedeemed: Number,
    transactionId: String
}
```

## Review Model (`server/models/Review.js`)
```
javascript
{
    token: ObjectId,          // Ref: Token
    customer: ObjectId,       // Ref: User
    staff: ObjectId,         // Ref: User
    service: ObjectId,       // Ref: Service
    rating: Number,          // 1-5, Required
    staffRating: Number,     // 1-5
    comment: String,
    isVisible: Boolean
}
```

## Notification Model (`server/models/Notification.js`)
```
javascript
{
    user: ObjectId,           // Ref: User
    type: String,            // 'token' | 'reminder' | 'promo' | 'system'
    title: String,
    message: String,
    data: Object,
    isRead: Boolean
}
```

---

# 6. API Endpoints

## Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /register | Public | Register new customer |
| POST | /login | Public | Login user |
| POST | /refresh | Public | Refresh JWT token |
| GET | /me | Private | Get current user |
| PUT | /profile | Private | Update profile |
| PUT | /password | Private | Change password |

## Tokens (`/api/tokens`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /queue | Public | Get live queue |
| GET | /waiting-time | Public | Get AI wait time |
| POST | /checkin | Customer/Admin/Staff | QR check-in |
| GET | /my | Customer | Get my tokens |
| GET | / | Admin/Staff | Get all tokens |
| POST | / | Customer | Book new token |
| GET | /:id | Private | Get token details |
| PATCH | /:id/status | Admin/Staff | Update status |
| PATCH | /:id/cancel | Customer/Admin | Cancel token |
| PATCH | /:id/reschedule | Customer | Reschedule |
| POST | /call-next | Admin/Staff | Call next customer |

## Services (`/api/services`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | / | Public | Get all services |
| GET | /:id | Public | Get service details |
| POST | / | Admin | Create service |
| PUT | /:id | Admin | Update service |
| DELETE | /:id | Admin | Deactivate service |

## Loyalty (`/api/loyalty`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | / | Customer | Get my loyalty |
| POST | /redeem | Customer | Redeem points |
| GET | /leaderboard | Admin | Get top customers |

## Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | / | Customer | Submit review |
| GET | /service/:id | Public | Service reviews |
| GET | /staff/:id | Public | Staff reviews |
| GET | / | Admin | All reviews |

## Staff (`/api/staff`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | / | Private | Get active staff |

## Admin (`/api/admin`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /dashboard | Admin | Dashboard stats |
| GET | /analytics | Admin | Analytics data |
| GET | /customers | Admin | Customer list |
| GET | /staff | Admin | Staff list |
| POST | /staff | Admin | Add staff |
| PUT | /staff/:id | Admin | Update staff |
| DELETE | /staff/:id | Admin | Remove staff |

---

# 7. Core Features & Flows

## A. User Registration & Login Flow

### Registration
```
User enters: name, email, password, phone
    ↓
Frontend: api.post('/auth/register', { name, email, password, phone })
    ↓
Backend: Check duplicate email
    ↓
Backend: Hash password with bcrypt (12 rounds)
    ↓
Backend: Create User document
    ↓
Backend: Create Loyalty account for customer
    ↓
Backend: Generate JWT + Refresh Token
    ↓
Frontend: Store tokens in localStorage
    ↓
Redirect to dashboard
```

### Login
```
User enters: email, password
    ↓
Frontend: api.post('/auth/login', { email, password })
    ↓
Backend: Find user by email
    ↓
Backend: Compare password with bcrypt
    ↓
Backend: Generate JWT (7 days) + Refresh Token (30 days)
    ↓
Backend: Store refresh token in User document (rotation)
    ↓
Frontend: Store tokens, redirect to dashboard
```

### Token Refresh
```
JWT expires or 401 response
    ↓
Interceptor: POST /auth/refresh with refreshToken
    ↓
Backend: Verify refresh token
    ↓
Backend: Generate new JWT + Refresh Token
    ↓
Frontend: Update stored tokens
    ↓
Retry original request
```

---

## B. Service Booking Flow

### Step 1: View Services
```
Customer navigates to /book
    ↓
Frontend: GET /api/services
    ↓
Backend: Return active services with categories
    ↓
Frontend: Display services in grid
```

### Step 2: Select Service & Date
```
Customer clicks a service
    ↓
Frontend: GET /api/tokens/waiting-time?serviceId=xxx
    ↓
Backend: AI predicts wait time based on:
    - Service duration
    - Current queue length
    - Number of active staff
    ↓
Frontend: Show wait time estimate
    ↓
Customer selects: date, time slot, preferred staff (optional)
```

### Step 3: Confirm & Generate Token
```
Customer clicks "Confirm Booking"
    ↓
Frontend: POST /api/tokens with:
    {
        serviceId,
        date,
        timeSlot,
        staffId (optional),
        notes (optional)
    }
    ↓
Backend: Validate:
    - Service exists and is active
    - No existing booking for same slot
    - Date is valid (not past)
    ↓
Backend: Generate:
    - tokenNumber (e.g., "T-1234")
    - qrToken (UUID)
    - qrCode (image URL)
    - estimatedWaitTime (AI)
    ↓
Backend: Create Token document in MongoDB
    ↓
Backend: Emit queue update via Socket.io
    ↓
Frontend: Navigate to My Tokens page
    ↓
Customer receives:
    - Digital token with QR code
    - Estimated wait time
    - Booking confirmation
```

---

## C. QR Check-In Flow (Admin/Staff)

### Scanning the QR Code
```
Admin navigates to /admin/checkin
    ↓
Frontend: Activate camera via html5-qrcode library
    ↓
Customer presents their digital token QR code
    ↓
QR Scanner decodes: { tokenNumber, qrToken, salon }
    ↓
Frontend: POST /api/tokens/checkin with { qrToken }
    ↓
Authorization: Verify JWT + role (customer/admin/staff)
```

### Backend Processing
```
Backend: Token.findOne({ qrToken })
    ↓
If not found: Return 404 "Invalid QR code"
    ↓
If already arrived: Return 400 "Already checked in"
    ↓
Update Token:
    - arrivalStatus = 'arrived'
    - status = 'arrived'
    - checkedInAt = new Date()
    ↓
Backend: Token.save()
    ↓
Backend: io.to('admin:room').emit('token:checkin', data)
    ↓
Frontend: Update queue display in real-time
    ↓
Show success: Customer name, service, token number
```

---

## D. Token Status Management Flow

### Call Next Customer
```
Staff clicks "Call Next" button
    ↓
Frontend: POST /api/tokens/call-next
    ↓
Backend: Find oldest waiting token:
    Token.findOne({ status: 'waiting' }).sort({ createdAt: 1 })
    ↓
Update Token:
    - status = 'serving'
    - startedAt = new Date()
    - staff = current user (if staff)
    ↓
Backend: Token.save()
    ↓
Backend: Emit queue update
    ↓
Frontend: Show "Now Serving" notification
    ↓
Real-time: All connected clients see updated queue
```

### Complete Service
```
Staff updates token status to "completed"
    ↓
Backend: Update Token:
    - status = 'completed'
    - completedAt = new Date()
    ↓
Backend: Create Payment:
    - token, customer, service
    - amount = service price
    - status = 'completed'
    ↓
Backend: Award Loyalty Points:
    - 1 point per ₹100 spent
    - Update User.loyaltyPoints
    - Update Loyalty account
    - loyalty.updateTier()
    ↓
Backend: Emit queue update
    ↓
Frontend: Customer can now leave review
```

---

## E. Loyalty Points Flow

### Earning Points
```
Service completed → Payment created
    ↓
Backend: Calculate points: Math.floor(price / 100)
    ↓
Backend: Update User: $inc loyaltyPoints
    ↓
Backend: Update Loyalty:
    - totalPoints += points
    - lifetimeEarned += points
    - history.push({ type: 'earned', points })
    - updateTier()
    ↓
Frontend: Show "You earned X points!"
```

### Redeeming Points
```
Customer goes to Loyalty Dashboard
    ↓
Selects "Redeem Points"
    ↓
Frontend: POST /api/loyalty/redeem with { points }
    ↓
Backend: Validate:
    - Points must be multiple of 100
    - Sufficient balance available
    ↓
Backend: Calculate discount:
    - 100 points = ₹50
    - 1 point = ₹0.5
    ↓
Backend: Update Loyalty:
    - totalPoints -= points
    - lifetimeRedeemed += points
    - history.push({ type: 'redeemed' })
    - updateTier()
    ↓
Backend: Sync with User model
    ↓
Frontend: Show "X points redeemed for ₹Y discount"
```

### Tier System
```
Bronze: 0-199 lifetime earned
Silver: 200-499 lifetime earned
Gold: 500-999 lifetime earned
Platinum: 1000+ lifetime earned

Tiers are automatically updated via loyaltySchema.methods.updateTier()
```

---

## F. Review System Flow

### Submit Review
```
Customer's service is completed
    ↓
Customer navigates to /customer/reviews
    ↓
Frontend: POST /api/reviews with:
    {
        tokenId,
        rating (1-5),
        staffRating (optional, 1-5),
        comment
    }
    ↓
Backend: Validate:
    - User is customer
    - Token exists and belongs to user
    - Token status is 'completed'
    - No existing review for this token
    ↓
Backend: Create Review document
    ↓
Backend: Update Service ratings (aggregation):
    - averageRating = $avg of all visible reviews
    - totalReviews = count of visible reviews
    ↓
Frontend: Review appears on service page
```

---

# 8. Real-time Communication

## Socket.io Events

### Server → Client Events

| Event | Room | Payload | Description |
|-------|------|---------|-------------|
| `queue:update` | queue:live, admin:room | Array of tokens | Queue changed |
| `token:checkin` | admin:room | { tokenId, tokenNumber } | Customer checked in |
| `token:called` | queue:live | token data | Token called |
| `notification` | user:{userId} | notification object | Push notification |

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join:queue` | - | Join live queue room |
| `join:admin` | - | Join admin room |
| `join:user` | userId | Join personal notifications |

## Implementation

### Server (`server/config/socket.js`)
```
javascript
const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL }
});

const getIO = () => io;

// Events
io.on('connection', (socket) => {
    socket.on('join:queue', () => socket.join('queue:live'));
    socket.on('join:admin', () => socket.join('admin:room'));
    socket.on('join:user', (userId) => socket.join(`user:${userId}`));
});

module.exports = { io, getIO };
```

### Usage in Controllers
```
javascript
const { getIO } = require('../config/socket');
const io = getIO();

const emitQueueUpdate = async () => {
    const queue = await Token.find({ /* query */ })
        .populate('customer', 'name')
        .populate('service', 'name');
    
    io.to('queue:live').emit('queue:update', queue);
    io.to('admin:room').emit('queue:update', queue);
};
```

---

# 9. Authentication & Authorization

## JWT Strategy

### Access Token (JWT)
```
Payload: { id: user._id }
Secret: JWT_SECRET
Expires: 7 days
Usage: API authentication
```

### Refresh Token
```
Payload: { id: user._id }
Secret: JWT_REFRESH_SECRET
Expires: 30 days
Usage: Token refresh
Storage: MongoDB User.refreshToken
```

## Middleware Flow

### protect Middleware
```
1. Get token from header: "Bearer <token>"
2. If no token → 401 Unauthorized
3. Verify JWT with JWT_SECRET
4. Find user by id
5. If no user → 401 Unauthorized
6. Attach user to req.user
7. Call next()
```

### authorize Middleware
```
1. Check req.user.role
2. If role not in allowedRoles → 403 Forbidden
3. Call next()
```

## Frontend Token Management

### axios Interceptors
```
javascript
// Request: Add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('toqn_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response: Handle 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Try refresh token
            // If fails, redirect to login
        }
    }
);
```

---

# 10. Frontend Structure

## Directory Structure
```
client/src/
├── api/
│   └── axios.js              # Configured axios instance
├── components/
│   ├── Layout.jsx            # Main layout wrapper
│   ├── Navbar.jsx            # Navigation bar
│   ├── ProtectedRoute.jsx    # Route guard
│   └── QRScanner.jsx         # QR code scanner
├── context/
│   ├── AuthContext.jsx       # Authentication state
│   ├── SocketContext.jsx     # WebSocket state
│   └── ThemeContext.jsx      # Dark/light theme
├── hooks/
│   ├── useGeoLocation.js     # Geolocation hook
│   └── useNotification.js    # Push notifications
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── admin/
│   │   ├── Analytics.jsx
│   │   ├── CheckIn.jsx       # QR scanning
│   │   ├── Dashboard.jsx
│   │   ├── QueueControl.jsx
│   │   ├── ServicesMgmt.jsx
│   │   └── StaffMgmt.jsx
│   ├── customer/
│   │   ├── BookService.jsx  # Booking flow
│   │   ├── LiveQueue.jsx
│   │   ├── LoyaltyDashboard.jsx
│   │   ├── MyTokens.jsx
│   │   ├── Reschedule.jsx
│   │   └── Reviews.jsx
│   └── staff/
│.jsx
├──       └── AssignedTokens styles/
│   └── global.css
├── App.jsx
└── main.jsx
```

---

# 11. Key Algorithms

## Wait Time Prediction (`server/utils/waitingTimeAI.js`)

```
javascript
const predictWaitingTime = async (serviceId, staffCount) => {
    // Get service duration
    const service = await Service.findById(serviceId);
    const duration = service.duration;
    
    // Get current queue
    const queueLength = await Token.countDocuments({
        status: { $in: ['waiting', 'serving'] }
    });
    
    // Calculate: (queue * avg service time) / staff count
    const avgServiceTime = 30; // average minutes
    let waitTime = (queueLength * avgServiceTime) / Math.max(staffCount, 1);
    
    // Adjust for service-specific duration
    waitTime = waitTime * (duration / avgServiceTime);
    
    return Math.round(waitTime);
};
```

## Token Number Generation (`server/utils/tokenGenerator.js`)

```
javascript
const generateTokenNumber = async (TokenModel) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count tokens created today
    const count = await TokenModel.countDocuments({
        createdAt: { $gte: today }
    });
    
    // Format: T-{4-digit number}
    const tokenNumber = `T-${String(count + 1).padStart(4, '0')}`;
    
    return tokenNumber;
};
```

## Queue Position Calculation

```
javascript
const getQueuePosition = async (bookingDate, tokenCreatedAt) => {
    const position = await Token.countDocuments({
        date: bookingDate,
        status: { $in: ['waiting', 'serving'] },
        createdAt: { $lt: tokenCreatedAt }
    }) + 1;
    
    return position;
};
```

---

# Summary

This is a full-stack queue management system with:

1. **Three user roles** - Customer, Staff, Admin
2. **Complete booking flow** - Service selection to QR token generation
3. **Real-time updates** - Socket.io for live queue
4. **Loyalty system** - Points, tiers, redemption
5. **Review system** - Service and staff ratings
6. **AI wait time prediction** - Based on queue and staff
7. **QR code check-in** - Contactless customer arrival
8. **JWT authentication** - Secure API access with refresh tokens
9. **Push notifications** - Web Push API support

The system is production-ready with proper security middleware, error handling, and scalability patterns.
