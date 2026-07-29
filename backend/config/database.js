const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        },
        keepAlive: true,
        keepAliveInitialDelayMillis: 0,
    },
    family: 4,
    pool: {
        max: 5,
        min: 1,
        acquire: 60000,
        idle: 30000,
        evict: 10000,
    },
    retry: {
        max: 3
    }
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