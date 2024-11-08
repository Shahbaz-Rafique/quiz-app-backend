var express = require('express');
var router = express.Router();
var studentController = require("../controllers/userController")
/* GET users listing. */
router.post('/register', studentController.registerStudent);
router.post('/login', studentController.loginStudent);
router.post('/user/me', studentController.currentUser);
router.get("/verify/:token", studentController.verifyStudent);
router.post("/verify/forgot-password", studentController.forgotPassword);
router.post("/verify/reset-password/:token", studentController.resetPassword);
router.post('/verify/create-token', studentController.generateVerificationToken)

module.exports = router;
