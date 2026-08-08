import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDb } from './config/db.js';

const PORT = 4000;
const app = express();

//middlewares
app.use(cors());
app.use(express.json({limit:"1mb"}))


// Db
connectDb();

// Routes
app.get('/', (req,res)=>{
    res.send("api working")
});

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
});