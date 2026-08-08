import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { generateOtp, saveOtp, sendOtpEmail } from '../utils/services.js';


// issue an otp and sent it to the email:
async function issueAndSend(email, name, status, res, code = 201) {
    const opt = generateOtp();
    saveOtp(email, otp);
    await sendOtpEmail({ to: email, name, code: otp, purpose: status });
    return res.status(code).json({ ok: true, email })
}


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
            return res.status(400).json
                ({
                    error: "Email already in use"
                });
            return issueAndSend(email, existing.name, "signup", res, 200);
        }

        const user = await User.create({
            name,
            email,
            passwordHash: await User.hashPassword(password),
            emailVerified: false,
        });
        return issueAndSend(user.email, user.name, 'signup', res, 201);


    }
    catch (error) {
        next(err);

    }
}

// verified the opt and make user verified:
