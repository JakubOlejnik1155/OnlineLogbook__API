//authentication routes
const router = require("express").Router();
const jwt = require("jsonwebtoken");
// const Boat = require('../model/cruise/Boat');
const Cruise = require('../model/cruise/Cruise');
const CurrentCruise = require('../model/cruise/CurrentCruise');
const CurrentDay = require('../model/day/CurrentDay');
const Day = require('../model/day/Day');
const {
    cruiseValidation,
    boatValidation
} = require("../function/validation");

const pdf = require('html-pdf');
const pdfTemplate = require('../documents');
const fs = require('fs');
const mergePDFs = require('merge-multiple-pdfs');
const rimraf = require("rimraf");


//POST - pdf generation and fath data
// /api/cruises
router.post('/pdf', authenticateToken, async (req, res) => {
    let counter =0;
    let files = [];
    req.body.data.forEach((day)=>{
       pdf.create(pdfTemplate(day), { orientation: 'landscape' }).toFile(`${__dirname}/../documents/logbooks/cruises/${new Date(day.date).toLocaleDateString()}.pdf`, (error) => {
             if (error) {
                 return res.status(400).send({ error: { code: 500, msg: 'we could not complete this operation' } });
            }
            counter++;
            files.push(`${__dirname}/../documents/logbooks/cruises/${new Date(day.date).toLocaleDateString()}.pdf`)
            if (counter === req.body.data.length){
                try{
                    mergePDFs.appendPdf(files, `${__dirname}/cruise.pdf`);
                }
                catch (e) { return res.status(400).send({ error: { code: 500, msg: 'we could not complete this operation' } });}
                return res.send(Promise.resolve());
            }
        })
    })
});

//GET - send pdf to client
router.get('/pdf', authenticateToken, async (req, res) => {
    try{
        res.sendFile(`${__dirname}/cruise.pdf`, () => {
                fs.unlinkSync(`${__dirname}/cruise.pdf`);
                rimraf.sync(`${__dirname}/../documents/logbooks/cruises`);
        })
    } catch (e) { return res.status(400).send({ error: { code: 500, msg: 'we could not complete this operation' } }); }
});



// POST /api/cruises  => add cruise
router.post("", authenticateToken, async (req, res) => {
    const {boat, cruise } = req.body;
    const userID = req.id.userId;
    //are boat data validate
    const { error } = boatValidation(boat);
    if (error) return res.status(400).send({ error:{code:400, msg: error.details[0].message} });
    //are cruise data validate
    const { error: errorCruise } = cruiseValidation(cruise);
    if (errorCruise) return res.status(400).send({ error: { code: 400, msg: errorCruise.details[0].message } });

    //TODO: delete this commect before production
    // //add boat if not exists
    // const isBoatExists = await Boat.findOne({MMSI: boat.MMSI});
    // const newBoat = new Boat({...boat,userID: userID })
    // let newBoatID;
    // if(!isBoatExists){
    //     await newBoat.save();
    //     newBoatID = newBoat._id;
    // }else{
    //     newBoatID = isBoatExists._id;
    // }
    //add cruise
    const cruiseObject = new Cruise({ ...cruise, boatID: boat, userID: userID });
    const currentCruiseObject = new CurrentCruise({userID: userID, cruiseID: cruiseObject._id});

    const isCurrentObjectForThisUser = await CurrentCruise.findOne({userID: userID});
    if (isCurrentObjectForThisUser) return res.status(403).send({error: { code: 403, msg: "you can not start more then one cruise" } })

    const isSimilarCruiseObject = await Cruise.findOne({ ...cruise, boatID: boat, userID: userID });
    if (isSimilarCruiseObject) return res.status(403).send({ error: { code: 403, msg: "you added this cruise before"} });


    try {
        await currentCruiseObject.save();
        await cruiseObject.save()
        return res.status(201).send({ success: { code: '201' } });
    } catch (error) {
        return res.status(400).send({ error: { code: 500, msg: 'we could not complete this operation' } });
    }
});

router.get("", authenticateToken, async (req, res) => {
    const userID = req.id.userId;

    // let cruises;
    await Cruise.find({userID: userID}, async (error, data) => {
        if (error) return res.status(500).send({ error: { code: 500, msg: "Internal Server Error" } });
        else if (data) return res.status(200).send({ data: data })
    });
});

// GET /api/cruises/current => check if is active cruise for user
router.get("/current", authenticateToken, async (req, res) => {
    const userID = req.id.userId;
    CurrentCruise.find({ userID: userID },  (err, data) => {
        if (err) return res.status(500).send({ error: { code: 500, msg: "Internal Server Error"}});
        if (data) return res.status(200).send({
            description: "current cruise for logged user",
            data
        });
        else return res.status(200).send({data:[]})
    });
});

// /api/cruises/finish
router.patch("/finish", authenticateToken, async (req, res) => {
    const userID = req.id.userId;

    const CurrentDayObject = await CurrentDay.findOne({ userID: userID })
    if (CurrentDayObject) return res.status(403).send({ error: { code: 403, msg: "Finish active day first" } })

    const CurrentCruiseObject = await CurrentCruise.findOne({userID: userID})
    if (!CurrentCruiseObject) return res.status(403).send({ error: { code: 403, msg: "There is no active cruise" } })

    //find cruise
    const CruiseObject = await Cruise.findOne({ userID: userID, isDone: false, _id: CurrentCruiseObject.cruiseID });
    if (!CruiseObject) return res.status(400).send({ error: { code: 400, msg: "there is no cruise object" } })

    try {
        await CurrentCruise.deleteOne(CurrentCruiseObject);
        await Cruise.updateOne({isDone: true});
        return res.status(201).send({ success: { code: '201' } });
    } catch (error) {
        return res.status(400).send({ error: { code: 500, msg: 'we could not complete this operation' } });
    }
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