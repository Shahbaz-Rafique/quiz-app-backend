const Quiz = require("../models/Quiz")
const Question = require("../models/Question")
const multer = require("multer")
const path = require("path")
const Student = require("../models/Student")



const bucket = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/quizzes');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
})


const uploadImage = multer({ storage: bucket })
exports.img = uploadImage.array("img")


exports.createQuiz = async (req, res) => {
    try {

        const { name, syllabus, instructions, time } = req.body
        const questions = JSON.parse(req.body.questions)
        const files = req.files
        let newQuestionsIds = []
        if (questions) {
            let index = 0
            questions.forEach(question => {
                if (question.img) {
                    const imageFile = files[index] || null;
                    if (imageFile) {
                        question.img = "/images/quizzes/" + imageFile.filename;
                        index += 1;
                    }
                }

                var q = new Question(question)
                q.save()
                newQuestionsIds.push(q._id)


            })
        }
        const data = {
            name,
            syllabus,
            instructions,
            is_available: true,
            time,
            questions: newQuestionsIds,
            avg_rating: "0"
        }



        const newQuiz = new Quiz(data)

        await newQuiz.save()
        return res.status(200).json({ message: "Quiz Created Successfully", quiz: newQuiz })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate("questions")
        res.status(200).json(quizzes)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


exports.updateAvailability = async (req, res) => {
    try {
        const { id } = req.params
        const quiz = await Quiz.findById(id)
        quiz.is_available = !quiz.is_available
        await quiz.save()
        res.status(200).json({ message: "Quiz Updated Successfully", quiz })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


exports.updateQuiz = async (req, res) => {
    try {
        const { id } = req.params
        const quiz = await Quiz.findById(id)
        const { name, syllabus, instructions, time } = req.body
        console.log(req.body)
        const existingQuestions = quiz.questions
        quiz.name = name
        quiz.syllabus = syllabus
        quiz.instructions = instructions
        quiz.time = time
        const questions = JSON.parse(req.body.questions)
        const files = req.files
        let index = 0
        let newQuestionsIds = []

        questions.forEach((question) => {
            const existingQuestion = existingQuestions.find((existingQuestion) => existingQuestion._id == question._id)
            if (existingQuestion) {
                existingQuestion.question = question.question
                existingQuestion.options = question.options
                existingQuestion.answer = question.answer
                existingQuestion.is_required = question.is_required
                if (question.img && !question.img.startsWith("/images/quizzes/")) {
                    const imageFile = files[index] || null;
                    if (imageFile) {
                        existingQuestion.img = "/images/quizzes/" + imageFile.filename;
                        index += 1;
                    }
                }
                existingQuestion.save()
                newQuestionsIds.push(existingQuestion._id)
            }
            else {
                if (question.img) {
                    const imageFile = files[index] || null;
                    if (imageFile) {
                        question.img = "/images/quizzes/" + imageFile.filename;
                        index += 1;
                    }
                }
                var q = new Question(question)
                q.save()
                newQuestionsIds.push(q._id)
            }
        }
        )
        quiz.questions = newQuestionsIds

        await quiz.save()
        res.status(200).json({ message: "Quiz Updated Successfully", quiz })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


exports.deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params
        await Quiz.findByIdAndDelete(id)
        res.status(200).json({ message: "Quiz Deleted Successfully", id })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}



exports.getDashboardData = async (req, res) => {
    try {
        const totalQuizzes = await Quiz.countDocuments()
        const totalStudents = await Student.countDocuments()
        const averageRating = await Quiz.aggregate([

            { $group: { _id: null, avgRating: { $avg: "$avg_rating" } } }
        ])

        res.status(200).json({
            quizzes: totalQuizzes,
            users: totalStudents,
            rating: (averageRating[0]?.avgRating).toFixed(2) || 0 // Fallback to 0 if no rating
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


exports.getGuestQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ is_available: true, name: "Quantum Mechanics" }).populate("questions")
        res.status(200).json([quiz])
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}