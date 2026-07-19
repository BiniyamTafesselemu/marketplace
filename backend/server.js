const app = require("./app");
const { connectDB, sequelize } = require("./config/database");
// Import models to set up associations
require("./models");
require("dotenv").config();

const startServer = async () => {
    await connectDB();

    try {
        await sequelize.query('SELECT 1 FROM "Users" LIMIT 1');
        console.log("Tables already exist, skipping sync");
    } catch {
        console.log("Tables not found, syncing...");
        const { syncDB } = require("./models");
        await syncDB();
    }

    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
};

startServer();