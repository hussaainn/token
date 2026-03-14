/**
 * AI-Based Waiting Time Prediction
 * Uses statistical average with staff availability adjustment
 */

const Token = require('../models/Token');
const Service = require('../models/Service');

/**
 * Predict waiting time for a new customer based on:
 * - Current queue length
 * - Average service duration
 * - Staff count
 * - Historical averages
 */
const predictWaitingTime = async (serviceId, staffCount = 1, date = new Date()) => {
    try {
        const service = await Service.findById(serviceId);
        if (!service) return 30; // default fallback

        let safeDate;
        if (typeof date === 'string' && !date.includes('T')) {
            safeDate = new Date(date + 'T00:00:00.000Z');
        } else {
            safeDate = new Date(date);
        }
        safeDate.setHours(0, 0, 0, 0);

        // Count tokens ahead in queue today
        const queueAhead = await Token.countDocuments({
            status: { $in: ['waiting', 'serving'] },
            date: { $gte: safeDate },
        });

        // Historical average service time (from completed tokens)
        const recentCompleted = await Token.find({
            service: serviceId,
            status: 'completed',
            startedAt: { $ne: null },
            completedAt: { $ne: null },
        })
            .sort({ completedAt: -1 })
            .limit(20);

        let avgDuration = service.duration; // default to service estimated duration
        if (recentCompleted.length > 0) {
            const totalDuration = recentCompleted.reduce((acc, t) => {
                const diff = (new Date(t.completedAt) - new Date(t.startedAt)) / 60000;
                return acc + Math.max(diff, 1);
            }, 0);
            avgDuration = totalDuration / recentCompleted.length;
        }

        // Account for concurrent staff
        const effectiveStaff = Math.max(1, staffCount);
        const waitTime = Math.ceil((queueAhead * avgDuration) / effectiveStaff);

        return Math.max(waitTime, 5); // minimum 5 minutes
    } catch (err) {
        console.error('Wait time prediction error:', err);
        return 30;
    }
};

/**
 * Get queue position for a token
 */
const getQueuePosition = async (serviceId, date) => {
    let safeDate;
    if (typeof date === 'string' && !date.includes('T')) {
        safeDate = new Date(date + 'T00:00:00.000Z');
    } else {
        safeDate = new Date(date);
    }

    safeDate.setHours(0, 0, 0, 0);
    const tomorrow = new Date(safeDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const position = await Token.countDocuments({
        service: serviceId,
        date: { $gte: safeDate, $lt: tomorrow },
        status: 'waiting',
    });
    return position + 1;
};

module.exports = { predictWaitingTime, getQueuePosition };
