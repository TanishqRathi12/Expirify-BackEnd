const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.route");
const productRoutes = require("./routes/product.route");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const  checkForExpiringProducts = require("./service/cronJob");
app.use(cors());
require("dotenv").config();


const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/", authRoutes);
app.use("/", productRoutes);

cron.schedule('12 12 * * *', async () => {  //Run daily at 12pm
  console.log("Running expiry check...");
  try {
      await checkForExpiringProducts();  // Async call
  } catch (error) {
      console.error("Error during expiry check: ", error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to Database!!"))
    .catch((err) => console.log(err));
});


