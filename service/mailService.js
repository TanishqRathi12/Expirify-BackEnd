const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendExpiryNotification = async (email, productId, productName, expiryDate) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `🚨 Reminder: Your product "${productName}" is expiring soon!`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <table style="width: 100%; max-width: 600px; margin: auto; border-collapse: collapse; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <thead>
                        <tr style="background-color: #ff6b6b; color: #fff;">
                            <th style="padding: 20px; text-align: center;">⏳ Expiry Alert!</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 20px;">
                                <h3 style="color: #ff6b6b; text-align: center;">Heads up! Your product is expiring soon</h3>
                                <p>Dear User,</p>
                                <p>We noticed that your product <strong>"${productName}"</strong> is expiring on <strong>${expiryDate}</strong>. Please let us know whether you have consumed it:</p>
                                <div style="text-align: center; margin-top: 20px;">
                                    <a href="https://expirify-backend.onrender.com/products/${productId}/eaten" 
                                        style="display: inline-block; margin: 10px; padding: 15px 30px; background-color: #28a745; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                        ✅ Consumed
                                    </a>
                                    <a href="https://expirify-backend.onrender.com/products/${productId}/not-eaten" 
                                        style="display: inline-block; margin: 10px; padding: 15px 30px; background-color: #dc3545; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                        ❌ Still Available
                                    </a>
                                </div>
                                <p style="font-size: 0.9em; margin-top: 20px;">If you do not respond, we will continue to send reminders to ensure you don't miss anything important. You can always manage your notifications in your account settings.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: #f9f9f9; padding: 20px; text-align: center;">
                                <p style="font-size: 0.85em; color: #777;">Thank you for using our service! If you have any questions, feel free to <a href="${process.env.CONTACT}/contact" style="color: #007bff; text-decoration: none;">contact us</a>.</p>
                                <p style="font-size: 0.85em; color: #777;">Best regards,<br><strong>The Expirify Team</strong></p>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p style="text-align: center; font-size: 0.75em; color: #aaa; margin-top: 20px;">This is an automated message. Please do not reply to this email.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}: ${info.response}`);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error.message);
        throw error;
    }
};

module.exports = { sendExpiryNotification };
