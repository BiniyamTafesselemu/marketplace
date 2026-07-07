const booking = require('../models/Booking')

async function getAllBookings(req, res) {
    try {
        const bookings = await booking.findAll({ where: { customer_id: req.user.id } });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings" });
    }
}

async function getBookingById(req, res) {
    try {
        const { id } = req.params;
        const bookingFound = await booking.findByPk(id);

        if (!bookingFound) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (bookingFound.customer_id !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.status(200).json(bookingFound);
    } catch (error) {
        res.status(500).json({ message: "Error fetching booking" });
    }
}

async function createBooking(req, res) {
    try {
        const { provider_id, date, status } = req.body;
        const newBooking = await booking.create({ customer_id: req.user.id, provider_id, date, status });
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ message: "Error creating booking" });
    }
}

async function updateBooking(req, res) {
    try {
        const { id } = req.params;
        const { date, status } = req.body;
        const bookingToUpdate = await booking.findByPk(id);

        if (!bookingToUpdate) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (bookingToUpdate.customer_id !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        bookingToUpdate.date = date || bookingToUpdate.date;
        bookingToUpdate.status = status || bookingToUpdate.status;

        await bookingToUpdate.save();
        res.status(200).json(bookingToUpdate);
    } catch (error) {
        res.status(500).json({ message: "Error updating booking" });
    }
}

async function deleteBooking(req, res) {
    try {
        const { id } = req.params;
        const bookingToDelete = await booking.findByPk(id);

        if (!bookingToDelete) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (bookingToDelete.customer_id !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await bookingToDelete.destroy();
        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting booking" });
    }
}

module.exports = { getAllBookings, getBookingById, createBooking, updateBooking, deleteBooking };