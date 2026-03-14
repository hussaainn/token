const Token = require('../models/Token');
const Service = require('../models/Service');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Loyalty = require('../models/Loyalty');
const { generateQRToken, generateQRCode } = require('../utils/qrCode');
const QRCode = require('qrcode');
const { generateTokenNumber } = require('../utils/tokenGenerator');
const { predictWaitingTime, getQueuePosition } = require('../utils/waitingTimeAI');
const { sendNotification } = require('../utils/pushNotification');
const sendEmail = require('../utils/sendEmail');
const { getBookingConfirmationEmail } = require('../utils/emailTemplates');
const { getIO } = require('../config/socket');

// Emit queue update to all connected clients
const emitQueueUpdate = async () => {
    try {
        const io = getIO();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const queue = await Token.find({
            status: { $in: ['waiting', 'serving'] },
            date: { $gte: today },
        })
            .sort({ createdAt: 1 })
            .limit(10)
            .populate('customer', 'name')
            .populate('service', 'name duration price')
            .populate('staff', 'name');
        io.to('queue:live').emit('queue:update', queue);
        io.to('admin:room').emit('queue:update', queue);
    } catch (_) { }
};

// @desc   Book a token
// @route  POST /api/tokens
// @access Private (customer)
exports.bookToken = async (req, res, next) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ success: false, message: 'Only customers can book tokens' });
        }

        const { serviceId, date, timeSlot, staffId, notes } = req.body;

        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({
                success: false,
                message: `Invalid serviceId format: ${serviceId}. Must be a valid MongoDB ObjectId.`
            });
        }

        if (!serviceId || !date || !timeSlot) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        let tokenDate;
        if (date.includes('/')) {
            // Handle MM/DD/YYYY format
            const parts = date.split('/');
            if (parts.length === 3) {
                // Convert to YYYY-MM-DD
                const normalized = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                tokenDate = new Date(normalized + 'T00:00:00.000Z');
            }
        } else {
            // Handle YYYY-MM-DD format
            tokenDate = new Date(date + 'T00:00:00.000Z');
        }

        const today = new Date(); today.setHours(0, 0, 0, 0);

        if (isNaN(tokenDate.getTime()) || tokenDate < today) {
            return res.status(400).json({ success: false, message: 'Invalid booking date. Please use YYYY-MM-DD' });
        }

        const service = await Service.findById(serviceId);
        if (!service || !service.isActive) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const existing = await Token.findOne({
            customer: req.user._id,
            date: tokenDate,
            timeSlot,
            status: { $in: ['waiting', 'serving'] }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'You already have booking for this slot' });
        }

        const tokenNumber = await generateTokenNumber(Token);
        const qrToken = generateQRToken();

        const staffCount = await User.countDocuments({ role: 'staff', isActive: true });
        const waitTime = await predictWaitingTime(serviceId, staffCount, tokenDate);
        const qrCode = await generateQRCode({ tokenNumber, qrToken });

        // Calculate Loyalty Discount
        const userDocL = await User.findById(req.user._id).select('loyaltyPoints loyaltyTier');
        const discountMap = { bronze: 0, silver: 10, gold: 20, platinum: 30 };
        const discountPercent = discountMap[userDocL?.loyaltyTier || 'bronze'] || 0;
        const discountedPrice = service.price - (service.price * discountPercent / 100);

        const token = await Token.create({
            tokenNumber,
            customer: req.user._id,
            service: serviceId,
            staff: staffId || null,
            date: tokenDate,
            timeSlot,
            notes,
            qrToken,
            qrCode,
            estimatedWaitTime: waitTime,
            status: 'waiting',
            arrivalStatus: 'unknown',
            totalAmount: discountedPrice // apply discount to base creation cost
        });

        emitQueueUpdate();

        // Trigger booking confirmation email securely
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const userDoc = await User.findById(req.user._id);
            const staffDoc = staffId ? await User.findById(staffId) : null;
            const qrCodeBase64 = await QRCode.toDataURL(token.qrToken || token.tokenNumber);

            if (userDoc && userDoc.email) {
                const emailHtml = getBookingConfirmationEmail({
                    customerName: userDoc.name,
                    tokenNumber: token.tokenNumber,
                    serviceName: service.name,
                    staffName: staffDoc ? staffDoc.name : 'No Preference',
                    date: tokenDate.toDateString(),
                    timeSlot: timeSlot,
                    qrCodeDataUrl: qrCodeBase64,
                    frontendUrl: frontendUrl
                });

                sendEmail({
                    email: userDoc.email,
                    subject: `Booking Confirmed: Token ${token.tokenNumber} - Mercy Salon`,
                    html: emailHtml
                }).catch(err => console.error('Email error:', err));
            }
        } catch (emailErr) {
            console.error('Non-critical: Failed to send booking confirmation email:', emailErr);
        }

        res.status(201).json({ success: true, token });

    } catch (err) {
        // Catch duplicate key error from compound index (date, timeSlot, staff)
        if (err.code === 11000 && err.keyPattern && err.keyPattern.timeSlot && err.keyPattern.staff) {
            return res.status(400).json({ success: false, message: 'This slot was just booked by someone else. Please select another.' });
        }
        next(err);
    }
};

