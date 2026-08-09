import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { generateOtp, saveOtp, sendOtpEmail, verifyOtp } from '../utils/services.js';


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

// verify the opt and make user verified:
export async function verifyRegister(req, res, next) {
    try {
        const { email, code } = req.body;
        if (!email || !code)
            return res.status(400).json({ error: "email and code is not verified" })

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ error: "no account found with email" });

        if (user.emailVerified)
            return res.json({ ok: true, alreadyVerified: true });

        const result = verifyOtp(email, code);
        if (!result.ok) return res.status(400).json({ error: result.reason });

        user.emailVerified = true;
        await user.save();
        res.josn({ ok: true });

    } catch (error) {
        next(err);
    }

}

// to resend the otp or if user register but forgots to verify
// we can re-verify 