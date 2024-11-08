const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');



router.post("/create", quizController.img, quizController.createQuiz);
router.put("/:id/update", quizController.img, quizController.updateQuiz);
router.get("/all", quizController.getAllQuizzes);
router.get("/:id/toggle-availability", quizController.updateAvailability);
router.get("/dashboard", quizController.getDashboardData);
router.delete("/:id/delete", quizController.deleteQuiz);
router.get("/guest", quizController.getGuestQuiz);



module.exports = router;



