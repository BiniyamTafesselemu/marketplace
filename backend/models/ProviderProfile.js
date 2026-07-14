const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProviderProfile = sequelize.define("ProviderProfile", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    business_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.TEXT,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sub_city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    woreda: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.STRING,
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Shared identity documents
    national_id_photo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    FAN_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Services with per-service documents stored as JSON
    // Format: [{ service: "Plumbing", trade_license: "base64...", skill_certificate: "base64..." }]
    services: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const val = this.getDataValue("services");
            try { return val ? JSON.parse(val) : []; } catch { return []; }
        },
        set(val) {
            this.setDataValue("services", JSON.stringify(val));
        }
    },
    // Legacy single doc fields kept for backward compat
    trade_license: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    skill_certificate: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    verification_status: {
        type: DataTypes.ENUM("pending", "under_review", "approved", "rejected"),
        defaultValue: "pending",
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    account_status: {
        type: DataTypes.ENUM("active", "suspended", "banned"),
        defaultValue: "active",
    },
    suspension_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, { timestamps: true });

module.exports = ProviderProfile;