const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProviderService = sequelize.define("ProviderService", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    provider_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    service: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    trade_license: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    skill_certificate: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    payment_method: {
        type: DataTypes.ENUM("Telebirr", "CBE Birr", "Amole", "HelloCash", "Cash", "Bank Transfer"),
        allowNull: false,
    },
    payment_account: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, { timestamps: true });

module.exports = ProviderService;