// @desc   Get available slots
// @route  GET /api/tokens/available-slots
// @access Public
exports.getAvailableSlots = async (req, res, next) => {
    try {
        const { date, staffId } = req.query;

        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }

        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);

        const timeSlots = [
            '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
            '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
            '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
        ];

        let availableSlots = [...timeSlots];

        // Filter out past slots
        const today = new Date();
        const isToday = bookingDate.toDateString() === today.toDateString();

        if (isToday) {
            const currentHour = today.getHours();
            const currentMinute = today.getMinutes();

            availableSlots = availableSlots.filter(slot => {
                const [time, modifier] = slot.split(' ');
                let [hours, minutes] = time.split(':').map(Number);

                if (modifier === 'PM' && hours < 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;

                if (hours > currentHour) return true;
                if (hours === currentHour && minutes > currentMinute) return true;
                return false;
            });
        }

        // Filter out already booked slots for the staff member
        if (staffId) {
            const bookedTokens = await Token.find({
                date: bookingDate,
                staff: staffId,
                status: { $nin: ['cancelled', 'no-show'] }
            });

            const bookedSlots = bookedTokens.map(t => t.timeSlot);
            availableSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));
        }

        res.json({ success: true, availableSlots });

    } catch (err) {
        next(err);
    }
};

// @desc   Get live queue (next 5 tokens)
// @route  GET /api/tokens/queue
// @access Public
exports.getLiveQueue = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const queue = await Token.find({
            status: { $in: ['waiting', 'serving'] },
            date: { $gte: today },
        })
            .sort({ createdAt: 1 })
            .limit(10)
            .populate('customer', 'name')
            .populate('service', 'name duration price')
            .populate('staff', 'name');

        res.json({ success: true, count: queue.length, queue });
    } catch (err) {
        next(err);
    }
};

// @desc   Get my tokens
// @route  GET /api/tokens/my
// @access Private (customer)
exports.getMyTokens = async (req, res, next) => {
    console.log('getMyTokens called, req.user:', req.user);
    try {
        if (!req.user?._id) {
            return res.status(400).json({ success: false, message: 'User not authenticated' });
        }

        const { status, page = 1, limit = 10 } = req.query;
        const filter = {
            customer: req.user._id,
            service: { $type: 'objectId' }
        };
        if (status) filter.status = status;

        const tokens = await Token.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('service', 'name price duration category')
            .populate('staff', 'name');

        const tokensWithPosition = await Promise.all(tokens.map(async (t) => {
            if (['waiting', 'serving'].includes(t.status)) {
                const position = await getQueuePosition(t.service._id, t.date);
                return { ...t.toObject(), position };
            }
            return t.toObject();
        }));

        const total = await Token.countDocuments(filter);
        res.json({ success: true, total, page: Number(page), tokens: tokensWithPosition });
    } catch (err) {
        next(err);
    }
};

