const router = require("express").Router();
const RJwt = require("../model/refreshToken");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {loginValidation}  = require("../function/validation");

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.TOKEN_SECRET, {expiresIn: '5m'});
};


router.post("/login", async (req, res)=>{
        //validate data before logging in
    const { error } = loginValidation(req.body);
    if (error) return res.send({error: error.details[0].message});
        //if account exists
    const user = await User.findOne({
        email: req.body.email
    });
    if (!user) return res.send({error: "Email not found"});
        //is password correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.send({error: "password is wrong"});
        //is user authorized
    if (!user.isAuthorized) return res.send({error: "please verify your email before logging in"});
        //generating tokens
    const userId = user._id;
    const userObject = { userId: userId };
     try {
        const accessToken = await generateAccessToken(userObject);
        const refreshToken = await jwt.sign(userObject, process.env.REFRESH_TOKEN_SECRET);
        //adding logged user to DB
        const DBtoken = new RJwt({RJwt: refreshToken});
        await DBtoken.save();
        res.send({accessToken: accessToken, refreshToken: refreshToken});
     }catch(e) {return res.send({error: "something went wrong"});}
});

router.delete("/logout", async (req, res) =>{
    const refreshTokenToDelete = req.body.RJwt;
    try{
        await  RJwt.deleteOne({RJwt: refreshTokenToDelete});
        res.sendStatus(204);
    }catch (e) {
        res.send(e);
    }
});


//@TODO delete before production
router.post("/jwt/decode", async (req, res)=>{
    const user = jwt.decode(req.body.jwt);
    const ex = jwt.verify(req.body.jwt, process.env.TOKEN_SECRET,
        (error, decoded)=>{
            if (error) res.send(error);
            res.send(decoded);
        });
    console.log(user);
});

module.exports = router;



