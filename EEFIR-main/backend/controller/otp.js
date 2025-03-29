const otpModel = require("../model/otpModel.js");
const otpGenerator = require("otp-generator");
const { transporter } = require("../config/mailer.js");
const user = require("../model/user");
const { logIn } = require("../controller/log.js");

exports.sentOtp = async (req, res, next) => {
  const { email, socketId } = req.body;
  console.log(email, socketId);
  if (!email || !socketId)
    return res.status(401).json({
      message: "TimeOut",
    });

  const existingUser = await user.findOne({ email });

  if (!existingUser)
    return res.status(500).json({
      message: "UNAUTHORIZED USER",
    });

  const OTP = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  console.log(email, socketId, OTP);
  const otpData = new otpModel({ email, socketId, OTP });
  await otpData.save();
  const info = await transporter.sendMail({
    from: "support@complaintsolutions.com", // Updated sender email
    to: `${email}`,
    subject: "Your Verification Code for Complaint Management Platform",
    text: `Your One-Time Verification Code: ${OTP}

Dear Valued Customer,

We take your concerns seriously. This verification code is an essential step in ensuring the security of your account and the confidentiality of your complaint.

Verification Code: ${OTP}
Code Validity: 10 minutes

If you did not request this code, please contact our support team immediately.

Best regards,
Complaint Solutions Team
Customer Support & Resolution Center`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #f4f4f4;
                padding: 15px;
                text-align: center;
                border-bottom: 3px solid #007bff;
            }
            .content {
                padding: 20px;
                background-color: #ffffff;
            }
            .otp-code {
                background-color: #007bff;
                color: white;
                padding: 10px 20px;
                text-align: center;
                font-size: 24px;
                letter-spacing: 5px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #777;
                margin-top: 20px;
                border-top: 1px solid #e0e0e0;
                padding: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Complaint Solutions</h1>
            <h3>Secure Verification</h3>
        </div>
        
        <div class="content">
            <p>Dear Valued Customer,</p>
            
            <p>We take your concerns seriously. This verification code is an essential step in ensuring the security of your account and the confidentiality of your complaint.</p>
            
            <div class="otp-code">
                ${OTP}
            </div>
            
            <p><strong>Code Validity:</strong> 10 minutes</p>
            
            <p>If you did not request this code, please contact our support team immediately.</p>
            
            <p>Thank you for trusting Complaint Solutions.</p>
        </div>
        
        <div class="footer">
            © 2024 Complaint Solutions | Secure. Swift. Resolved.
            <br>
            <small>This is an automated message. Please do not reply.</small>
        </div>
    </body>
    </html>
    `,
  });

  console.log("Message sent: %s", info.messageId);
  res.send("OTP sent successfully");
};

exports.verifyOtp = async (req, res, next) => {
  const { email, OTP, socketId } = req.body;
  if (!email || !socketId || !OTP)
    return res.status(401).json({
      message: "TimeOut",
    });

  console.log(email, socketId, OTP);
  const otpData = await otpModel.findOne({ email, OTP, socketId });
  if (otpData) {
    const existingUser = await user.findOne({ email });
    console.log(existingUser);
    res.user = existingUser;
    next();
  } else {
    res.status(400).send("Invalid OTP");
  }
};
