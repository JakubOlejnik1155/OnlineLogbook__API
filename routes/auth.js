//authentification routes
const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../validation");

//registration
router.post("/register", async (req, res) => {
  //validate Data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //chcek if the user is in DB
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email already exists");

  //hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // make new user
  const user = new User({
    email: req.body.email,
    password: hashedPassword
  });
  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

//login
router.post("/login", async (req, res) => {
  //validate data before loging in
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //if account exists
  const user = await User.findOne({
    email: req.body.email
  });
  if (!user) return res.status(400).send("Email is not found");

  //is password correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("password is wrong");

  //create and assign json web token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send(token);

  //logged in propperly
  //res.status(200).send("correct");
});

const user123 = {
  email: "Swwa",
  pass: "123"
};
router.post("/test", (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
  console.log("test made");
  console.log(req.body);
  res.json(req.body);
});

module.exports = router;
