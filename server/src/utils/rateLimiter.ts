import rateLimit from "express-rate-limit";

//rate limiting middleware
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: {
        status: 429,
        message: "Too many requests. Please try again later.",
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

export default rateLimiter;
