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
    description: {
        type: DataTypes.TEXT,
    },
    location: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.STRING,
    },
    phone: {
        type: DataTypes.STRING,
    },
    image: {
        type: DataTypes.STRING,
    },
}, { timestamps: true });

module.exports = ProviderProfile;