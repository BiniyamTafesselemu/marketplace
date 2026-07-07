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
    national_id_photo:{
        type: DataTypes.TEXT,
        allowNull: true,

    },
    FAN_number: {
        type: DataTypes.STRING,
        allowNull: false,
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
    business_name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, { timestamps: true });

module.exports = ProviderProfile;