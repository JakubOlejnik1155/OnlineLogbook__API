const express = require("express");
const app = express();

//import Routes
const authRoute = require("./routes/auth");

//route Middlewares
app.use("/api/user", authRoute);

app.listen(3000, () => console.log("serever Up and Running"));
