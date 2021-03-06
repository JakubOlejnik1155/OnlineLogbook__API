//authentication routes
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const CurrentCruise = require('../model/cruise/CurrentCruise');
const CurrentDay = require('../model/day/CurrentDay');
const Day = require('../model/day/Day');
const Cruise = require('../model/cruise/Cruise');
const User = require("../model/user/User");
const SocialUser = require('../model/user/SocialUser');
const {
    newDayValidation,
    newHourlyEntryValidation,
    newWeatherEntryValidation,
    newWaypointValidation,
    newActionValidation
} = require("../function/validation");

const pdf = require('html-pdf');
const pdfTemplate = require('../documents');
const fs = require('fs')


//POST - pdf generation and fath data
router.post('/pdf', authenticateToken, async (req, res) => {
    pdf.create(pdfTemplate(req.body), { orientation: 'landscape'}).toFile('routes/logbooks/result.pdf', (error) => {
        if(error){
            return res.send(Promise.reject())
        }
        return res.send(Promise.resolve());
    })
});

//GET - send pdf to client
router.get('/pdf', authenticateToken, async (req, res) => {
    res.sendFile(`${__dirname}/logbooks/result.pdf`, () => {
        try {
            fs.unlinkSync(`${__dirname}/logbooks/result.pdf`);
        } catch (e) { return res.send(Promise.reject()) }
    })
});





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

    const isCruiseExist = await CurrentCruise.findOne({ userID: userID })
    if (!isCruiseExist) return res.status(405).send({ error: { code: 405, msg: "there is no active cruise" } })

    CurrentDay.find({ userID: userID }, (err, data) => {
        if (err) return res.status(500).send({ error: { code: 500, msg: "Internal Server Error" } });
        if (data) return res.status(200).send({
            description: "current day for logged user",
            data
        });
        else return res.status(200).send({ data: [] })
    });
});

// /api/days/hourly
router.post("/hourly", authenticateToken, async (req, res) => {
    const hourly = req.body.data;
    const userID = req.id.userId;
    const { error } = newHourlyEntryValidation(hourly)
    if (error) return res.status(400).send({ error: { code: 400, msg: error.details[0].message } });

    // is active day for this user?
    const CurrentDayObject = await CurrentDay.findOne({userID: userID})
    if (!CurrentDayObject) return res.status(400).send({ error: { code: 400, msg: "there is no active day" } })

    //is day object connected with current day object?
    const DayObject = await Day.findOne({ _id: CurrentDayObject.dayID});
    if (!DayObject) return res.status(400).send({ error: { code: 400, msg: "there is no day object" } })

    // is already entry on this hour ?
    let flag = false;
    await DayObject.hourlyArray.forEach(entry => {
        if(entry.hour === hourly.hour)
            flag = true;
    })
    if(flag) return res.status(403).send({ error: { code: 403, msg: "You added entry for this hour before" } });

    //enter data try
    try{
        await DayObject.hourlyArray.push(hourly)
        await DayObject.save()
        return res.status(201).send({ success: { code: '201' } });
    }catch(error){
        return res.status(400).send({ error: { code: 500, msg: 'we could not complete this operation' } });
    }
});

router.post("/weather", authenticateToken, async (req, res) => {
    const { data } = req.body;
    const userID = req.id.userId;
    //data validation
    const { error } = newWeatherEntryValidation(data);
    if (error) return res.status(400).send({ error: { code: 400, msg: error.details[0].message } });

    // is active day for this user?
    const CurrentDayObject = await CurrentDay.findOne({ userID: userID })
    if (!CurrentDayObject) return res.status(400).send({ error: { code: 400, msg: "there is no active day" } })

    //is day object connected with current day object?
    const DayObject = await Day.findOne({ _id: CurrentDayObject.dayID });
    if (!DayObject) return res.status(400).send({ error: { code: 400, msg: "there is no day object" } })


    //CZY MOZNA JUZ DODAC TAKI WPIS
    const placeInWeatherArray = (hour) => {
        if (hour >= 1 && hour <= 4) return 0;
        else if (hour >= 5 && hour <= 8) return 1;
        else if (hour >= 9 && hour <= 12) return 2;
        else if (hour >= 13 && hour <= 16) return 3;
        else if (hour >= 17 && hour <= 20) return 4;
        else if (hour >= 21 && hour <= 24) return 5;
        else if (hour === 0) return 5;
    }
    // is already entry on this hour ?
    let flag = false;
    const newArrayCase = placeInWeatherArray(data.hour);
    await DayObject.weatherArray.forEach(entry => {
        const arrayCase = placeInWeatherArray(entry.hour);
        if(arrayCase === newArrayCase)
            flag = true;
    })
    if (flag) return res.status(403).send({ error: { code: 403, msg: "You can add one weather entry for 4 hours." } });

    try{
        await DayObject.weatherArray.push(data);
        await DayObject.save()
        return res.status(201).send({ success: { code: '201' } });
    } catch (error) {
        return res.status(400).send({ error: { code: 500, msg: 'we could not complete this operation' } });
    }
});

