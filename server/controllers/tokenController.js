const Token = require('../models/Token');
const Service = require('../models/Service');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Loyalty = require('../models/Loyalty');
const { generateQRToken, generateQRCode } = require('../utils/qrCode');
const { generateTokenNumber } = require('../utils/tokenGenerator');
const { predictWaitingTime, getQueuePosition } = require('../utils/waitingTimeAI');
const { sendNotification } = require('../utils/pushNotification');
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
            .populate('service', 'name duration')
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

        if (!serviceId || !date || !timeSlot) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const bookingDate = new Date(date);
        const today = new Date(); today.setHours(0, 0, 0, 0);

        if (isNaN(bookingDate) || bookingDate < today) {
            return res.status(400).json({ success: false, message: 'Invalid booking date' });
        }

        const service = await Service.findById(serviceId);
        if (!service || !service.isActive) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const existing = await Token.findOne({
            customer: req.user._id,
            date: bookingDate,
            timeSlot,
            status: { $in: ['waiting', 'serving'] }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'You already have booking for this slot' });
        }

        const tokenNumber = await generateTokenNumber(Token);
        const qrToken = generateQRToken();

        const staffCount = await User.countDocuments({ role: 'staff', isActive: true });
        const waitTime = await predictWaitingTime(serviceId, staffCount);
        const qrCode = await generateQRCode({ tokenNumber, qrToken });

        const token = await Token.create({
            tokenNumber,
            customer: req.user._id,
            service: serviceId,
            staff: staffId || null,
            date: bookingDate,
            timeSlot,
            notes,
            qrToken,
            qrCode,
            estimatedWaitTime: waitTime,
            status: 'waiting',
            arrivalStatus: 'unknown'
        });

        emitQueueUpdate();

        res.status(201).json({ success: true, token });

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
            .populate('service', 'name duration')
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
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const filter = { customer: req.user._id };
        if (status) filter.status = status;

        const tokens = await Token.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('service', 'name price duration category')
            .populate('staff', 'name');

        const tokensWithPosition = await Promise.all(tokens.map(async (t) => {
            if (['waiting', 'serving'].includes(t.status)) {
                const position = await getQueuePosition(t.date, t.createdAt);
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

        const position = await getQueuePosition(token.date, token.createdAt);

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

        const { status } = req.body;
        const valid = ['waiting', 'serving', 'completed', 'cancelled', 'no-show'];

        if (!valid.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const token = await Token.findById(req.params.id)
            .populate('service customer');

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

            const existingPayment = await Payment.findOne({ token: token._id });
            if (!existingPayment) {

                const service = token.service;
                const price = service?.price || 0;

                await Payment.create({
                    token: token._id,
                    customer: token.customer._id,
                    service: service._id,
                    amount: price,
                    finalAmount: price,
                    status: 'completed'
                });

                const points = Math.floor(price / 100);
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
                    }
                }
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
