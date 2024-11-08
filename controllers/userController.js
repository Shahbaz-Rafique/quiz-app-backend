const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

const genToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: "1h" })
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (email, message, subject) => {
    try {
        // Validate email format
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: message,
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: "email sent successfully" };
    } catch (error) {
        console.error("Email send error:", error);
        return { success: false, message: "Failed to send email", error: error.message };
    }
};





exports.registerStudent = async (req, res) => {
    try {


        const existingStudent = await Student.findOne({ email: req.body.email });
        if (existingStudent) {
            return res.status(409).json({ message: 'Student already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newStudent = new Student({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword
        });
        await newStudent.save();


        const verificationToken = genToken(newStudent._id);

        const subject = "Email Verification";
        const message = `<p>Please verify your email by clicking the link below:</p>
                   <a href="${process.env.CLIENT_URL}/verify/${verificationToken}">Verify Email</a>`;
        const emailResponse = await sendEmail(newStudent.email, message, subject);
        if (!emailResponse.success) {
            return res.status(500).json({ message: emailResponse.message });
        }

        res.status(200).json({ message: 'Email Verification Link sent to your email' });






    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.generateVerificationToken = async (req, res) => {
    try {
        const { email } = req.body
        const existingStudent = await Student.findOne({ email });
        console.log(existingStudent)
        if (!existingStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (existingStudent.isVerified) {
            return res.status(200).json({ message: 'Student already verified' });
        }
        const verificationToken = genToken(existingStudent._id);
        const subject = "Email Verification";
        const message = `<p>Please verify your email by clicking the link below:</p>
                   <a href="${process.env.CLIENT_URL}/verify/${verificationToken}">Verify Email</a>`;
        const emailResponse = await sendEmail(existingStudent.email, message, subject);

        if (!emailResponse.success) {
            return res.status(500).json({ message: emailResponse.message });
        }

        return res.status(200).json({})



    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal Server Error" })
    }

}



exports.verifyStudent = async (req, res) => {
    try {
        const { token } = req.params;
        if (token == "") {
            return res.status(400).json({ message: 'Invalid verification token' });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid verification token' });
        }
        const student = await Student.findById(decoded.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (student.isVerified) {
            return res.status(200).json({ message: 'Student already verified', isVerified: true });
        }
        student.isVerified = true;
        await student.save();
        res.status(200).json({ message: 'Student verified successfully', isVerified: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.loginStudent = async (req, res) => {
    try {
        if (req.body.email === process.env.ADMIN_LOGIN) {

            if (req.body.password === process.env.ADMIN_PASSWORD) {
                const token = jwt.sign({ id: process.env.ADMIN_ID }, process.env.JWT_SECRET);
                return res.status(200).json({ token, role: 'admin' });

            }
            else {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
        } else {
            const student = await Student.findOne({ email: req.body.email });
            if (!student) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            if (!student.isVerified) {
                return res.status(400).json({ message: 'Student not verified' });
            }
            const isValidPassword = await bcrypt.compare(req.body.password, student.password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET);
            res.status(200).json({ token, role: 'student' });
        }

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}



exports.currentUser = async (req, res) => {
    try {
        const { role } = req.body;
        const token = req.header('Authorization').split(' ')[1];

        if (token == "null") {

            return res.status(401).json({ message: 'Unauthorized' });
        }
        else {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (role === 'admin' && decoded.id === process.env.ADMIN_ID) {
                return res.json(
                    {
                        _id: decoded.id,
                        firstName: 'admin',
                        lastName: "admin",
                        email: process.env.ADMIN_LOGIN,
                        role: 'admin'

                    });
            }
            const studentExist = await Student.findById(decoded.id).select('-password')

            if (role === "student" && studentExist && studentExist.isVerified) {
                return res.json(
                    {
                        _id: studentExist._id,
                        firstName: studentExist.firstName,
                        lastName: studentExist.lastName,
                        email: studentExist.email,
                        role: 'student'

                    }
                );
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const student = await Student.findOne({ email, isVerified: true });
        if (!student) {
            return res.status(404).json({ err: 'Student not found' })
        }
        const resetToken = genToken(student._id);
        const subject = "Password Reset";
        const message = `You are receiving this email because you (or someone else) has requested the reset of the password for your account.
        Please click on the following link to reset your password:
        <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">Reset Password</a>`;
        const emailResponse = await sendEmail(email, message, subject);
        if (!emailResponse.success) {
            return res.status(500).json({ err: emailResponse.message });
        }
        return res.status(200).json({ message: 'Password reset link sent to your email' });

    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ err: "Internal Server Error" })
    }
}




exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (token == "") {
            return res.status(400).json({ err: 'Invalid reset token' });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ err: 'Invalid reset token' });
        }
        const student = await Student.findById(decoded.id);
        if (!student) {
            return res.status(404).json({ err: 'Student not found' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        student.password = hashedPassword;
        await student.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ err: 'Server error' });
    }
}