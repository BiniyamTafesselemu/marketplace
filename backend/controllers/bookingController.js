const { Booking } = require("../models");
const { ProviderProfile } = require("../models");

async function getAllBookings(req, res) {
    try {
        const bookings = await Booking.findAll({ where: { customer_id: req.user.id } });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings" });
    }
}

async function getBookingById(req, res) {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.customer_id !== req.user.id) return res.status(403).json({ message: "Not authorized" });
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: "Error fetching booking" });
    }
}

async function createBooking(req, res) {
    try {
        const { provider_id, date } = req.body;
        const newBooking = await Booking.create({
            customer_id: req.user.id,
            provider_id,
            date,
            status: "pending"
        });
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: "Error creating booking" });
    }
}

async function updateBooking(req, res) {
    try {
        const { id } = req.params;
        const { date, status } = req.body;
        const booking = await Booking.findByPk(id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.customer_id !== req.user.id) return res.status(403).json({ message: "Not authorized" });
        if (date) booking.date = date;
        if (status) booking.status = status;
        await booking.save();
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: "Error updating booking" });
    }
}

async function deleteBooking(req, res) {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.customer_id !== req.user.id) return res.status(403).json({ message: "Not authorized" });
        await booking.destroy();
        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting booking" });
    }
}

// Provider — get all bookings for their profile
async function getProviderBookings(req, res) {
    try {
        const profile = await ProviderProfile.findOne({ where: { user_id: req.user.id } });
        if (!profile) return res.status(404).json({ message: "Provider profile not found" });

        const bookings = await Booking.findAll({
            where: { provider_id: profile.id },
            order: [["createdAt", "DESC"]]
        });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching provider bookings" });
    }
}

// Provider — accept or reject a booking
async function updateBookingStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const profile = await ProviderProfile.findOne({ where: { user_id: req.user.id } });
        if (!profile) return res.status(404).json({ message: "Provider profile not found" });

        const booking = await Booking.findByPk(id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.provider_id !== profile.id) return res.status(403).json({ message: "Not authorized" });

        const allowed = ["accepted", "rejected", "completed", "cancelled"];
        if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

        booking.status = status;
        await booking.save();
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: "Error updating booking status" });
    }
}

module.exports = {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    getProviderBookings,
    updateBookingStatus
};