//authentication routes
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Boat = require('../model/Boat');
const Cruise = require('../model/Cruise');
const CurrentCruise = require('../model/CurrentCruise');
const {
    cruiseValidation,
    boatValidation
} = require("../function/validation");

// /api/cruises  => add cruise
router.post("", authenticateToken, async (req, res) => {

    const {boat, cruise } = req.body;
    //are boat data validate
    const { error } = boatValidation(boat);
    if (error) return res.status(400).send({ error:{code:404, msg: error.details[0].message} });
    //are cruise data validate
    const { error: errorCruise } = cruiseValidation(cruise);
    if (errorCruise) return res.status(400).send({ error: { code: 404, msg: errorCruise.details[0].message } });

    //add boat if not exists
    const userID = req.id.userId;
    const isBoatExists = await Boat.findOne({MMSI: boat.MMSI});
    const newBoat = new Boat({...boat,userID: userID })
    let newBoatID;
    if(!isBoatExists){
        await newBoat.save();
        newBoatID = newBoat._id;
    }else{
        newBoatID = isBoatExists._id;
    }
    //add cruise
    const cruiseObject = new Cruise({ ...cruise, boatID: newBoatID, userID: userID });
    const currentCruiseObject = new CurrentCruise({userID: userID, cruiseID: cruiseObject._id});

    const isCurrentObjectForThisUser = await CurrentCruise.findOne({userID: userID});
    if (isCurrentObjectForThisUser) return res.status(403).send({error: { code: 403, msg: "you can not start more then one cruise" } })
    else await currentCruiseObject.save();

    const isSimilarCruiseObject = await Cruise.findOne({ ...cruise, boatID: newBoatID, userID: userID });
    if (isSimilarCruiseObject) return res.status(403).send({ error: { code: 403, msg: "you added this cruise before"} });
    else await cruiseObject.save()

    return res.sendStatus(201);
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) return res.send({ error: true, message: "you are not authorized" });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (error, id) => {
        if (error) return res.send({ error: true, message: "you are not authorized" });
        req.id = id;
        next();
    });
}


module.exports = router;