const app = require("./app");
const {connectDB} = require("./config/database")

require("dotenv").config();

const startServer = async ()=>{
    await connectDB();
    app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
}

startServer();