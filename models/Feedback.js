const mongoose = require("mongoose")
const FeedbackSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Types.ObjectId,
        ref: "Student",
        required: true
    },
    quizId: {
        type: mongoose.Types.ObjectId,
        ref: "Quiz",
        required: true
    },
    satisfaction: {
        type: String,
        required: true

    },
    rating: {
        type: Number,
        required: true
    },
    feedback: {
        type: String,
        required: true
    },
    date_created: {
        type: Date,
        default: Date.now
    }
})

const Feedback = mongoose.model("Feedback", FeedbackSchema)

module.exports = Feedback;