//authentication routes
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const CurrentCruise = require('../model/cruise/CurrentCruise');
const CurrentDay = require('../model/day/CurrentDay');
const Day = require('../model/day/Day');
const {
    newDayValidation
} = require("../function/validation");

// POST /api/days => activatin a day of active cruise
router.post("", authenticateToken, async (req, res) => {
    const { day } = req.body;
    const { error } = newDayValidation(day);
    if (error) return res.status(400).send({ error: { code: 400, msg: error.details[0].message } });

    const userID = req.id.userId;
    //is cruise exist
    const isCruiseExist = await CurrentCruise.findOne({ userID: userID })
    if (!isCruiseExist) return res.status(400).send({ error: { code: 400, msg: "there is no active cruise" } })

    const cruiseID = isCruiseExist.cruiseID;
    const DayObject = new Day({ ...day, cruiseID: cruiseID, userID: userID, });
    const CurrentDayObject = new CurrentDay({ userID: userID, cruiseID: cruiseID, dayID: DayObject._id });

    const isCurrentDayForThisUser = await CurrentDay.findOne({ userID: userID });
    if (isCurrentDayForThisUser) return res.status(400).send({ error: { code: 400, msg: "you can not start more then one day" } })

    const isSimilarDayObject = await Day.findOne(CurrentDayObject);
    if (isSimilarDayObject) return res.status(403).send({ error: { code: 403, msg: "you added this cruise before" } });

    try {
        await DayObject.save();
        await CurrentDayObject.save();
        return res.status(201).send({ success: { code: '201' } });
    } catch (error) {
        return res.status(400).send({ error: { code: 500, msg: 'we could not complete this operation' } });
    }
});

// GET /api/days/current => check if is active cruise for user
router.get("/current", authenticateToken, async (req, res) => {
    const userID = req.id.userId;
    console.log(userID);
    CurrentDay.find({ userID: userID }, (err, data) => {
        if (err) return res.status(500).send({ error: { code: 500, msg: "Internal Server Error" } });
        if (data) return res.status(200).send({
            description: "current day for logged user",
            data
        });
        else return res.status(200).send({ data: [] })
    });
});




function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) return res.send({ error: { code: 401, msg: "you are not authorized" } });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (error, id) => {
        if (error) return res.send({ error: { code: 401, msg: "you are not authorized" } });
        req.id = id;
        next();
    });
}


module.exports = router;