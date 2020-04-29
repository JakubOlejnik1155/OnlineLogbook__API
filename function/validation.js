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
    draft: Joi.string().optional().allow(''),
    name: Joi.string().required(),
    type: Joi.string().optional().allow(''),
  });
  return schema.validate(data);
};

module.exports.boatValidation = boatValidation;
module.exports.cruiseValidation = cruiseValidation;
module.exports.setNewPasswordValidation = setNewPasswordValidation;
module.exports.loginValidation = loginValidation;
module.exports.registerValidation = registerValidation;
