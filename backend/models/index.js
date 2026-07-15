const User = require("./User");
const Category = require("./Category");
const ProviderProfile = require("./ProviderProfile");
const ProviderService = require("./ProviderService");
const Booking = require("./Booking");
const Review = require("./Review");
const { sequelize } = require("../config/database");

// Associations
User.hasOne(ProviderProfile, { foreignKey: "user_id" });
ProviderProfile.belongsTo(User, { foreignKey: "user_id" });

Category.hasMany(ProviderProfile, { foreignKey: "category_id" });
ProviderProfile.belongsTo(Category, { foreignKey: "category_id" });

ProviderProfile.hasMany(ProviderService, { foreignKey: "provider_id" });
ProviderService.belongsTo(ProviderProfile, { foreignKey: "provider_id" });

User.hasMany(Booking, { foreignKey: "customer_id" });
Booking.belongsTo(User, { foreignKey: "customer_id" });

Booking.hasOne(Review, { foreignKey: "booking_id" });
Review.belongsTo(Booking, { foreignKey: "booking_id" });

const syncDB = async () => {
    await sequelize.sync();
    console.log("All tables synced");
};

module.exports = { User, Category, ProviderProfile, ProviderService, Booking, Review, syncDB };