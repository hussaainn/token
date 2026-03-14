const getBookingConfirmationEmail = ({
    customerName,
    tokenNumber,
    serviceName,
    staffName,
    date,
    timeSlot,
    qrCodeDataUrl,
    frontendUrl
}) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
            body { margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { text-align: center; margin-bottom: 30px; }
            .salon-name { font-size: 28px; font-weight: 800; color: #f43f8f; margin: 0; letter-spacing: -0.5px; }
            .greeting { font-size: 18px; color: #333333; margin-top: 20px; margin-bottom: 20px; text-align: center; }
            .token-box { background-color: #fff0f6; border: 2px dashed #f43f8f; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px; }
            .token-label { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0; font-weight: 600; }
            .token-number { font-size: 36px; font-weight: 800; color: #f43f8f; margin: 0; letter-spacing: 2px; }
            .qr-container { text-align: center; margin-bottom: 30px; }
            .qr-image { max-width: 200px; height: auto; border-radius: 8px; margin-bottom: 10px; border: 1px solid #eee; padding: 10px; }
            .qr-caption { font-size: 14px; color: #666666; margin: 0; font-weight: 500; }
            .details-box { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #f43f8f; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .detail-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
            .detail-label { color: #666666; font-size: 14px; font-weight: 500; }
            .detail-value { color: #333333; font-size: 15px; font-weight: 600; text-align: right; }
            .action-link { text-align: center; margin-bottom: 30px; }
            .action-link a { color: #f43f8f; text-decoration: none; font-weight: 600; font-size: 14px; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; color: #888888; font-size: 12px; }
            .footer-highlight { color: #f43f8f; font-weight: 700; font-size: 14px; margin-bottom: 10px; }
            .address { margin: 5px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="salon-name">Mercy Salon</h1>
            </div>
            
            <p class="greeting">Hi ${customerName}, your booking is confirmed! ✨</p>
            
            <div class="token-box">
                <p class="token-label">Your Token Number</p>
                <p class="token-number">${tokenNumber}</p>
            </div>
            
            <div class="qr-container">
                <img src="${qrCodeDataUrl}" alt="QR Code" width="180" height="180" style="display:block; margin:0 auto;" />
                <p class="qr-caption">Show this at the salon</p>
            </div>
            
            <div class="details-box">
                <div class="detail-row">
                    <span class="detail-label">Service</span>
                    <span class="detail-value">${serviceName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Staff</span>
                    <span class="detail-value">${staffName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">${date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time Slot</span>
                    <span class="detail-value">${timeSlot}</span>
                </div>
            </div>
            
            <div class="action-link">
                Need to reschedule or cancel?<br>
                <a href="${frontendUrl}/my-appointments">Manage your appointment online</a>
            </div>
            
            <div class="footer">
                <p class="footer-highlight">Please arrive 5 minutes before your appointment.</p>
                <p class="address">123 Mercy Lane, Bengaluru</p>
                <p class="address">+91 98765 43210</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const getPostServiceEmail = ({
    customerName,
    serviceName,
    staffName,
    pointsEarned,
    totalPoints,
    currentTier,
    feedbackUrl
}) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You & Feedback</title>
        <style>
            body { margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { text-align: center; margin-bottom: 30px; }
            .salon-name { font-size: 28px; font-weight: 800; color: #f43f8f; margin: 0; letter-spacing: -0.5px; }
            .greeting { font-size: 18px; color: #333333; margin-top: 20px; margin-bottom: 20px; text-align: center; }
            .details-box { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #f43f8f; }
            .loyalty-box { background-color: #fff0f6; border-radius: 8px; padding: 20px; margin-bottom: 30px; border: 1px dashed #f43f8f; text-align: center; }
            .btn { display: inline-block; background-color: #f43f8f; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-align: center; margin: 20px auto; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; color: #888888; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="salon-name">Mercy Salon</h1>
            </div>
            
            <p class="greeting">Hi ${customerName}, thank you for visiting us! ✨</p>
            
            <div class="details-box">
                <p style="margin: 0; color: #333;">We hope you loved your <strong>${serviceName}</strong> with <strong>${staffName}</strong>.</p>
            </div>
            
            <div class="loyalty-box">
                <h3 style="color: #f43f8f; margin-top: 0;">🎉 You earned ${pointsEarned} loyalty points!</h3>
                <p style="margin-bottom: 0; color: #666;">Your total balance is now <strong>${totalPoints} points</strong> (${currentTier.toUpperCase()} tier).</p>
                <p style="font-size: 12px; color: #888; margin-top: 10px;">Redeem 100 points for a ₹50 discount on your next visit!</p>
            </div>
            
            <div style="text-align: center;">
                <p style="color: #333; font-weight: 600;">How did we do? Tell us about your experience!</p>
                <p style="color: #ffb400; font-size: 24px; letter-spacing: 4px;">★★★★★</p>
                <a href="${feedbackUrl}" class="btn">Submit Your Feedback</a>
            </div>
            
            <div class="footer">
                <p>123 Mercy Lane, Bengaluru</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const getInvoiceEmail = ({
    customerName,
    tokenNumber,
    date,
    timeSlot,
    serviceName,
    basePrice,
    addOns = [],
    totalAmount,
    paymentMethod,
    staffName
}) => {
    let addonsHtml = '';
    if (addOns && addOns.length > 0) {
        addonsHtml = addOns.map(addon => `
            <div class="detail-row">
                <span class="detail-label">+ ${addon.service?.name || 'Add-on'}</span>
                <span class="detail-value">₹${addon.price}</span>
            </div>
        `).join('');
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice from Mercy Salon</title>
        <style>
            body { margin: 0; padding: 0; background-color: #f6f9fc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { text-align: center; margin-bottom: 30px; }
            .salon-name { font-size: 28px; font-weight: 800; color: #f43f8f; margin: 0; letter-spacing: -0.5px; }
            .inv-number { color: #666; font-size: 14px; margin-top: 5px; }
            .greeting { font-size: 18px; color: #333333; margin-top: 20px; margin-bottom: 30px; text-align: center; }
            .details-box { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #f43f8f; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #eee; padding-bottom: 8px; }
            .detail-row.total { border-top: 2px solid #eee; border-bottom: none; padding-top: 15px; margin-top: 15px; }
            .detail-label { color: #666666; font-size: 14px; font-weight: 500; }
            .detail-value { color: #333333; font-size: 15px; font-weight: 600; text-align: right; }
            .total .detail-value { color: #f43f8f; font-size: 18px; font-weight: 800; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; color: #888888; font-size: 12px; }
            .address { margin: 5px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="salon-name">Mercy Salon</h1>
                <p class="inv-number">Invoice: INV-${tokenNumber}</p>
            </div>
            
            <p class="greeting">Hi ${customerName}, here is the receipt for your visit today.</p>
            
            <div class="details-box">
                <div class="detail-row">
                    <span class="detail-label">Date & Time</span>
                    <span class="detail-value">${date} at ${timeSlot}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Professional</span>
                    <span class="detail-value">${staffName}</span>
                </div>
                <div class="detail-row" style="margin-top: 20px;">
                    <span class="detail-label">Base Service: ${serviceName}</span>
                    <span class="detail-value">₹${basePrice}</span>
                </div>
                ${addonsHtml}
                <div class="detail-row total">
                    <span class="detail-label">Total Amount Paid (${paymentMethod.toUpperCase()})</span>
                    <span class="detail-value">₹${totalAmount}</span>
                </div>
            </div>
            
            <div class="footer">
                <p style="color:#f43f8f; font-weight:bold; font-size:14px; margin-bottom:10px;">Thank you for visiting Mercy Salon!</p>
                <p class="address">123 Mercy Lane, Bengaluru</p>
                <p class="address">+91 98765 43210</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { getBookingConfirmationEmail, getPostServiceEmail, getInvoiceEmail };
