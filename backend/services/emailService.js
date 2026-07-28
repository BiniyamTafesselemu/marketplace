const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `"ServiceHub" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Email failed:", error.message);
        // Don't throw — email failure shouldn't break the API
    }
};

// Templates
const bookingReceivedEmail = (providerName, bookingId, date) => ({
    subject: "New Booking Received — ServiceHub",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0a1f5c, #1a6ff0); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">🔧 ServiceHub</h1>
            </div>
            <div style="background: #f5f9ff; padding: 30px; border-radius: 0 0 12px 12px;">
                <h2 style="color: #0a1f5c;">New Booking Received!</h2>
                <p style="color: #555;">Hi ${providerName},</p>
                <p style="color: #555;">You have a new booking request (Booking #${bookingId}) for <strong>${new Date(date).toLocaleDateString()}</strong>.</p>
                <a href="${process.env.CLIENT_URL}/dashboard/provider" style="display: inline-block; background: #1a6ff0; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">
                    View & Respond →
                </a>
                <p style="color: #999; font-size: 12px;">ServiceHub — Connecting Ethiopia's service providers with customers.</p>
            </div>
        </div>
    `
});

const bookingStatusEmail = (customerName, status, bookingId, date) => ({
    subject: `Booking ${status === "accepted" ? "Accepted ✅" : "Update"} — ServiceHub`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0a1f5c, #1a6ff0); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">🔧 ServiceHub</h1>
            </div>
            <div style="background: #f5f9ff; padding: 30px; border-radius: 0 0 12px 12px;">
                <h2 style="color: #0a1f5c;">Booking ${status.charAt(0).toUpperCase() + status.slice(1)}!</h2>
                <p style="color: #555;">Hi ${customerName},</p>
                <p style="color: #555;">Your booking #${bookingId} for <strong>${new Date(date).toLocaleDateString()}</strong> has been <strong style="color: ${status === "accepted" ? "#22c55e" : status === "rejected" ? "#ef4444" : "#1a6ff0"}">${status}</strong>.</p>
                ${status === "accepted" ? `<p style="color: #555;">The provider will contact you shortly to confirm the details.</p>` : ""}
                <a href="${process.env.CLIENT_URL}/dashboard/bookings" style="display: inline-block; background: #1a6ff0; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">
                    View Booking →
                </a>
                <p style="color: #999; font-size: 12px;">ServiceHub — Connecting Ethiopia's service providers with customers.</p>
            </div>
        </div>
    `
});

const bookingCompletedEmail = (customerName, bookingId) => ({
    subject: "Service Completed — Leave a Review! ⭐",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0a1f5c, #1a6ff0); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">🔧 ServiceHub</h1>
            </div>
            <div style="background: #f5f9ff; padding: 30px; border-radius: 0 0 12px 12px;">
                <h2 style="color: #0a1f5c;">Service Completed! 🎉</h2>
                <p style="color: #555;">Hi ${customerName},</p>
                <p style="color: #555;">Your booking #${bookingId} has been marked as completed. How was your experience?</p>
                <a href="${process.env.CLIENT_URL}/dashboard/reviews" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">
                    ⭐ Leave a Review
                </a>
                <p style="color: #999; font-size: 12px;">ServiceHub — Connecting Ethiopia's service providers with customers.</p>
            </div>
        </div>
    `
});

module.exports = { sendEmail, bookingReceivedEmail, bookingStatusEmail, bookingCompletedEmail };