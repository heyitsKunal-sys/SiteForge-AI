import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDb } from './config/db.js';
import authRouter from './routes/authRoutes.js';
import projectRouter from './routes/projectRoutes.js';
import communityRouter from './routes/communityRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';

const PORT = process.env.PORT || 4000;
const app = express();

// comma-separated list in env, e.g. FRONTEND_URL=https://siteforge.vercel.app,http://localhost:5173
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

//middlewares
app.use(cors({
    origin: (origin, callback) => {
        // allow server-to-server / curl / same-origin requests with no origin header
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(express.json({limit:"1mb"}))

// Db
connectDb();

// Routes
app.use('/api/auth' , authRouter);
app.use('/api/projects' , projectRouter);
app.use('/api/community', communityRouter);
app.use('/api/payments' , paymentRouter);

app.get('/', (req,res)=>{
    res.send("api working")
});

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
});