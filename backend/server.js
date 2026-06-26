const app = require("./app");
const {connectDB} = require("./config/database")
const { syncDB } = require("./models")


require("dotenv").config();

const startServer = async ()=>{
    await connectDB();
    await syncDB();
    app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
}

startServer();