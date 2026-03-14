# TOQN - Presentation Slides Summary
## Second Internal Project Viva

---

## Slide 1: Project Title & Objectives

### TOQN - Token Queue Management System

**Objectives:**
1. Digital token generation with QR codes
2. Real-time queue management using WebSockets
3. AI-powered wait time prediction
4. Loyalty points system with tiers
5. Staff and service management
6. Review system
7. Push notifications

---

## Slide 2: Technology Stack

| Frontend | Backend | Database |
|----------|---------|----------|
| React 18 | Node.js | MongoDB |
| Vite | Express.js | Mongoose |
| Socket.io-client | Socket.io | |
| React Router | JWT Auth | |

---

## Slide 3: Database Tables (7 Collections)

1. **users** - User accounts (customer, staff, admin)
2. **tokens** - Queue tokens and bookings
3. **services** - Available services
4. **loyalties** - Customer loyalty points
5. **payments** - Payment transactions
6. **reviews** - Customer reviews
7. **notifications** - User notifications

---

## Slide 4: Normalization Process

### 1NF (First Normal Form) ✓
- All fields contain atomic values
- No repeating groups
- Example: `status = "waiting"` (not "waiting,serving")

### 2NF (Second Normal Form) ✓
- In 1NF
- All non-key fields depend on entire primary key
- No partial dependencies (all PKs are single _id)

### 3NF (Third Normal Form) ✓
- In 2NF
- No transitive dependencies
- Example: `loyaltyPoints` directly depends on `_id`, not on other fields

---

## Slide 5: Key Features

- JWT Authentication with Role-based Access
- QR Code Token Generation
- Real-time Queue Updates (Socket.io)
- AI Wait Time Prediction
- Loyalty Points & Tiers (Bronze→Platinum)
- Service Booking System
- QR Code Check-in
- Review & Rating System
- Push Notifications

---

## Slide 6: User Roles

| Role | Features |
|------|----------|
| Customer | Book services, view queue, loyalty, reviews |
| Staff | View assigned tokens, update status |
| Admin | Full access, manage staff/services/analytics |

---

## Slide 7: Sample Screenshots to Show

1. Login/Register Page
2. Service Booking with QR Code
3. Admin Dashboard with Stats
4. Live Queue Control
5. QR Scanner for Check-in
6. Loyalty Dashboard
7. Reviews Page
8. Analytics Charts

---

## Key Points to Mention

1. **Project is 100% implemented** - All features working
2. **7 MongoDB collections** with proper relationships
3. **Normalization** - Explained 1NF, 2NF, 3NF compliance
4. **Real-time** - Socket.io for live updates
5. **AI** - Wait time prediction algorithm
6. **Security** - JWT tokens with refresh mechanism

---

## Examiner可能问的问题:

1. **Q: Explain your database design**
   - A: 7 collections (users, tokens, services, loyalties, payments, reviews, notifications) with proper foreign key relationships

2. **Q: What is normalization? Explain your design**
   - A: 1NF - atomic values, 2NF - full key dependency, 3NF - no transitive dependencies

3. **Q: How does real-time updates work?**
   - A: Socket.io with rooms (queue:live, admin:room, user:{id})

4. **Q: How does wait time prediction work?**
   - A: Algorithm uses queue length × average service time ÷ staff count, adjusted for specific service duration

5. **Q: How does loyalty system work?**
   - A: Points earned = floor(price/100), Tiers: Bronze(0-199), Silver(200-499), Gold(500-999), Platinum(1000+)

6. **Q: How does QR check-in work?**
   - A: QR contains unique qrToken, scanner decodes and validates, updates arrivalStatus

---

## Quick Commands to Run

```bash
# Backend
cd token/server
npm start

# Frontend
cd token/client
npm run dev
```

**MongoDB URI**: Configure in `token/server/.env`

