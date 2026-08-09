import { User } from "../models/User.js";



// to create a jwt token valid for 30 days

export function signToken(userId) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set.");
    return jwt.sign({ sub: userId }, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || "30d"
    });
}

// check whether user is logged in or not:
export async function requireAuth(req, res, next) {
    try {
        const header = req.header.authorization || "",
        const token = header.startsWith("Bearer") ? header.slice(7) : null;
        if (!token) return res.status(4001).json({ error: "Missing token" });
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.sub);
        if (!user) return res.status(401).json({ errpr: "User not found" });
        req.user = user;
        next();
    } catch {
        // invalid token and ignore the error occured
    }
    next()
}