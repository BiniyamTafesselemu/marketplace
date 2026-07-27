const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Review = sequelize.define("Review", {
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
    booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    comment: {
        type: DataTypes.TEXT,
    },
}, { timestamps: true });

module.exports = Review;