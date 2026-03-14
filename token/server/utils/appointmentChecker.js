const cron = require('node-cron');
const Token = require('../models/Token');
const User = require('../models/User');
const sendEmail = require('./sendEmail');
const { getIO } = require('../config/socket');

const parseTimeSlot = (timeSlot) => {
    // e.g. "10:30 AM" -> Date object for today
    const [time, modifier] = timeSlot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now;
};

const checkMissedAppointments = async () => {
    try {
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find all waiting tokens from today whose time slot has passed by 15+ minutes
        const tokens = await Token.find({
            status: 'waiting',
            arrivalStatus: { $ne: 'arrived' },
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        })
            .populate('customer', 'name email')
            .populate('service', 'name');

        for (const token of tokens) {
            if (!token.timeSlot) continue;

            const slotTime = parseTimeSlot(token.timeSlot);
            const minutesPassed = (now - slotTime) / 1000 / 60;

            // If slot was 15+ minutes ago and customer hasn't arrived
            if (minutesPassed >= 15) {
                // Mark as no-show
                token.status = 'no-show';
                await token.save();

                // Emit queue update
                try {
                    const io = getIO();
                    io.to('admin:room').emit('token:noshow', {
                        tokenId: token._id,
                        tokenNumber: token.tokenNumber,
                        customerName: token.customer?.name || token.customerName
                    });
                } catch (_) { }

                // Send missed appointment email
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                const rescheduleUrl = `${frontendUrl}/customer/reschedule?token=${token._id}`;
                const cancelUrl = `${frontendUrl}/customer/tokens`;

                const customerEmail = token.customer?.email;
                const customerName = token.customer?.name || token.customerName || 'Customer';

                if (customerEmail) {
                    const html = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', sans-serif; background: #fdf2f8; margin: 0; padding: 20px; }
                .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                .header { background: linear-gradient(135deg, #f43f8f, #ec4899); padding: 2rem; text-align: center; }
                .header h1 { color: #fff; margin: 0; font-size: 1.5rem; }
                .body { padding: 2rem; }
                .info-box { background: #fdf2f8; border-left: 4px solid #f43f8f; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
                .btn { display: inline-block; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 700; margin: 0.5rem; }
                .btn-primary { background: #f43f8f; color: #fff; }
                .btn-secondary { background: #f3f4f6; color: #374151; }
                .footer { background: #f9f0f5; padding: 1rem; text-align: center; font-size: 0.8rem; color: #9ca3af; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>💅 Mercy Salon</h1>
                  <p style="color:#fce7f3;margin:0.5rem 0 0">We missed you today!</p>
                </div>
                <div class="body">
                  <p>Hi <strong>${customerName}</strong>,</p>
                  <p>We noticed you didn't make it to your appointment today. No worries — life happens! 💕</p>
                  <div class="info-box">
                    <strong>📋 Appointment Details</strong><br/>
                    <span>Service: ${token.service?.name || 'Your service'}</span><br/>
                    <span>Token: ${token.tokenNumber}</span><br/>
                    <span>Time Slot: ${token.timeSlot}</span>
                  </div>
                  <p>Would you like to reschedule or cancel your appointment?</p>
                  <div style="text-align:center;margin:1.5rem 0">
                    <a href="${rescheduleUrl}" class="btn btn-primary">📅 Reschedule Appointment</a>
                    <a href="${cancelUrl}" class="btn btn-secondary">✕ Cancel</a>
                  </div>
                  <p style="font-size:0.85rem;color:#9ca3af">
                    If you think this is a mistake, please contact us directly. We'd love to see you soon! 💖
                  </p>
                </div>
                <div class="footer">Mercy Salon • Your beauty, our passion</div>
              </div>
            </body>
            </html>
          `;

                    sendEmail({
                        email: customerEmail,
                        subject: `We missed you! Your appointment at Mercy Salon — Token ${token.tokenNumber}`,
                        html
                    }).catch(err => console.error('Missed appointment email error:', err));
                }

                console.log(`⏰ Auto no-show: Token ${token.tokenNumber} — ${customerName}`);
            }
        }
    } catch (err) {
        console.error('Appointment checker error:', err);
    }
};

// Run every 5 minutes
const startAppointmentChecker = () => {
    cron.schedule('*/5 * * * *', checkMissedAppointments);
    console.log('⏰ Appointment checker running every 5 minutes');
};

module.exports = { startAppointmentChecker };
