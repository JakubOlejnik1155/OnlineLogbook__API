const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const message = {};
message.from = "onlineLogbook@sailaway.com";
message.mail_settings = {
  sandbox_mode: {
    enable: false
  }
};

module.exports.message = message;
