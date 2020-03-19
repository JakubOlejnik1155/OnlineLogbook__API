const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
//import Routes
const authRoute = require("./routes/auth");
dotenv.config();
//CONNECT TO DB
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("connected to DB");
  }
);

//Middlewares
app.use(express.json());
app.use(cors());

//route Middlewares
app.use("/api/user", authRoute);

app.listen(3000, () => console.log("serever Up and Running"));
