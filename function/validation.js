//VALIDATION
const Joi = require("@hapi/joi");

//Register validation
const registerValidation = data => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .min(6)
      .required(),
    password: Joi.string()
      .min(8)
      .required(),
    passwordConfirm: Joi.string()
      .min(8)
      .required()
  });
  return schema.validate(data);
};

//Login validation
const loginValidation = data => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .min(6)
      .required(),
    password: Joi.string()
      .min(8)
      .required()
  });
  return schema.validate(data);
};

//set new password validation
const setNewPasswordValidation = data =>{
  const schema = Joi.object({
    newPassword: Joi.string().min(8).required(),
    confirmNewPassword: Joi.string().min(8).required(),
  });
  return schema.validate(data);
};

const cruiseValidation = data => {
  const schema = Joi.object({
    country: Joi.string().required(),
    harbour: Joi.string().required(),
    sailingArea: Joi.string().required(),
    startDate: Joi.string().required(),
  });
  return schema.validate(data)
};


const boatValidation = data => {
  const schema = Joi.object({
    MMSI: Joi.string().required().length(9),
    draft: Joi.number().optional().allow(''),
    name: Joi.string().required(),
    type: Joi.string().optional().allow(''),
  });
  return schema.validate(data);
};

const newDayValidation = data => {
  const schema = Joi.object({
    startHarbor: Joi.string().required(),
    startLOG: Joi.number().required(),
    engineMth: Joi.number().required(),
    oil: Joi.boolean().required(),
    fuel: Joi.number().required().min(0).max(100),
    freshWater: Joi.number().required().min(0).max(100),
    date: Joi.date().required()
  });
  return schema.validate(data);
}

const newHourlyEntryValidation = data => {
  const schema = Joi.object({
    compasCourse: Joi.number().required().min(0).max(360),
    sailsState: Joi.string().allow(''),
    engineState: Joi.string().allow(''),
    boatSpeed: Joi.number(),
    log: Joi.number().required(),
    windDirection: Joi.string().required(),
    windSpeed: Joi.number().required(),
    seaState: Joi.number().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    hour: Joi.number().required(),
  });
  return schema.validate(data);
}

const newWeatherEntryValidation = data => {
  const schema = Joi.object({
    hour: Joi.number().required().max(24),
    temperature: Joi.number().required(),
    pressure: Joi.number().required(),
    overcast: Joi.number().required(),
    details: Joi.string().allow(''),
  });
  return schema.validate(data);
}

const newWaypointValidation = data => {
   const schema = Joi.object({
      name: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
   });
   return schema.validate(data);
};

const newActionValidation = data => {
  const schema = Joi.object({
    hour: Joi.date().required(),
    actionType: Joi.string().required(),
    details: Joi.string().allow(''),
  });
  return schema.validate(data);
};

module.exports.newActionValidation = newActionValidation;
module.exports.newWaypointValidation = newWaypointValidation;
module.exports.newWeatherEntryValidation = newWeatherEntryValidation;
module.exports.newHourlyEntryValidation = newHourlyEntryValidation;
module.exports.newDayValidation = newDayValidation;
module.exports.boatValidation = boatValidation;
module.exports.cruiseValidation = cruiseValidation;
module.exports.setNewPasswordValidation = setNewPasswordValidation;
module.exports.loginValidation = loginValidation;
module.exports.registerValidation = registerValidation;
