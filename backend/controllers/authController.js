import { User } from "../models/User.js";
import { Project } from "../models/Project.js";


// issue an otp and sent it to the email:


// register a user and send opt:
export async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(404).json({
                message: "All fields are required"
            })
        }
        if (name.length < 2)
            return res.status(400).json({
                error: " Name must be atleast of 2 character"

            })
        if (password < 6)
            return res.status(400).json({
                error: "Password length must be atleast of 6 character"
            })
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: "Email already in use" })
        }


    }
    catch (error) {

    }
}