// @desc   Get single token
// @route  GET /api/tokens/:id
// @access Private
exports.getToken = async (req, res, next) => {
    try {
        const token = await Token.findById(req.params.id)
            .populate('service', 'name price duration')
            .populate('staff', 'name')
            .populate('customer', 'name email phone');

        if (!token) {
            return res.status(404).json({ success: false, message: 'Token not found' });
        }

        const isOwner = token.customer._id.toString() === req.user._id.toString();
        const isStaff = token.staff && token.staff._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isStaff && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const position = await getQueuePosition(token.service._id, token.date);

        res.json({
            success: true,
            token: { ...token.toObject(), position }
        });

    } catch (err) { next(err); }
};

// @desc   Update token status (staff/admin)
// @route  PATCH /api/tokens/:id/status
// @access Private (staff, admin)
exports.updateTokenStatus = async (req, res, next) => {
    try {

        if (!['admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { status, paymentMethod, amount } = req.body;
        const valid = ['waiting', 'arrived', 'serving', 'completed', 'cancelled', 'no-show'];

        if (!valid.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const token = await Token.findById(req.params.id)
            .populate('service customer')
            .populate('addOnServices.service');

        if (!token) {
            return res.status(404).json({ success: false, message: 'Token not found' });
        }

        if (token.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Already completed' });
        }

        const oldStatus = token.status;
        token.status = status;

        if (status === 'serving') {
            token.startedAt = token.startedAt || new Date();
        }

        if (status === 'completed' && !token.completedAt) {

            token.completedAt = new Date();

            const service = token.service;
            let price = amount !== undefined ? Number(amount) : (service?.price || 0);
            let finalMethod = paymentMethod || 'cash';

            const existingPayment = await Payment.findOne({ token: token._id });
            if (!existingPayment) {
                const paymentData = {
                    token: token._id,
                    amount: price,
                    finalAmount: price,
                    method: finalMethod,
                    status: 'completed',
                    service: service._id,
                    ...(token.customer ? { customer: token.customer._id } : { customerName: token.customerName, phone: token.phone })
                };
                await Payment.create(paymentData);
            } else {
                existingPayment.method = finalMethod;
                existingPayment.finalAmount = price;
                existingPayment.status = 'completed';
                await existingPayment.save();
            }

            let points = 0;
            let totalPointsInfo = 0;
            let currentTierInfo = 'bronze';

            if (token.customer && token.customer._id) {
                points = Math.floor(price / 100);
                if (points > 0) {

                    await User.findByIdAndUpdate(
                        token.customer._id,
                        { $inc: { loyaltyPoints: points } }
                    );

                    const loyalty = await Loyalty.findOne({ customer: token.customer._id });
                    if (loyalty) {
                        loyalty.totalPoints += points;
                        loyalty.lifetimeEarned += points;
                        loyalty.history.push({
                            type: 'earned',
                            points,
                            token: token._id
                        });
                        loyalty.updateTier();
                        await loyalty.save();

                        totalPointsInfo = loyalty.totalPoints;
                        currentTierInfo = loyalty.tier || 'bronze';
                    }
                }

                // Fix 4 & 5: Notifications & Emails (Fire and forget)
                try {
                    sendNotification({
                        user: token.customer._id,
                        title: 'Service Completed',
                        message: `🎉 You earned ${points} loyalty points for your ${service.name} visit! Your total is now ${totalPointsInfo} points.`,
                        type: 'general',
                        link: '/customer/loyalty'
                    }).catch(err => console.error('Notification Error:', err));
                } catch (e) { console.error('Notification trigger error:', e); }

                try {
                    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                    const userDoc = await User.findById(token.customer._id);
                    const staffDoc = token.staff ? await User.findById(token.staff) : null;

                    if (userDoc && userDoc.email) {
                        const { getPostServiceEmail, getInvoiceEmail } = require('../utils/emailTemplates');
                        const emailHtml = getPostServiceEmail({
                            customerName: token.isWalkIn ? token.customerName : userDoc.name,
                            serviceName: service.name,
                            staffName: staffDoc ? staffDoc.name : 'No Preference',
                            pointsEarned: points,
                            totalPoints: totalPointsInfo,
                            currentTier: currentTierInfo,
                            feedbackUrl: `${frontendUrl}/feedback/${token._id}`
                        });

                        sendEmail({
                            email: userDoc.email,
                            subject: `Thank you for visiting Mercy Salon!`,
                            html: emailHtml
                        }).catch(err => console.error('Email error:', err));

                        // Send E-Bill Invoice Email
                        const invoiceHtml = getInvoiceEmail({
                            customerName: token.isWalkIn ? token.customerName : userDoc.name,
                            tokenNumber: token.tokenNumber,
                            date: new Date(token.date).toDateString(),
                            timeSlot: token.timeSlot,
                            serviceName: service.name,
                            basePrice: service.price || 0,
                            addOns: token.addOnServices || [],
                            totalAmount: price,
                            paymentMethod: finalMethod,
                            staffName: staffDoc ? staffDoc.name : 'Any Available'
                        });

                        sendEmail({
                            email: userDoc.email,
                            subject: `Invoice for your visit - Mercy Salon (Token ${token.tokenNumber})`,
                            html: invoiceHtml
                        }).catch(err => console.error('Invoice Email error:', err));
                    }
                } catch (e) { console.error('Post-service email error:', e); }
            }
        }

        await token.save();

        emitQueueUpdate();

        res.json({ success: true, token });

    } catch (err) { next(err); }
};

// @desc   Cancel token
// @route  PATCH /api/tokens/:id/cancel
// @access Private (customer / admin)
exports.cancelToken = async (req, res, next) => {
    try {
        const token = await Token.findById(req.params.id);
        if (!token) return res.status(404).json({ success: false, message: 'Token not found' });

        if (req.user.role === 'customer' && token.customer.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: 'Access denied' });

        if (['completed', 'cancelled'].includes(token.status))
            return res.status(400).json({ success: false, message: 'Cannot cancel this token' });
        if (!['admin', 'customer'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        token.status = 'cancelled';
        await token.save();

        emitQueueUpdate();
        res.json({ success: true, message: 'Token cancelled', token });
    } catch (err) {
        next(err);
    }
};

// @desc   Reschedule token
// @route  PATCH /api/tokens/:id/reschedule
// @access Private (customer)
exports.rescheduleToken = async (req, res, next) => {
    try {
        const { date, timeSlot } = req.body;
        const token = await Token.findById(req.params.id);
        if (!token) return res.status(404).json({ success: false, message: 'Token not found' });

        if (token.customer.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: 'Access denied' });

        if (!['waiting'].includes(token.status))
            return res.status(400).json({ success: false, message: 'Only waiting tokens can be rescheduled' });

        // Check for conflict
        const conflict = await Token.findOne({
            customer: req.user._id, date: new Date(date), timeSlot,
            status: { $in: ['waiting', 'serving'] }, _id: { $ne: token._id }
        });

        if (conflict) return res.status(400).json({ success: false, message: 'Slot already booked' });

        token.rescheduledFrom = token._id;
        token.date = new Date(date);
        token.timeSlot = timeSlot;
        await token.save();

        emitQueueUpdate();
        res.json({ success: true, message: 'Token rescheduled', token });
    } catch (err) {
        next(err);
    }
};

// @desc   Update arrival status
// @route  PATCH /api/tokens/:id/arrival
// @access Private (customer)
exports.updateArrivalStatus = async (req, res, next) => {
    try {
        const token = await Token.findById(req.params.id)
            .populate('customer', 'name')
            .populate('service', 'name');

        if (!token) return res.status(404).json({ success: false, message: 'Token not found' });

        if (token.customer && token.customer._id.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: 'Access denied' });

        token.arrivalStatus = 'arrived';
        token.status = 'arrived';
        token.checkedInAt = new Date();
        await token.save();

        // Emit to admin and staff rooms
        try {
            const io = getIO();

            // Rich notification to admin dashboard
            io.to('admin:room').emit('token:customerArrived', {
                tokenId: token._id,
                tokenNumber: token.tokenNumber,
                customerName: token.customer?.name || token.customerName || 'Walk-in',
                serviceName: token.service?.name || 'Service',
                timeSlot: token.timeSlot,
                arrivedAt: new Date(),
                via: req.body.distance ? 'geo' : 'manual',
                distance: req.body.distance || null,
                message: `${token.customer?.name || token.customerName} has arrived and is waiting in queue`
            });

            // Also update the live queue
            io.to('queue:live').emit('queue:update');

        } catch (_) { }

        emitQueueUpdate();
        res.json({ success: true, arrivalStatus: 'arrived', token });
    } catch (err) { next(err); }
};

// @desc   QR check-in
// @route  POST /api/tokens/checkin
// @access Private (customer)
exports.qrCheckIn = async (req, res, next) => {
    try {
        const { qrToken } = req.body;
        const token = await Token.findOne({ qrToken })
            .populate('customer', 'name email phone avatar loyaltyPoints')
            .populate('service', 'name duration price');
        if (!token) return res.status(404).json({ success: false, message: 'Invalid QR code' });

        if (token.arrivalStatus === 'arrived')
            return res.status(400).json({ success: false, message: 'Already checked in' });

        token.arrivalStatus = 'arrived';
        token.status = 'arrived'; // Move from 'waiting' to 'arrived' for the queue
        token.checkedInAt = new Date();
        await token.save();

        try {
            const io = getIO();
            io.to('admin:room').emit('token:checkin', { tokenId: token._id, tokenNumber: token.tokenNumber });
        } catch (_) { }

        res.json({ success: true, message: 'Check-in successful!', token });
    } catch (err) {
        next(err);
    }
};

// @desc   Get waiting time
// @route  GET /api/tokens/waiting-time
// @access Public
exports.getWaitingTime = async (req, res, next) => {
    try {
        const { serviceId } = req.query;
        const staffCount = await User.countDocuments({ role: 'staff', isActive: true });
        const waitTime = await predictWaitingTime(serviceId, staffCount);
        res.json({ success: true, estimatedMinutes: waitTime });
    } catch (err) {
        next(err);
    }
};

// @desc   Call next customer (admin/staff)
// @route  POST /api/tokens/call-next
// @access Private (admin, staff)
exports.callNext = async (req, res, next) => {
    try {

        if (!['admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const today = new Date(); today.setHours(0, 0, 0, 0);

        const nextToken = await Token.findOne({
            status: 'waiting',
            date: { $gte: today }
        }).sort({ createdAt: 1 });

        if (!nextToken) {
            return res.status(404).json({ success: false, message: 'No customers waiting' });
        }

        nextToken.status = 'serving';
        nextToken.startedAt = new Date();

        if (req.user.role === 'staff' && !nextToken.staff) {
            nextToken.staff = req.user._id;
        }

        await nextToken.save();

        emitQueueUpdate();

        res.json({ success: true, token: nextToken });

    } catch (err) { next(err); }
};
// @desc   Get all tokens (admin)
// @route  GET /api/tokens
// @access Private (admin, staff)
exports.getAllTokens = async (req, res, next) => {
    try {
        const { status, date, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (date) {
            const d = new Date(date); d.setHours(0, 0, 0, 0);
            const next = new Date(d); next.setDate(next.getDate() + 1);
            filter.date = { $gte: d, $lt: next };
        }

        const tokens = await Token.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('customer', 'name phone')
            .populate('service', 'name price duration')
            .populate('staff', 'name');

        const total = await Token.countDocuments(filter);
        res.json({ success: true, total, page: Number(page), tokens });
    } catch (err) {
        next(err);
    }
};

// @desc   Get tokens assigned to logged-in staff
// @route  GET /api/tokens/my-assigned
// @access Private (staff)
exports.getMyAssignedTokens = async (req, res, next) => {
    try {
        if (req.user.role !== 'staff') {
            return res.status(403).json({ success: false, message: 'Only staff can access this route' });
        }

        const { status, date, type } = req.query;
        let filter = {};

        if (type === 'available') {
            filter.staff = null; // Unassigned
            filter.status = { $in: ['waiting', 'arrived'] }; // Waiting for assignment
        } else {
            filter.staff = req.user._id;
            if (status) {
                if (status === 'active') {
                    filter.status = { $in: ['waiting', 'arrived', 'serving'] };
                } else {
                    filter.status = status;
                }
            }
        }

        let targetDate = new Date();
        if (date) {
            targetDate = new Date(date);
        }
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        filter.date = { $gte: targetDate, $lt: nextDay };

        const tokens = await Token.find(filter)
            .sort({ status: -1, timeSlot: 1, createdAt: 1 })
            .populate('customer', 'name phone')
            .populate('service', 'name price duration'); // CRITICAL FIX: Added 'price'

        res.json({ success: true, tokens });
    } catch (err) {
        next(err);
    }
};

// @desc   Add a walk-in token
// @route  POST /api/tokens/walkin
// @access Private (admin, staff)
exports.addWalkInToken = async (req, res, next) => {
    try {
        if (!['admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { customerName, phone, serviceId, staffId, date, timeSlot } = req.body;
        console.log('Walk-in request body:', req.body);
        console.log('Raw date from body:', date);

        if (!customerName || !serviceId || !date || !timeSlot) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        let tokenDate;
        if (date.includes('/')) {
            // Handle MM/DD/YYYY format
            const parts = date.split('/');
            if (parts.length === 3) {
                // Convert to YYYY-MM-DD
                const normalized = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                tokenDate = new Date(normalized + 'T00:00:00.000Z');
            }
        } else {
            // Handle YYYY-MM-DD format
            console.log('Date string used for parsing:', date + 'T00:00:00.000Z');
            tokenDate = new Date(date + 'T00:00:00.000Z');
        }

        const today = new Date(); today.setHours(0, 0, 0, 0);

        console.log('Parsed tokenDate:', tokenDate);
        console.log('Today for comparison:', today);
        console.log('Is date NaN?', isNaN(tokenDate.getTime()));
        console.log('Is tokenDate < today?', tokenDate < today);

        if (isNaN(tokenDate.getTime()) || tokenDate < today) {
            return res.status(400).json({ success: false, message: 'Invalid date format. Please use YYYY-MM-DD or date is in the past' });
        }

        // Check staff availability for this slot
        const existingTokens = await Token.find({
            date: tokenDate,
            timeSlot: timeSlot,
            status: { $in: ['waiting', 'arrived', 'serving'] }
        });

        if (staffId) {
            const hasConflict = existingTokens.some(t => t.staff && t.staff.toString() === staffId);
            if (hasConflict) {
                return res.status(400).json({ success: false, message: 'Staff member is already booked for this slot' });
            }
        }

        const service = await Service.findById(serviceId);
        if (!service || !service.isActive) {
            return res.status(404).json({ success: false, message: 'Service not found or inactive' });
        }

        // Generate token number
        const dateStr = tokenDate.toISOString().split('T')[0].replace(/-/g, '');
        const countToday = await Token.countDocuments({
            date: {
                $gte: tokenDate,
                $lt: new Date(tokenDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });
        const tokenNumber = `WALK-${dateStr}-${(countToday + 1).toString().padStart(3, '0')}`;

        const position = await getQueuePosition(serviceId, tokenDate);
        const qrToken = generateQRToken();
        const qrCodeDataUrl = await generateQRCode(qrToken);

        const token = await Token.create({
            tokenNumber,
            isWalkIn: true,
            customerName,
            phone: phone || '',
            service: serviceId,
            staff: staffId || null,
            date: tokenDate,
            timeSlot,
            status: 'waiting',
            position,
            qrToken,
            qrCode: qrCodeDataUrl,
            estimatedWaitTime: await predictWaitingTime(serviceId, 1, tokenDate)
        });

        const tokenData = await Token.findById(token._id)
            .populate('service', 'name price duration')
            .populate('staff', 'name');

        emitQueueUpdate();

        // Trigger booking confirmation email securely if phone matches an existing user with an email
        try {
            if (phone) {
                const existingUser = await User.findOne({ phone: phone });
                if (existingUser && existingUser.email) {
                    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                    const qrCodeBase64 = await QRCode.toDataURL(tokenData.qrToken || tokenData.tokenNumber);
                    const emailHtml = getBookingConfirmationEmail({
                        customerName: customerName,
                        tokenNumber: tokenNumber,
                        serviceName: service.name,
                        staffName: tokenData.staff ? tokenData.staff.name : 'No Preference',
                        date: tokenDate.toDateString(),
                        timeSlot: timeSlot,
                        qrCodeDataUrl: qrCodeBase64,
                        frontendUrl: frontendUrl
                    });

                    sendEmail({
                        email: existingUser.email,
                        subject: `Walk-in Booking Confirmed: Token ${tokenNumber} - Mercy Salon`,
                        html: emailHtml
                    }).catch(err => console.error('Email error:', err));
                }
            }
        } catch (emailErr) {
            console.error('Non-critical: Failed to send walk-in booking confirmation email:', emailErr);
        }

        res.status(201).json({ success: true, token: tokenData });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'This slot was just booked by someone else. Please select another slot.' });
        }
        next(err);
    }
};

// @desc   Add an add-on service to an active token
// @route  POST /api/tokens/:id/addons
// @access Private
exports.addAddOnService = async (req, res, next) => {
    try {
        const { serviceId } = req.body;
        if (!serviceId) {
            return res.status(400).json({ success: false, message: 'Service ID is required' });
        }

        const token = await Token.findById(req.params.id).populate('service');
        if (!token) {
            return res.status(404).json({ success: false, message: 'Token not found' });
        }

        if (!['waiting', 'arrived', 'serving'].includes(token.status)) {
            return res.status(400).json({ success: false, message: 'Cannot add services to this token at its current status' });
        }

        const addonService = await Service.findById(serviceId);
        if (!addonService || !addonService.isActive) {
            return res.status(404).json({ success: false, message: 'Add-on service not found or inactive' });
        }

        token.addOnServices.push({
            service: addonService._id,
            price: addonService.price,
            addedBy: req.user._id
        });

        // Recalculate total amount
        const basePrice = token.service?.price || 0;
        const addonsTotal = token.addOnServices.reduce((sum, item) => sum + (item.price || 0), 0);
        token.totalAmount = basePrice + addonsTotal;

        await token.save();

        const updatedToken = await Token.findById(token._id)
            .populate('service', 'name price duration')
            .populate('staff', 'name')
            .populate('customer', 'name phone')
            .populate('addOnServices.service', 'name price');

        emitQueueUpdate();

        res.status(200).json({ success: true, token: updatedToken });
    } catch (err) {
        next(err);
    }
};

// @desc   Accept unassigned token (staff)
// @route  PATCH /api/tokens/:id/accept
// @access Private (staff, admin)
exports.acceptToken = async (req, res, next) => {
    try {
        const token = await Token.findById(req.params.id);
        if (!token) return res.status(404).json({ success: false, message: 'Token not found' });

        if (token.staff) {
            return res.status(400).json({ success: false, message: 'Token already assigned to another staff member' });
        }

        token.staff = req.user._id;
        await token.save();

        emitQueueUpdate();
        res.json({ success: true, message: 'Token accepted successfully', token });
    } catch (err) { next(err); }
};
