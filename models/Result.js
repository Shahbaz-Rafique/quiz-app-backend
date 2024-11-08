const mongoose = require("mongoose")


const ResultSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Types.ObjectId,
        ref: "Quiz",
        index: true,
    },
    notes: {
        type: String
    },
    studentId: {
        type: mongoose.Types.ObjectId,
        ref: "Student",
        index: true,
    },
    questions: [{
        questionId: {
            type: mongoose.Types.ObjectId,
            ref: "Question",
            index: true,
        },
        userAnswer: {
            type: String,
        },
        isCorrect: {
            type: Boolean,
            default: false
        },
    }],
    score: {
        type: String
    },
    date_created: {
        type: Date,
        default: Date.now
    },


})


const Result = mongoose.model("Result", ResultSchema)
module.exports = Result