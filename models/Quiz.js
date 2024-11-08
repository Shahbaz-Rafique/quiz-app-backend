const mongoose = require("mongoose")

const QuizSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    instructions: {
        type: String,
    },
    syllabus: {
        type: String,
    },
    avg_rating: {
        type: Number,
        default: 0
    },
    is_available: {
        type: Boolean,
        default: true,
    },
    time: {
        type: String,
        default: '0'
    },
    questions: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Question",
            index: true,
        }
    ],
    date_created: {
        type: Date,
        default: Date.now
    },

})

const Quiz = mongoose.model("Quiz", QuizSchema)
module.exports = Quiz;