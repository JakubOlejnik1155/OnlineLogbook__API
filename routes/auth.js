//authentification routes
const router = require("express").Router();
const User = require("../model/User");
const { emailTokenGenerate } = require("../functions");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../validation");

//registration
router.post("/register", async (req, res) => {
  //is confirm Password good?
  if (req.body.password != req.body.passwordConfirm) {
    return res.send({ error: "passwords are not the same" });
  }

  //validate Data
  const { error } = registerValidation(req.body);
  if (error) return res.send({ error: error.details[0].message });

  //chcek if the user is in DB
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.send({ error: "Email already exists" });

  //hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // make new user
  const authToken = emailTokenGenerate(32);
  const user = new User({
    email: req.body.email,
    password: hashedPassword,
    authToken: authToken,
    isAuthorized: 0
  });
  try {
    const savedUser = await user.save();
    res.send({ user: user._id, success: "registered" });
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

//JUST TESTING CONNECTIONS
router.post("/test", (req, res) => {
  const user123 = {
    email: "Swwa",
    pass: "123"
  };
  console.log("test made");
  console.log(req.body);
  res.json(user123);
});
//END OF TESTING CONNECTIONS

module.exports = router;
