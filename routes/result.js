
const express = require('express');
const router = express.Router();

const resultController = require('../controllers/resultController');


router.post("/create", resultController.createResult);
router.post("/get-results", resultController.getLatestResultByStudentId);
router.post("/give-feedback", resultController.giveFeedBack);
router.post("/get-feedback", resultController.getFeedbackByStudentId);
router.get("/all", resultController.getAllResults);
router.delete("/:id/delete", resultController.deleteResult);




module.exports = router;
