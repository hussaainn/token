# Database Schema Quick Reference
## TOQN - Token Queue Management System

---

## Collections Overview

| # | Collection Name | Primary Key | Purpose |
|---|-----------------|-------------|---------|
| 1 | users | _id | Store user accounts (customer, staff, admin) |
| 2 | tokens | _id | Store queue tokens and bookings |
| 3 | services | _id | Store available services |
| 4 | loyalties | _id | Store customer loyalty points and tiers |
| 5 | payments | _id | Store payment transactions |
| 6 | reviews | _id | Store customer reviews |
| 7 | notifications | _id | Store user notifications |

---

## Field Reference (All Collections)

### users
| Field | Type | Description |
|-------|------|-------------|
| name | String | User's full name |
| email | String | Email (unique) |
| phone | String | Phone number |
| password | String | Hashed password |
| role | String | 'customer' \| 'staff' \| 'admin' |
| avatar | String | Profile image URL |
| isActive | Boolean | Account status |
| loyaltyPoints | Number | Current loyalty points |
| specialization | String | Staff's expertise |

### tokens
| Field | Type | Description |
|-------|------|-------------|
| tokenNumber | String | Unique token (e.g., "T-0001") |
| customer | ObjectId | FK to User |
| service | ObjectId | FK to Service |
| staff | ObjectId | FK to User (assigned staff) |
| date | Date | Booking date |
| timeSlot | String | Time slot (e.g., "10:00 AM") |
| status | String | 'waiting'\|'arrived'\|'serving'\|'completed'\|'cancelled'\|'no-show' |
| qrCode | String | Base64 QR image |
| qrToken | String | Unique QR string |
| position | Number | Queue position |
| estimatedWaitTime | Number | AI-predicted wait time |

### services
| Field | Type | Description |
|-------|------|-------------|
| name | String | Service name |
| description | String | Service details |
| duration | Number | Minutes |
| price | Number | Service price |
| category | String | 'hair'\|'skin'\|'nail'\|'makeup'... |
| isActive | Boolean | Availability |
| averageRating | Number | Avg review rating |
| totalReviews | Number | Review count |

### loyalties
| Field | Type | Description |
|-------|------|-------------|
| customer | ObjectId | FK to User (unique) |
| totalPoints | Number | Current points |
| lifetimeEarned | Number | Total earned |
| lifetimeRedeemed | Number | Total redeemed |
| tier | String | 'bronze'\|'silver'\|'gold'\|'platinum' |
| history | Array | Point transactions |

### payments
| Field | Type | Description |
|-------|------|-------------|
| token | ObjectId | FK to Token |
| customer | ObjectId | FK to User |
| service | ObjectId | FK to Service |
| amount | Number | Original price |
| discountApplied | Number | Loyalty discount |
| finalAmount | Number | Final price |
| method | String | 'cash'\|'card'\|'upi'\|'loyalty' |
| status | String | 'pending'\|'completed'\|'refunded' |
| pointsEarned | Number | Points earned |

### reviews
| Field | Type | Description |
|-------|------|-------------|
| token | ObjectId | FK to Token |
| customer | ObjectId | FK to User |
| staff | ObjectId | FK to User |
| service | ObjectId | FK to Service |
| rating | Number | 1-5 rating |
| staffRating | Number | 1-5 |
| comment | String | Review text |
| isVisible | Boolean | Public visibility |

### notifications
| Field | Type | Description |
|-------|------|-------------|
| recipient | ObjectId | FK to User |
| type | String | Notification type |
| title | String | Title |
| message | String | Message |
| read | Boolean | Read status |
| channel | String | 'push'\|'in-app'\|'both' |
| token | ObjectId | FK to Token |

---

## Normalization Summary

### 1NF ✓
- All fields contain atomic values
- No repeating groups
- Each row unique

### 2NF ✓
- In 1NF
- All non-key fields depend on entire primary key
- No partial dependencies (single column PKs)

### 3NF ✓
- In 2NF
- No transitive dependencies
- All fields directly depend on primary key

---

## Relationships

```
User (1) ──< (N) Token
User (1) ──< (N) Loyalty
User (1) ──< (N) Payment
User (1) ──< (N) Review
User (1) ──< (N) Notification

Service (1) ──< (N) Token
Service (1) ──< (N) Payment
Service (1) ──< (N) Review

Token (1) ──< (N) Payment
Token (1) ──< (N) Review
Token (1) ──< (N) Notification
```

