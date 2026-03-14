const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Service = require('./models/Service');
const Loyalty = require('./models/Loyalty');
const Token = require('./models/Token');
const Payment = require('./models/Payment');
const Review = require('./models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/toqn_db';

const services = [
<<<<<<< HEAD
    { name: 'Women Haircut & Styling', description: 'Professional haircut and styling for women', duration: 45, price: 600, category: 'hair', isActive: true },
    { name: 'Hair Spa Treatment', description: 'Deep cleansing and rejuvenation hair spa', duration: 60, price: 1200, category: 'hair', isActive: true },
    { name: 'Premium Facial', description: 'Deep cleansing and rejuvenation facial', duration: 60, price: 1500, category: 'skin', isActive: true },
    { name: 'Basic Facial', description: 'Quick cleansing facial', duration: 30, price: 700, category: 'skin', isActive: true },
    { name: 'Manicure', description: 'Complete nail care for hands', duration: 40, price: 500, category: 'nail', isActive: true },
    { name: 'Pedicure', description: 'Complete nail care for feet', duration: 50, price: 600, category: 'nail', isActive: true },
    { name: 'Full Body Waxing', description: 'Professional full body waxing', duration: 120, price: 2800, category: 'waxing', isActive: true },
    { name: 'Leg Waxing', description: 'Leg waxing', duration: 40, price: 700, category: 'waxing', isActive: true },
    { name: 'Eyebrow Threading', description: 'Eyebrow threading', duration: 15, price: 150, category: 'threading', isActive: true },
    { name: 'Head Massage', description: 'Relaxing head massage', duration: 20, price: 300, category: 'massage', isActive: true },
=======
    { name: 'Haircut & Style (Men)', description: 'Professional haircut and styling for men', duration: 30, price: 250, category: 'hair', isActive: true },
    { name: 'Haircut & Style (Women)', description: 'Professional haircut and styling for women', duration: 45, price: 500, category: 'hair', isActive: true },
    { name: 'Premium Facial', description: 'Deep cleansing and rejuvenation facial', duration: 60, price: 1200, category: 'skin', isActive: true },
    { name: 'Basic Facial', description: 'Quick cleansing facial', duration: 30, price: 600, category: 'skin', isActive: true },
    { name: 'Manicure', description: 'Complete nail care for hands', duration: 40, price: 400, category: 'nail', isActive: true },
    { name: 'Pedicure', description: 'Complete nail care for feet', duration: 50, price: 500, category: 'nail', isActive: true },
    { name: 'Full Body Waxing', description: 'Professional full body waxing', duration: 120, price: 2500, category: 'waxing', isActive: true },
    { name: 'Leg Waxing', description: 'Leg waxing', duration: 40, price: 600, category: 'waxing', isActive: true },
    { name: 'Threading (Brows)', description: 'Eyebrow threading', duration: 15, price: 100, category: 'threading', isActive: true },
    { name: 'Massage (Head)', description: 'Relaxing head massage', duration: 20, price: 200, category: 'massage', isActive: true },
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
];

const seed = async () => {
    try {
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected.');

        await User.deleteMany({});
        await Service.deleteMany({});
        await Loyalty.deleteMany({});
        await Token.deleteMany({});
        await Payment.deleteMany({});
        await Review.deleteMany({});
        console.log('✅ Collections cleared.');

        const hashedPassword = await bcrypt.hash('password123', 12);
        console.log('✅ Test hash generated.');

        // 1. Create Users
        const users = [
<<<<<<< HEAD
            { name: 'Mercy Admin', email: 'admin@mercysalon.com', password: hashedPassword, role: 'admin' },
            { name: 'Priya Sharma', email: 'priya@mercysalon.com', password: hashedPassword, role: 'staff', specialization: 'Hair Specialist' },
            { name: 'Anita Nair', email: 'anita@mercysalon.com', password: hashedPassword, role: 'staff', specialization: 'Skin & Facial Expert' },
            { name: 'Deepika Rao', email: 'deepika@mercysalon.com', password: hashedPassword, role: 'staff', specialization: 'Nail Artist' },
            { name: 'Aishwarya Menon', email: 'aishwarya@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Neha Kapoor', email: 'neha@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Pooja Verma', email: 'pooja@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Sneha Iyer', email: 'sneha@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Riya Sharma', email: 'riya@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Kavya Reddy', email: 'kavya@example.com', password: hashedPassword, role: 'customer' },
=======
            { name: 'Admin User', email: 'admin@mercysalon.com', password: hashedPassword, role: 'admin' },
            { name: 'Priya Staff', email: 'priya@mercysalon.com', password: hashedPassword, role: 'staff', specialization: 'Hair Specialist' },
            { name: 'Arjun Staff', email: 'arjun@mercysalon.com', password: hashedPassword, role: 'staff', specialization: 'Skin & Facial' },
            { name: 'Deepa Staff', email: 'deepa@mercysalon.com', password: hashedPassword, role: 'staff', specialization: 'Nail Artist' },
            { name: 'Ramesh Customer', email: 'ramesh@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Suresh Customer', email: 'suresh@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Anjali Customer', email: 'anjali@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Vikram Customer', email: 'vikram@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Meena Customer', email: 'meena@example.com', password: hashedPassword, role: 'customer' },
            { name: 'Karthik Customer', email: 'karthik@example.com', password: hashedPassword, role: 'customer' },
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
        ];

        const createdUsers = await User.insertMany(users);
        console.log(`✅ ${createdUsers.length} users created.`);

        const staffUsers = createdUsers.filter(u => u.role === 'staff');
        const customerUsers = createdUsers.filter(u => u.role === 'customer');

        // 2. Create Services
        const createdServices = await Service.insertMany(services);
        console.log(`✅ ${createdServices.length} services created.`);

        // 3. Create Loyalty Records
        const loyaltyRecords = customerUsers.map(c => ({
            customer: c._id,
            totalPoints: Math.floor(Math.random() * 500),
            lifetimeEarned: Math.floor(Math.random() * 2000),
            tier: 'silver'
        }));
        await Loyalty.insertMany(loyaltyRecords);
        console.log('✅ Loyalty records created.');

        // 4. Create Historical Tokens & Payments (Past 2 days)
        console.log('Creating historical data...');
        for (let i = 0; i < 2; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (i + 1));
            date.setHours(0, 0, 0, 0);

            for (let j = 0; j < 5; j++) {
                const customer = customerUsers[Math.floor(Math.random() * customerUsers.length)];
                const service = createdServices[Math.floor(Math.random() * createdServices.length)];
                const staff = staffUsers[Math.floor(Math.random() * staffUsers.length)];

<<<<<<< HEAD
                const historicalSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'];
=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
                const token = await Token.create({
                    tokenNumber: `T-${date.getTime()}-${j}`,
                    customer: customer._id,
                    service: service._id,
                    staff: staff._id,
                    date: date,
<<<<<<< HEAD
                    timeSlot: historicalSlots[j],
=======
                    timeSlot: '11:00 AM',
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
                    status: 'completed',
                    completedAt: new Date(date.getTime() + 3600000)
                });

                await Payment.create({
                    token: token._id,
                    customer: customer._id,
                    service: service._id,
                    amount: service.price,
                    finalAmount: service.price,
                    status: 'completed',
                    method: 'cash'
                });

                if (Math.random() > 0.5) {
                    await Review.create({
                        token: token._id,
                        customer: customer._id,
                        staff: staff._id,
                        service: service._id,
                        rating: 4 + Math.floor(Math.random() * 2),
                        comment: 'Great service!'
                    });
                }
            }
        }

        // 5. Create Tokens for Today
        console.log('Creating tokens for today...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayTokens = [
            { status: 'completed', slot: '10:00 AM' },
            { status: 'serving', slot: '11:00 AM' },
            { status: 'waiting', slot: '12:00 PM' },
            { status: 'waiting', slot: '01:00 PM' },
            { status: 'waiting', slot: '02:00 PM' },
        ];

        for (let i = 0; i < todayTokens.length; i++) {
            const customer = customerUsers[i % customerUsers.length];
            const service = createdServices[i % createdServices.length];
            const staff = staffUsers[i % staffUsers.length];
            const t = todayTokens[i];

            await Token.create({
                tokenNumber: `T-TODAY-${i}`,
                customer: customer._id,
                service: service._id,
                staff: t.status === 'waiting' ? null : staff._id,
                date: today,
                timeSlot: t.slot,
                status: t.status,
                position: i + 1,
                qrToken: `qr-today-${i}`
            });
        }

<<<<<<< HEAD
        console.log('\n🎉 SEEDING COMPLETE (Ladies Salon)');
        console.log('Admin: admin@mercysalon.com / password123');
        console.log('Staff: priya@mercysalon.com / password123');
        console.log('Customer: aishwarya@example.com / password123');
=======
        console.log('\n🎉 ENHANCED SEEDING COMPLETE!');
        console.log('Admin: admin@mercysalon.com / password123');
        console.log('Staff: priya@mercysalon.com / password123');
        console.log('Customer: ramesh@example.com / password123');
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f

        process.exit(0);
    } catch (err) {
        console.error('❌ SEEDING FAILED:');
        console.error(JSON.stringify(err, null, 2));
        if (err.errors) console.error('VALIDATION ERRORS:', err.errors);
        process.exit(1);
    }
};

seed();
