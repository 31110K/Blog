import express from "express";
import Users from '../models/user.js';
import { check, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { protectRoute } from '../middlewares/auth_middleware.js';

const auth_router = express.Router();


auth_router.post('/login', async (req, res) => {
    console.log(req.url, req.method, "alok");

    const { email, password } = req.body;

    try {
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Wrong Credentials" });
        }

        const matches = await bcrypt.compare(password, user.password);

        if (!matches) {
            console.log("password is incorrect");
            return res.status(400).json({ message: "Wrong Credentials" });
        }

        // ✅ Store only userId in session
        req.session.isLoggedIn = true;
        req.session.userId = user._id;

        res.status(200).json({ success: true, message: "Login successful" });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

auth_router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Logout successful" });
    });
});

auth_router.post('/signup',
    check("name")
        .trim()
        .isLength({ min: 2 }).withMessage("Name should be at least two characters long.")
        .matches(/^[A-Za-z\s]+$/).withMessage("Name should contain only alphabets and spaces."),

    check("email")
        .isEmail().withMessage("Please enter a valid email")
        .normalizeEmail(),

    check("phone")
        .trim()
        .isLength({ min: 10, max: 10 }).withMessage("Phone number should be of 10 digits")
        .matches(/^[0-9]+$/).withMessage("Phone should contain only numbers"),

    check("password")
        .isLength({ min: 8 }).withMessage("Password should be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Include one uppercase letter")
        .matches(/[a-z]/).withMessage("Include one lowercase letter")
        .matches(/[0-9]/).withMessage("Include one number")
        .matches(/[!@#$%&]/).withMessage("Include at least one symbol (!@#$%&)"),

    check("confirm_password")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    check("user_type")
        .notEmpty().withMessage("Please select a user type")
        .isIn(['guest', 'host']).withMessage("Invalid user type"),

    async (req, res) => {
        try {
            console.log(req.method, req.url);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, phone, password, user_type } = req.body;

            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new Users({ name, email, phone, password: hashedPassword, user_type });

            await user.save();

            return res.status(201).json({ success: true, message: "Signup successful" });

        } catch (error) {
            console.error("Signup Error:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

auth_router.get('/check', protectRoute, (req, res) => {
    try {
        res.status(200).json(req.user); // user is attached by middleware
    } catch (error) {
        console.log("error in check auth controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default auth_router;
