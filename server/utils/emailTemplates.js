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

module.exports = { getBookingConfirmationEmail };
