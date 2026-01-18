import Users from '../models/user.js';

export const protectRoute = async (req, res, next) => {
    console.log("[DEBUG] protectRoute called");
    console.log("[DEBUG] Session:", req.session);
    console.log("[DEBUG] isLoggedIn:", req.session?.isLoggedIn);
    console.log("[DEBUG] userId:", req.session?.userId);
    try {
        // if (!req.session || !req.session.isLoggedIn || !req.session.userId) {
        //     console.log("[DEBUG] Unauthorized: No valid session");
        //     return res.status(401).json({ message: "Unauthorized: No valid session" });
        // }

        const user = await Users.findById(req.session.userId).select('-password');

        // if (!user) {
        //     console.log("[DEBUG] Unauthorized: User not found");
        //     return res.status(401).json({ message: "Unauthorized: User not found" });
        // }

        req.user = user; // attach user to request
        console.log("[DEBUG] User attached to request:", user);
        next();
    } catch (err) {
        console.error("protectRoute error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
