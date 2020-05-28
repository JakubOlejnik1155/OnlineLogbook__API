//authentication routes
const router = require("express").Router();
const User = require("../model/user/User");
const RJwt = require("../model/user/refreshToken");
const SocialUser = require('../model/user/SocialUser');
const { emailTokenGenerate } = require("../function/functions");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const appMailer = require("../mail/appMailer");
const {
  registerValidation,
  setNewPasswordValidation
} = require("../function/validation");
const { loginValidation } = require("../function/validation");
const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '5m' });
};

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

//setting new password
router.put("/setNewPassword/:token", async (req, res) =>{
  //get token from url
  const token = req.params.token;
  //password validation
  const { error } = setNewPasswordValidation(req.body);
  if (error)
    return res.send({ error: error.details[0].message });
  if (req.body.newPassword !== req.body.confirmNewPassword)
    return res.send({error: "passwords are not equal"});
  const newPass = {
    newPassword: req.body.newPassword,
    confirmNewPassword: req.body.confirmNewPassword
  };
  const user = await User.findOne({authToken: token});
  if (user){
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword =  await bcrypt.hash(req.body.newPassword, salt);
      await User.updateOne(user, {password: hashedNewPassword, authToken: ''});
      res.send({success: "Your password has been changed"})
    }catch (e) {
      res.send({error: "Oops something get wrong"});
    }
  }else{
    res.send({error: "Oops something get wrong"});
  }
});
//facebook login/register
router.post( "/socialuser", async (req, res)=>{
  const email = req.body.email;
  const profilePicture = req.body.profilePicture;
  //is user exists ?
  try{
    const isUserExists = await SocialUser.findOne({email: email});
    if (isUserExists){
      //logowanie ponowne
      const userId = isUserExists._id;
      const userObject = { userId: userId };
      const accessToken = await jwt.sign(userObject, process.env.TOKEN_SECRET, { expiresIn: '5m' });
      const refreshToken = await jwt.sign(userObject, process.env.REFRESH_TOKEN_SECRET);
      //adding logged user to DB
      const DBtoken = new RJwt({ RJwt: refreshToken });
      await DBtoken.save();
      res.send({ accessToken: accessToken, refreshToken: refreshToken, profilePicture: profilePicture });
    }
    else{
      //pushowaie do bazy danych i logowanie
      const socialUser = new SocialUser({
        email: email,
        profilePicture: profilePicture
      });
      await socialUser.save()
      const UserExists = await SocialUser.findOne({ email: email });

      const userId = UserExists._id;
      const userObject = { userId: userId };
      const accessToken = await jwt.sign(userObject, process.env.TOKEN_SECRET, { expiresIn: '5m' });
      const refreshToken = await jwt.sign(userObject, process.env.REFRESH_TOKEN_SECRET);
      //adding logged user to DB
      const DBtoken = new RJwt({ RJwt: refreshToken });
      await DBtoken.save();
      res.send({ accessToken: accessToken, refreshToken: refreshToken, profilePicture: profilePicture });
    }
  }
  catch(e){return res.send({error: "something went wrong"})}

});
router.get("", authenticateToken, async (req, res)=>{
    const userID = req.id.userId;
    try{
        let UserObject;
        UserObject = await User.findOne({ _id: userID });
        if (!UserObject) UserObject = await SocialUser.findOne({ _id: userID });
        if (!UserObject) return res.send({ error: { code: 401, msg: "you are not authorized" } });

        return res.status(200).send({ data: {
          milesSailed: UserObject.milesSailed,
          hours: UserObject.hours,
          onSails: UserObject.onSails,
          onEngine: UserObject.onEngine
        },success: { code: '200' } });
    }catch (error) {
      return res.status(500).send({ error: { code: 500, msg: "Internal Server Error" } });
    }
})

//try breakpoint authorization
router.get('/try', authenticateToken, (req, res)=>{
  return res.send({message: "Authorized", userID: res.id});
});


router.post("/login", async (req, res) => {
  //validate data before logging in
  const { error } = loginValidation(req.body);
  if (error) return res.send({ error: error.details[0].message });
  //if account exists
  const user = await User.findOne({
    email: req.body.email
  });
  if (!user) return res.send({ error: "Email not found" });
  //is password correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.send({ error: "password is wrong" });
  //is user authorized
  if (!user.isAuthorized) return res.send({ error: "please verify your email before logging in" });
  //generating tokens
  const userId = user._id;
  const userObject = { userId: userId };
  try {
    const accessToken = await generateAccessToken(userObject);
    const refreshToken = await jwt.sign(userObject, process.env.REFRESH_TOKEN_SECRET);
    //adding logged user to DB
    const DBtoken = new RJwt({ RJwt: refreshToken });
    await DBtoken.save();
    res.send({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (e) { return res.send({ error: "something went wrong" }); }
});

router.delete("/logout", async (req, res) => {
  const refreshTokenToDelete = req.body.RJwt;
  try {
    await RJwt.deleteOne({ RJwt: refreshTokenToDelete });
    res.sendStatus(204);
  } catch (e) {
    res.send(e);
  }
});
//ask for new token
router.post("/token", async (req, res) => {
  const refreshToken = req.body.RJwt;
  if (!refreshToken) return res.send({ status: 401, error: true, message: "something went wrong" });
  const DBtoken = RJwt.findOne({ RJwt: refreshToken });
  if (!DBtoken) return res.send({ status: 403, error: true, message: "something went wrong" });
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, decoded) => {
    if (error) return res.send({ status: 403, error: true, message: "something went wrong" });
    const newAccessToken = generateAccessToken(decoded.userId);
    res.send({ status: 200, error: false, message: "new token sent", JWT: newAccessToken });
  });
});


//@TODO delete before production
router.post("/jwt/decode", async (req, res) => {
  const user = jwt.decode(req.body.jwt);
  const ex = jwt.verify(req.body.jwt, process.env.TOKEN_SECRET,
    (error, decoded) => {
      if (error) res.send(error);
      res.send(decoded);
    });
});


function authenticateToken(req, res, next){
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token === null) return res.send({error: true, message: "you are not authorized"});

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (error, id) =>{
    if (error) return res.send({error: true, message: "you are not authorized"});
    req.id = id;
    next();
  });
}

module.exports = router;