import express from 'express';
import { Request , Response } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression'
import { connectRedis } from './utils/redis';
import rateLimiter from './utils/rateLimiter';
import dotenv from 'dotenv';

dotenv.config({
    path : './.env'
});

const app = express(); 

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
//to compress api requests
app.use(compression());
app.use(cookieParser())
//rate limiter
app.use(rateLimiter);


app.get('/health' , (req : Request , res : Response)=>{
    res.send({
        message : "The server is ok!"
    })
});

const PORT = 8080 ; 

//Connect redis on startup
(async () => {
    await connectRedis(); 
})();

//routes 
import authRoutes from './routes/auth.routes';
import gadgetRoutes from './routes/gadget.routes'

app.use("/api/v1/auth" , authRoutes);
app.use("/api/v1/gadget" , gadgetRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
