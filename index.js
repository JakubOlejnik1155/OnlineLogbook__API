const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
//import Routes
const Routes = require("./routes/routes");
const CruiseRouter = require("./routes/CruiseRoutes");
const DayRoutes = require("./routes/DayRoutes");
dotenv.config();
//CONNECT TO DB
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("connected to DB");});

//Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public', {}))
//route Middleware
app.use("/api/user", Routes);
app.use("/api/cruises", CruiseRouter);
app.use("/api/days", DayRoutes);
app.use( "*",express.static('public', {}))

app.listen(3000, () => console.log("server Up and Running"));
