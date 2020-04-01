const express = require('express');
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const AuthRoutes = require("./routes/authRoutes");

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true },
    ()=>{console.log("Auth connected to DB")});

app.use("/api/user", AuthRoutes);




app.listen(4000, ()=> console.log("Auth || Server Up and Running"));