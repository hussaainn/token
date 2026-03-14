# TOQN - Token Queue Management System
## Second Internal Project Viva Documentation

---

# Table of Contents
1. [Project Title & Objectives](#1-project-title--objectives)
2. [Database Table Structures](#2-database-table-structures)
3. [Normalization Process](#3-normalization-process)
4. [Project Features Summary](#4-project-features-summary)
5. [Screenshots Guide](#5-screenshots-guide)

---

# 1. Project Title & Objectives

## Project Title
**TOQN - Token Queue Management System**

## Project Objectives
The main objectives of developing TOQN are:

1. **Digital Token Generation**: Replace traditional paper-based token systems with digital QR code tokens for efficient queue management.

2. **Real-time Queue Management**: Provide live queue updates using WebSocket technology to eliminate customer wait uncertainty.

3. **AI-Powered Wait Time Prediction**: Implement intelligent wait time estimation based on queue length, service duration, and available staff.

4. **Loyalty Program**: Build a comprehensive loyalty points system with tier-based rewards (Bronze, Silver, Gold, Platinum) to retain customers.

5. **Staff Management**: Enable administrators to manage staff profiles, specializations, and track their performance through assigned tokens and reviews.

6. **Review System**: Allow customers to rate services and staff, helping businesses improve quality and helping future customers make informed decisions.

7. **Multi-channel Notifications**: Implement push notifications, in-app notifications, and email reminders for better customer engagement.

8. **Contactless Check-in**: Use QR code scanning for quick and hygienic customer check-in process.

---

# 2. Database Table Structures

## 2.1 User Collection

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| _id | ObjectId | Yes | Unique identifier (Primary Key) |
| name | String | Yes | User's full name |
| email | String | Yes | User's email address (unique) |
| phone | String | No | Contact phone number |
| password | String | Yes | Hashed password (min 6 characters) |
| role | String | Yes | User role: 'customer', 'staff', or 'admin' |
| avatar | String | No | URL to profile image |
| isActive | Boolean | Yes | Account status (default: true) |
| fcmToken | String | No | Firebase Cloud Messaging token for push notifications |
| webPushSubscription | Object | No | Web Push API subscription object |
| loyaltyPoints | Number | No | Current loyalty points balance |
| specialization | String | No | Staff's area of expertise (for staff role) |
| refreshToken | String | No | JWT refresh token for session maintenance |
| resetPasswordToken | String | No | Token for password reset functionality |
| resetPasswordExpire | Date | No | Expiration time for password reset token |
| createdAt | Date | Yes | Record creation timestamp |
| updatedAt | Date | Yes | Last update timestamp |

---

## 2.2 Token Collection

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| _id | ObjectId | Yes | Unique identifier (Primary Key) |
| tokenNumber | String | Yes | Human-readable token (e.g., "T-0001") - Unique |
| customer | ObjectId | No | Reference to User collection (the customer) |
| isWalkIn | Boolean | No | Flag for walk-in customers without account |
| customerName | String | No | Name of walk-in customer |
| phone | String | No | Contact number |
| service | ObjectId | Yes | Reference to Service collection |
| staff | ObjectId | No | Reference to User collection (assigned staff) |
| date | Date | Yes | Booking/appointment date |
| timeSlot | String | Yes | Booked time slot (e.g., "10:00 AM") |
| status | String | Yes | Token status: 'waiting', 'arrived', 'serving', 'completed', 'cancelled', 'no-show' |
| arrivalStatus | String | No | Customer arrival status: 'pending', 'on-the-way', 'arrived', 'late', 'unknown' |
| qrCode | String | No | Base64 encoded QR code image |
| qrToken | String | No | Unique string for QR code generation |
| position | Number | No | Queue position number |
| estimatedWaitTime | Number | No | AI-calculated estimated wait time in minutes |
| notes | String | No | Special instructions or notes |
| checkedInAt | Date | No | Timestamp when customer checked in |
| startedAt | Date | No | Timestamp when service started |
| completedAt | Date | No | Timestamp when service completed |
| rescheduledFrom | ObjectId | No | Reference to original token if rescheduled |
| notificationsSent | Object | No | Tracks which notifications have been sent |

**Indexes:**
- { customer: 1, date: 1 }
- { status: 1, date: 1 }
- { staff: 1, date: 1 }
- { qrToken: 1 }
- { date: 1, timeSlot: 1, staff: 1 } (unique partial)

---

## 2.3 Service Collection

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| _id | ObjectId | Yes | Unique identifier (Primary Key) |
| name | String | Yes | Service name |
| description | String | No | Detailed service description |
| duration | Number | Yes | Service duration in minutes (min: 5) |
| price | Number | Yes | Service price |
| category | String | Yes | Service category: 'hair', 'skin', 'nail', 'makeup', 'beard', 'waxing', 'threading', 'massage', 'other' |
| isActive | Boolean | Yes | Service availability status |
| imageUrl | String | No | URL to service image |
| averageRating | Number | No | Average rating from reviews (default: 0) |
| totalReviews | Number | No | Total number of reviews (default: 0) |
| createdAt | Date | Yes | Record creation timestamp |
| updatedAt | Date | Yes | Last update timestamp |

**Indexes:**
- { category: 1, isActive: 1 }

---

## 2.4 Loyalty Collection

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| _id | ObjectId | Yes | Unique identifier (Primary Key) |
| customer | ObjectId | Yes | Reference to User collection (unique per customer) |
| totalPoints | Number | No | Current available points balance |
| lifetimeEarned | Number | No | Total points earned throughout lifetime |
| lifetimeRedeemed | Number | No | Total points redeemed throughout lifetime |
| tier | String | No | Current tier: 'bronze', 'silver', 'gold', 'platinum' |
| history | Array | No | Array of point transactions |

**History Sub-document:**
| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| type | String | Yes | Transaction type: 'earned' or 'redeemed' |
| points | Number | Yes | Number of points |
| description | String | No | Description of transaction |
| token | ObjectId | No | Reference to related Token |
| date | Date | Yes | Transaction date |

**Tier Calculation Logic:**
- Bronze: 0-199 lifetime earned
- Silver: 200-499 lifetime earned
- Gold: 500-999 lifetime earned
- Platinum: 1000+ lifetime earned

**Indexes:**
- { customer: 1 } (unique)

---

## 2.5 Payment Collection

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| _id | ObjectId | Yes | Unique identifier (Primary Key) |
| token | ObjectId | Yes | Reference to Token collection |
| customer | ObjectId | Yes | Reference to User collection |
| service | ObjectId | Yes | Reference to Service collection |
| amount | Number | Yes | Original service amount |
| discountApplied | Number | No | Discount from loyalty points redemption |
| finalAmount | Number | Yes | Final amount after discount |
| method | String | No | Payment method: 'cash', 'card', 'upi', 'loyalty' |
| status | String | No | Payment status: 'pending', 'completed', 'refunded' |
| pointsEarned | Number | No | Loyalty points earned from this payment |
| pointsRedeemed | Number | No | Loyalty points redeemed for discount |
| transactionId | String | No | External transaction reference |
| createdAt | Date | Yes | Record creation timestamp |
| updatedAt | Date | Yes | Last update timestamp |

**Indexes:**
- { customer: 1, createdAt: -1 }
- { status: 1 }

---

## 2.6 Review Collection

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| _id | ObjectId | Yes | Unique identifier (Primary Key) |
| token | ObjectId | Yes | Reference to Token collection |
| customer | ObjectId | Yes | Reference to User collection |
| staff | ObjectId | No | Reference to User collection (staff being rated) |
| service | ObjectId | Yes | Reference to Service collection |
| rating | Number | Yes | Overall rating (1-5) |
| staffRating | Number | No | Staff-specific rating (1-5) |
| comment | String | No | Review comment (max 500 characters) |
| isVisible | Boolean | No | Visibility status for public display |
| createdAt | Date | Yes | Record creation timestamp |
| updatedAt | Date | Yes | Last update timestamp |

**Indexes:**
- { service: 1 }
- { staff: 1 }
- { customer: 1 }

---

## 2.7 Notification Collection

| Field Name | Data Type | Required | Description |
|------------|-----------|----------|-------------|
| _id | ObjectId | Yes | Unique identifier (Primary Key) |
| recipient | ObjectId | Yes | Reference to User collection |
| type | String | No | Notification type: 'token_generated', 'two_remaining', 'your_turn', 'completed', 'promotion', 'general', 'appointment_cancelled', 'turn_approaching', 'turn_skipped', 'appointment_confirmed', 'custom' |
| title | String | Yes | Notification title |
| message | String | Yes | Notification message content |
| read | Boolean | No | Read status (default: false) |
| channel | String | No | Delivery channel: 'push', 'in-app', 'both' |
| token | ObjectId | No | Reference to related Token |
| createdAt | Date | Yes | Record creation timestamp |
| updatedAt | Date | Yes | Last update timestamp |

**Indexes:**
- { recipient: 1, read: 1 }
- { createdAt: -1 }

---

# 3. Normalization Process

## 3.1 Overview

Database normalization is the process of organizing data to minimize redundancy and improve data integrity. We analyze our database design against the three normal forms (1NF, 2NF, 3NF).

## 3.2 First Normal Form (1NF)

**Requirement:** Each column contains atomic values, and each column contains values of a single type. Each row must be unique.

**Analysis:**

| Collection | 1NF Compliance | Explanation |
|------------|----------------|-------------|
| User | ✅ Compliant | Each field contains single, atomic values. No repeating groups. |
| Token | ✅ Compliant | All fields are atomic. Status is a single value from enumerated list. |
| Service | ✅ Compliant | Simple atomic fields. Category is a single enumerated value. |
| Loyalty | ✅ Compliant | History array contains sub-documents, but each sub-document has atomic fields. |
| Payment | ✅ Compliant | All fields contain single values. No repeating groups. |
| Review | ✅ Compliant | Each field is atomic. Ratings are single numeric values. |
| Notification | ✅ Compliant | All fields are atomic. Type is from enumerated list. |

**Example - Token Collection:**
- `tokenNumber` = "T-0001" (atomic string)
- `status` = "waiting" (atomic string from enum)
- NOT storing multiple values like `status = "waiting, serving, completed"`

## 3.3 Second Normal Form (2NF)

**Requirement:** Must be in 1NF, and all non-key columns must depend on the entire primary key.

**Analysis:**

| Collection | Primary Key | 2NF Compliance | Explanation |
|------------|-------------|----------------|-------------|
| User | _id | ✅ Compliant | All attributes depend on _id (single-column PK). |
| Token | _id | ✅ Compliant | All attributes depend on _id. Foreign keys (customer, service, staff) are properly referenced. |
| Service | _id | ✅ Compliant | All attributes depend on _id. |
| Loyalty | _id | ✅ Compliant | All attributes depend on _id. The customer field is also unique. |
| Payment | _id | ✅ Compliant | All attributes depend on _id. Foreign keys properly reference related collections. |
| Review | _id | ✅ Compliant | All attributes depend on _id. Foreign keys properly reference related collections. |
| Notification | _id | ✅ Compliant | All attributes depend on _id. Foreign key to User and Token. |

**Key Dependency Analysis:**

**Token Collection:**
- `tokenNumber` depends on `_id` ✓
- `customer` (FK) depends on `_id` ✓
- `service` (FK) depends on `_id` ✓
- `staff` (FK) depends on `_id` ✓
- All attributes depend on the entire primary key

**Loyalty Collection:**
- The `customer` field has a unique constraint, ensuring each customer has only one loyalty record
- This creates a one-to-one relationship properly handled

## 3.4 Third Normal Form (3NF)

**Requirement:** Must be in 2NF, and no transitive dependencies (non-key columns should not depend on other non-key columns).

**Analysis:**

| Collection | 3NF Compliance | Explanation |
|------------|----------------|-------------|
| User | ✅ Compliant | No transitive dependencies. All attributes directly depend on primary key. |
| Token | ✅ Compliant | No transitive dependencies. Status values are stored directly, not derived. |
| Service | ✅ Compliant | No transitive dependencies. averageRating and totalReviews are stored, not calculated on-the-fly (for performance). |
| Loyalty | ✅ Compliant | Tier can be derived from lifetimeEarned, but it's stored for performance. The updateTier() method recalculates when needed. |
| Payment | ✅ Compliant | No transitive dependencies. All amounts are stored directly. |
| Review | ✅ Compliant | No transitive dependencies. Ratings stored directly. |
| Notification | ✅ Compliant | No transitive dependencies. |

**Transitive Dependency Check Example:**

In the **User** collection:
- `_id` → `name` (direct dependency) ✓
- `_id` → `role` (direct dependency) ✓
- `_id` → `loyaltyPoints` (direct dependency) ✓

There is NO transitive dependency like:
- `_id` → `role` → `roleDescription` (this would violate 3NF)

In the **Service** collection:
- `_id` → `averageRating` (stored for performance - acceptable)
- `_id` → `totalReviews` (stored for performance - acceptable)

While `averageRating` could theoretically be calculated from the Review collection, storing it directly in Service improves query performance for listing services. This is a deliberate denormalization for performance, which is acceptable in real-world applications.

## 3.5 Entity-Relationship Summary

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Token    │       │   Service   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ PK: _id     │◄──────│ FK:customer │       │ PK: _id     │
│             │       │ FK:service  │───────►│             │
│ name        │       │ FK:staff    │◄──────│ name        │
│ email       │       │             │       │ price       │
│ role        │       │ status      │       │ duration    │
│ ...         │       │ ...         │       │ ...         │
└─────────────┘       └──────┬──────┘       └─────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Loyalty   │    │   Payment   │    │   Review   │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ PK: _id     │    │ PK: _id     │    │ PK: _id     │
│ FK:customer │    │ FK:token    │    │ FK:token    │
│             │    │ FK:customer │    │ FK:customer │
│ tier        │    │ FK:service  │    │ FK:service  │
│ totalPoints │    │ amount      │    │ rating      │
│ history[]   │    │ status      │    │ comment     │
└─────────────┘    └─────────────┘    └─────────────┘
        │
        ▼
┌─────────────┐
│ Notification│
├─────────────┤
│ PK: _id     │
│ FK:recipient│
│ FK:token    │
│ title       │
│ message     │
│ read        │
└─────────────┘
```

---

# 4. Project Features Summary

## 4.1 Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| User Authentication | JWT-based registration/login with role-based access | ✅ Implemented |
| Digital Token Generation | QR code based tokens for queue management | ✅ Implemented |
| Real-time Queue Updates | Socket.io for live queue updates | ✅ Implemented |
| AI Wait Time Prediction | Algorithm to predict wait times | ✅ Implemented |
| Service Booking | Online service booking with date/time selection | ✅ Implemented |
| QR Check-in | Contactless customer arrival confirmation | ✅ Implemented |
| Loyalty Points System | Points earning and redemption with tiers | ✅ Implemented |
| Staff Management | Admin can manage staff profiles and assignments | ✅ Implemented |
| Service Management | CRUD operations for services | ✅ Implemented |
| Review System | Customer reviews for services and staff | ✅ Implemented |
| Push Notifications | Web Push API for notifications | ✅ Implemented |
| Analytics Dashboard | Admin dashboard with statistics | ✅ Implemented |

## 4.2 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Real-time | Socket.io |
| Authentication | JWT (Access + Refresh tokens) |
| QR Code | qrcode library |
| Styling | CSS (custom) |

## 4.3 User Roles

| Role | Capabilities |
|------|--------------|
| Customer | Book services, view queue, manage loyalty, submit reviews |
| Staff | View assigned tokens, update token status |
| Admin | Full system access, manage staff, services, analytics |

---

# 5. Screenshots Guide

## 5.1 Recommended Screenshots for Presentation

Prepare the following screenshots from your working project:

### Authentication Pages
1. **Login Page** - Show the login form with role selection
2. **Registration Page** - Show the customer registration form

### Customer Features
3. **Service Booking Page** - Show available services with categories
4. **Token Confirmation** - Show generated token with QR code
5. **My Tokens Page** - Show list of booked/rescheduled tokens
6. **Live Queue Page** - Show real-time queue position
7. **Loyalty Dashboard** - Show points balance and tier
8. **Reviews Page** - Show submitted reviews

### Admin Features
9. **Admin Dashboard** - Show statistics (total tokens, customers, revenue)
10. **Queue Control** - Show live queue with status management
11. **QR Check-in** - Show QR scanner interface
12. **Staff Management** - Show staff list with specializations
13. **Service Management** - Show service CRUD interface
14. **Analytics Page** - Show charts and analytics

### Staff Features
15. **Assigned Tokens** - Show tokens assigned to staff member

---

# 6. Running the Project

## Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

## Installation Steps

### Backend
```bash
cd token/server
npm install
# Configure .env file with MongoDB URI and JWT secrets
npm start
```

### Frontend
```bash
cd token/client
npm install
npm run dev
```

## Environment Variables Required
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/toqn
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
```

---

# 7. Project Structure

```
token/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── api/              # API configuration
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React Context (Auth, Socket, Theme)
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/           # Page components
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── auth/         # Auth pages
│   │   │   ├── customer/     # Customer pages
│   │   │   └── staff/        # Staff pages
│   │   └── styles/           # CSS styles
│   └── package.json
├── server/                    # Node.js Backend
│   ├── config/               # Database & Socket config
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Auth & Error handling
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions
│   └── package.json
└── docs/                      # Documentation
```

---

# Checklist for Viva

- [ ] At least 75% implementation complete
- [ ] Project runs without errors
- [ ] Database tables documented with field descriptions
- [ ] Normalization explained (1NF, 2NF, 3NF)
- [ ] Presentation slides prepared with:
  - [ ] Project title and objectives
  - [ ] Working project screenshots
  - [ ] Database table structures
  - [ ] Normalization explanation
- [ ] Source code ready in system

---

**Document Generated for Second Internal Project Viva**
**Project: TOQN - Token Queue Management System**
**Date: March 2026**

