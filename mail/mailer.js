const sgMailer = require("@sendgrid/mail");
const sgConfig = require("./sendgrid");
const pug = require("pug");

exports.send = async options => {
  Object.assign(sgConfig.message, {
    to: options.email,
    subject: options.subject,
    html: render(options.view, options.data)
  });
  return await sgMailer.send(sgConfig.message);
};

const render = (filename, data) => {
  return pug.renderFile(`${__dirname}/../mail/view/${filename}.pug`, data);
};
