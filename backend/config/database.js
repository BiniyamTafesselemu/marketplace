const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    host: "db.awikwkvjdagvziraqbky.supabase.co",
    family: 4  // 👈 forces IPv4
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Unable to connect to the database:", error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };