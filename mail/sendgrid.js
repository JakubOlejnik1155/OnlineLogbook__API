const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(
  "SG.Mj8oWOJxRVmD-PL1Y4G1gA._cdcUDyTvkJ7HssH_g1hpG3qF1D6oDwPqyXxXxf9ioY"
);

const message = {};
message.from = "online@logbook.com";
message.mail_settings = {
  sandbox_mode: {
    enable: false
  }
};

module.exports.message = message;
