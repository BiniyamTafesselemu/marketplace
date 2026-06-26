const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Booking = sequelize.define("Booking", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    provider_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("pending", "accepted", "completed", "cancelled"),
        defaultValue: "pending",
    },
}, { timestamps: true });

module.exports = Booking;