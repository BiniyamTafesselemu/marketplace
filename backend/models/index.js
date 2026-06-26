const User = require("./User");
const Category = require("./Category");
const ProviderProfile = require("./ProviderProfile");
const Booking = require("./Booking");
const Review = require("./Review");
const { sequelize } = require("../config/database");

// Associations
User.hasOne(ProviderProfile, { foreignKey: "user_id" });
ProviderProfile.belongsTo(User, { foreignKey: "user_id" });

Category.hasMany(ProviderProfile, { foreignKey: "category_id" });
ProviderProfile.belongsTo(Category, { foreignKey: "category_id" });

User.hasMany(Booking, { foreignKey: "customer_id" });
Booking.belongsTo(User, { foreignKey: "customer_id" });

Booking.hasOne(Review, { foreignKey: "booking_id" });
Review.belongsTo(Booking, { foreignKey: "booking_id" });

// Sync all models
const syncDB = async () => {
    await sequelize.sync({ alter: true });
    console.log("All tables synced");
};

module.exports = { User, Category, ProviderProfile, Booking, Review, syncDB };