const mailer = require("./mailer");

exports.registrationEmail = options => {
  const defaultOptions = {
    subject: "Confirm Your Account on online logbook",
    view: "registration"
  };
  return mailer.send(Object.assign(defaultOptions, options));
};


exports.renewPassword = options =>{
    const defaultOptions = {
        subject: "Change your Password",
        view: "renewPassEmail"
    };
    return mailer.send(Object.assign(defaultOptions, options));
};