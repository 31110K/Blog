import Users from '../models/user.js';

export const protectRoute = async (req, res, next) => {
    console.log(req.session , req.session.isLoggedIn , req.session.userId)
    try {
        if (!req.session || !req.session.isLoggedIn || !req.session.userId) {
            return res.status(401).json({ message: "Unauthorized: No valid session" });
        }

        const user = await Users.findById(req.session.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        req.user = user; // attach user to request
        next();
    } catch (err) {
        console.error("protectRoute error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