router.post("/waypoint", authenticateToken, async (req, res) => {
    const { data } = req.body;
    const userID = req.id.userId;
    //data validation
    const { error } = newWaypointValidation(data);
    if (error) return res.status(400).send({ error: { code: 400, msg: error.details[0].message } });

    // is active day for this user?
    const CurrentDayObject = await CurrentDay.findOne({ userID: userID })
    if (!CurrentDayObject) return res.status(400).send({ error: { code: 400, msg: "there is no active day" } })

    //is day object connected with current day object?
    const DayObject = await Day.findOne({ _id: CurrentDayObject.dayID });
    if (!DayObject) return res.status(400).send({ error: { code: 400, msg: "there is no day object" } })

    try{
        await DayObject.waypointArray.push(data);
        await DayObject.save()
        return res.status(201).send({ success: { code: '201' } });
    } catch (error) {
        return res.status(400).send({ error: { code: 500, msg: 'we could not complete this operation' } });
    }
});

router.post("/action", authenticateToken, async (req, res) =>{
    const { data } = req.body;
    const userID = req.id.userId;

    const { error } = newActionValidation(data);
    if (error) return res.status(400).send({ error: { code: 400, msg: error.details[0].message } });

    // is active day for this user?
    const CurrentDayObject = await CurrentDay.findOne({ userID: userID })
    if (!CurrentDayObject) return res.status(400).send({ error: { code: 400, msg: "there is no active day" } })

    //is day object connected with current day object?
    const DayObject = await Day.findOne({ _id: CurrentDayObject.dayID });
    if (!DayObject) return res.status(400).send({ error: { code: 400, msg: "there is no day object" } })

    try {
        await DayObject.actionsArray.push(data);
        await DayObject.save()
        return res.status(201).send({ success: { code: '201' } });
    } catch (error) {
        return res.status(400).send({ error: { code: 500, msg: 'we could not complete this operation' } });
    }
});

//FORECAST ROUTES

router.post("/forecast", authenticateToken, async (req, res) => {
    const {data} = req.body;
    const userID = req.id.userId;

    // is active day for this user?
    const CurrentDayObject = await CurrentDay.findOne({ userID: userID })
    if (!CurrentDayObject) return res.status(400).send({ error: { code: 400, msg: "there is no active day" } })

    //is day object connected with current day object?
    const DayObject = await Day.findOne({ _id: CurrentDayObject.dayID });
    if (!DayObject) return res.status(400).send({ error: { code: 400, msg: "there is no day object" } })

    try {
        await DayObject.updateOne({receivedForecast: DayObject.receivedForecast.concat('\n' + data.forecast)});
        await DayObject.save()
        return res.status(201).send({ success: { code: '201' } });
    } catch (error) {
        return res.status(400).send({ error: { code: 500, msg: 'we could not complete this operation' } });
    }
});

// /api/days/finish
router.post('/finish', authenticateToken, async (req, res) => {
    const {data} = req.body;
    const userID = req.id.userId;

    let UserObject;
    UserObject =  await User.findOne({_id: userID});
    if(!UserObject) UserObject = await SocialUser.findOne({_id: userID});
    if (!UserObject) return res.send({ error: { code: 401, msg: "you are not authorized" } });

    // is active day for this user?
    const CurrentDayObject = await CurrentDay.findOne({ userID: userID })
    if (!CurrentDayObject) return res.status(400).send({ error: { code: 400, msg: "there is no active day" } })

    //is day object connected with current day object?
    const DayObject = await Day.findOne({ _id: CurrentDayObject.dayID });
    if (!DayObject) return res.status(400).send({ error: { code: 400, msg: "there is no day object" } })

    //find cruise
    const CruiseObject = await Cruise.findOne({ userID: userID, isDone: false});
    if (!CruiseObject) return res.status(400).send({ error: { code: 400, msg: "there is no cruise object" } })

    const NauticalMiles = data.endLOG - DayObject.startLOG;
    let traveledHours = 0;
    let sailedHours = 0;
    let engineHours = 0;

    //traveled hours
    let tmpStart = null, tmpStop = null;
    DayObject.actionsArray.forEach(action => {
        if(action.actionType === 'leave')
            tmpStart = action.hour;
        if (action.actionType === 'anchorDrop' || action.actionType === 'mooring' || action.actionType === 'mooringBuoy')
            tmpStop = action.hour;
        if( tmpStart !== null && tmpStop !== null){
            const diffTime = Math.abs(tmpStop - tmpStart);
            traveledHours += diffTime/3600000;
            tmpStart = null;
            tmpStop = null;
        }
    });

    //sailed Hours
    let tmpSailStart = null, tmpSailStop = null;
    DayObject.actionsArray.forEach(action => {
        if (action.actionType === 'setSails')
            tmpSailStart = action.hour;
        if (action.actionType === 'dropSails' || action.actionType === 'anchorDrop' || action.actionType === 'mooring' || action.actionType === 'mooringBuoy')
            tmpSailStop = action.hour;
        if (tmpSailStart !== null && tmpSailStop !== null) {
            const diffTime = Math.abs(tmpSailStop - tmpSailStart);
            sailedHours += diffTime / 3600000;
            tmpSailStart = null;
            tmpSailStop = null;
        }
    })

    //engine Hours
    let tmpEngineHoursStart = null, tmpEngineHoursEnd = null;
    DayObject.actionsArray.forEach(action => {
        if (action.actionType === 'leave' || action.actionType === 'dropSails' || action.actionType === 'engineOn')
            tmpEngineHoursStart = action.hour;
        if (action.actionType === 'engineOff' || action.actionType === 'anchorDrop' || action.actionType === 'mooring' || action.actionType === 'mooringBuoy' || action.actionType ==="setSails")
            tmpEngineHoursEnd = action.hour;
        if (tmpEngineHoursStart !== null && tmpEngineHoursEnd !== null) {
            const diffTime = Math.abs(tmpEngineHoursEnd - tmpEngineHoursStart);
            engineHours += diffTime / 3600000;
            tmpEngineHoursStart = null;
            tmpEngineHoursEnd = null;
        }
    })
    try {
        await CurrentDay.deleteOne(CurrentDayObject);
        await DayObject.updateOne({
            endLOG: data.endLOG,
            isDone: true,
            endHarbor: data.endHarbor,
            marinaCharges: data.marinaCharges,
            marinaVHF: data.marinaVHF,
            nauticalMiles: NauticalMiles,
            travelHours: traveledHours,
            hoursSailedOnEngine: engineHours,
            hoursSailedOnSails: sailedHours,

        });
        await CruiseObject.updateOne({
            nauticalMiles: CruiseObject.nauticalMiles + NauticalMiles,
            travelHours: CruiseObject.travelHours + traveledHours,
            hoursSailedOnEngine: CruiseObject.hoursSailedOnEngine + engineHours,
            hoursSailedOnSails: CruiseObject.hoursSailedOnSails + sailedHours
        });
        await UserObject.updateOne({
            milesSailed: UserObject.milesSailed + NauticalMiles,
            hours: UserObject.hours + traveledHours,
            onSails: UserObject.onSails + sailedHours,
            onEngine: UserObject.onEngine + engineHours,
        })
        // TODO: delete maybe
        // await DayObject.save()
        return res.status(201).send({ success: { code: '201' } });
    } catch (error) {
        return res.status(400).send({ error: { code: 500, msg: 'we could not complete this operation' } });
    }
});

