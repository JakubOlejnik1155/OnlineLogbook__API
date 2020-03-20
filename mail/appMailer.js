const mailer = require("./mailer");

exports.registrationEmail = options => {
  const defaultOptions = {
    subject: "Confirm Your Account on online logbook",
    view: "registration"
  };
  return mailer.send(Object.assign(defaultOptions, options));
};
