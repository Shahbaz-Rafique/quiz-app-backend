const Result = require("../models/Result");
const Feedback = require("../models/Feedback");
const Quiz = require("../models/Quiz");





exports.createResult = async (req, res) => {
    try {
        const { quizId, studentId, questions, score, notes } = req.body;

        const newResult = new Result(
            {
                quizId,
                studentId,
                questions,
                score,
                notes
            }
        );
        await newResult.save();
        res.status(200).json({ message: "Quiz Saved Successfully", result: newResult });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getLatestResultByStudentId = async (req, res) => {
    try {
        const { studentId, quizId } = req.body;

        const latestResult = await Result.findOne({ studentId, quizId })
            .populate({
                path: 'quizId',
                populate: {
                    path: 'questions',
                    model: 'Question', // Populate each question in the quizId's questions array
                }
            })
            .populate('questions.questionId') // Populate the questionId field within the questions array of the result
            .sort({ date_created: -1 }) // Sort by date_created in descending order
            .exec();

        if (!latestResult) {
            return res.status(404).json({ message: 'No results found for this quiz and student' });
        }

        res.status(200).json(latestResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}



exports.giveFeedBack = async (req, res) => {
    try {
        const { studentId, quizId, feedback, rating, satisfaction } = req.body;

        const feedBack = await Feedback({
            studentId,
            quizId,
            feedback,
            rating,
            satisfaction
        })

        await feedBack.save();
        // Calculate the new average rating for the quiz
        const allFeedbacks = await Feedback.find({ quizId });
        const totalRatings = allFeedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
        const avgRating = totalRatings / allFeedbacks.length;

        // Update the avg_rating field in the Quiz document
        await Quiz.findByIdAndUpdate(quizId, { avg_rating: avgRating });
        res.status(200).json({ message: "Feedback saved successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }

}

exports.getFeedbackByStudentId = async (req, res) => {
    try {
        const { studentId, quizId } = req.body;

        const feedback = await Feedback.findOne({ studentId, quizId })
            .sort({ date_created: -1 })
            .exec();

        if (!feedback) {
            return res.status(404).json({ message: 'No feedback found for this student' });
        }

        res.status(200).json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


exports.getAllResults = async (req, res) => {
    try {
        const results = await Result.find()
            .sort({ date_created: -1 })
            .populate({
                path: 'quizId',
                populate: {
                    path: 'questions',
                    model: 'Question', // Populate each question in the quizId's questions array
                }
            })
            .populate('questions.questionId')
            .populate(
                {
                    path: 'studentId',
                    model: 'Student',
                    select: 'firstName lastName email'

                }
            )
            .exec();

        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


exports.deleteResult = async (req, res) => {
    try {
        const { id } = req.params;
        await Result.findByIdAndDelete(id);
        res.status(200).json({ message: "Log deleted successfully", id });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}