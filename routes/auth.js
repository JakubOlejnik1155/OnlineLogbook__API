//authentification routes
const router = require("express").Router();
const User = require("../model/User");
const { emailTokenGenerate } = require("../function/functions");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const appMailer = require("../mail/appMailer");
const {
  registerValidation,
  loginValidation
} = require("../function/validation");

//registration breakpoint
router.post("/register", async (req, res) => {
  //is confirm Password good?
  if (req.body.password !== req.body.passwordConfirm) {
    return res.send({ error: "passwords are not the same" });
  }

  //validate Data
  const { error } = registerValidation(req.body);
  if (error) return res.send({ error: error.details[0].message });

  //check if the user is in DB
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
    await appMailer.registrationEmail({
      email: user.email,
      data: {email: req.body.email, authToken: user.authToken}
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

//validation user email breakpoint
router.put("/validation/:token", async (req, res) => {
  //get token from url
  const token = req.params.token;
  //is user with this token?
  const user = await User.findOne({authToken: token});
  //update user
  if(user){
    try{
      await User.updateOne({authToken: token}, {authToken: '', isAuthorized: true});
      res.send({success: "email verified"});
    }catch (error) {
        res.send(error);
    }
  }else{
    res.send({error: "your email has already been verified"})
  }
});

//password renew breakpoint ==> setting auth token to user again
router.post("/renewPassword", async (req, res) =>{
  const user = await User.findOne({email: req.body.email});
  if (user){
    try{
      const newAuthToken = emailTokenGenerate(32);
      await User.updateOne(user, {authToken: newAuthToken});
      await appMailer.renewPassword({
        email: user.email,
        data: { authToken: newAuthToken}
      });
      res.send({success: "send renew PassLink"})
    }catch{
      res.send({error: "We were unable to send you an email. Try again."})
    }

  }
  else{
    res.send({error: "it looks like you are not registered"});
  }
});

//login breakpoint
router.post("/login", async (req, res) => {
  //validate data before logging in
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

module.exports = router;