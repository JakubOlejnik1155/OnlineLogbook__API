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

module.exports.setNewPasswordValidation = setNewPasswordValidation;
module.exports.loginValidation = loginValidation;
module.exports.registerValidation = registerValidation;
