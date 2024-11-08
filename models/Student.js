const mongoose = require("mongoose")

const StudentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    status: {
        type: String,
        default: "active"
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    }

})


const Student = mongoose.model("Student", StudentSchema);

module.exports = Student;