const nodemailer = require("nodemailer");

exports.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "rssoftech25@gmail.com",
    pass: "wfmo unrb parx chup", 
  },
}); 