//get days of cruise
router.get('/cruise/:token', authenticateToken, async (req, res) => {
    const cruiseID = req.params.token;
    const userID = req.id.userId;
    await Day.find({cruiseID: cruiseID, userID: userID}, (error, data)=>{
        if (error) return res.status(500).send({ error: { code: 500, msg: "Internal Server Error" } });
        else if (data) return res.status(200).send({ data: data })
    });
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const userID = req.id.userId;
    const dayID = req.params.id;

    let UserObject;
    UserObject = await User.findOne({ _id: userID });
    if (!UserObject) UserObject = await SocialUser.findOne({ _id: userID });
    if (!UserObject) return res.send({ error: { code: 401, msg: "you are not authorized" } });

    const DayObject = await Day.findOne({userID: userID, _id: dayID})
    if (!DayObject) return res.status(400).send({ error: { code: 400, msg: "there is no day object"}})

    const CruiseObject = await Cruise.findOne({ userID: userID, _id: DayObject.cruiseID })
    if (!CruiseObject) return res.status(400).send({ error: { code: 400, msg: "there is no cruise object" } })

    try{
        await Day.deleteOne({ userID: userID, _id: dayID }, (error)=>{if (error) {return res.status(500).send({ error: { code: 500, msg: "Internal Server Error" } }); }})
        if (!DayObject.isDone) {
            await CurrentDay.deleteOne({ dayID: dayID }, (error) => { if (error) { return res.status(500).send({ error: { code: 500, msg: "Internal Server Error" } }); } })
        }else if (DayObject.isDone){
            await CruiseObject.updateOne({
                nauticalMiles: CruiseObject.nauticalMiles - DayObject.nauticalMiles,
                travelHours: CruiseObject.travelHours - DayObject.travelHours,
                hoursSailedOnEngine: CruiseObject.hoursSailedOnEngine - DayObject.hoursSailedOnEngine,
                hoursSailedOnSails: CruiseObject.hoursSailedOnSails - DayObject.hoursSailedOnSails
            });
        }
        await UserObject.updateOne({
            milesSailed: UserObject.milesSailed - DayObject.nauticalMiles,
            hours: UserObject.hours - DayObject.travelHours,
            onSails: UserObject.onSails - DayObject.hoursSailedOnSails,
            onEngine: UserObject.onEngine - DayObject.hoursSailedOnEngine,
        })
        return res.status(201).send({ success: { code: '201' } });
    }catch(error){
        return res.status(500).send({ error: { code: 500, msg: "Internal Server Error" } });
    }


});


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) return res.send({ error: { code: 401, msg: "you are not authorized" } });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (error, id) => {
        if (error) return res.status(401).send({ error: { code: 401, msg: "you are not authorized" } });
        req.id = id;
        next();
    });
}


module.exports = router;