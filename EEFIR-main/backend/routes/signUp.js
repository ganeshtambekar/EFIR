const {signIn, adminSignUp} = require("../controller/log.js");
const express = require("express");
const router = express.Router();


router.post("/signUp",signIn);
router.post("/adminSignup",adminSignUp);
 
module.exports = router; 