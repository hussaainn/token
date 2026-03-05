const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // If email credentials are not fully configured, log to console and return success
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('\n==================================================');
        console.log('                 EMAIL PREVIEW                      ');
        console.log('==================================================');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: \n${options.message}`);
        console.log('==================================================\n');
        console.log('NOTE: Email was NOT actually sent because EMAIL_* environment variables are missing.');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const message = {
            from: `${process.env.FROM_NAME || 'TOQN Admin'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html, // Optional HTML support
        };

        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email: ', error);
        // Log to console rather than crash, so application remains functional
        console.log('\nFailed to send email. Logging content instead:\n');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: \n${options.message}`);

        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
