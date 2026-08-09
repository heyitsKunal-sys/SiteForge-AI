import { Router } from "express";
import { User } from "../models/User.js";
import { generateOtp, sendOtpEmail } from "../utils/services.js";


const router = Router();

// to forgot password:'
router.post('/request',async (req , res , next)=>{
    try {
        const email = (req.body.email || "").trim().toLowerCase();
        if(!email) return res.status(400).json({error: "Email is required"});

        const user = await User.findOne({email});
        if(!user) return res.status(400).json({error:"No account found with that email"});

        const code = generateOtp();
        saveOtp(email,code);
        await sendOtpEmail({to: user.email , name : user.name , code})
        res.json({ok: true , email: user.email});
    } catch (err) {
        next(err);
        
    }
})

//  to verify the code