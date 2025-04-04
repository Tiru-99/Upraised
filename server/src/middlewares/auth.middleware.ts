import {Request, Response , NextFunction} from 'express';
import jwt, {JwtPayload } from 'jsonwebtoken';
import prisma from '../utils/prisma';
import logger from '../utils/logger';

//defining id as string in jwtpayload as there is no id type in JwtPayload type
interface CustomJwt extends JwtPayload { 
    id : string
}

export const verifyJWT = async(req : Request , res : Response , next : NextFunction) => {
    //splitting the bearer token
    const token = req.header("Authorization")?.split(" ")[1] || req.cookies.jwtToken;

    if(!token){
        logger.error("Incoming token not found");
        res.status(401).json({
            message : "Incoming Token not found"
        })
        return; 
    }

    try{
        const decodedToken : JwtPayload =  jwt.verify(token , process.env.JWT_SECRET!) as CustomJwt ;

        const existingUser = await prisma.user.findUnique({
            where : {
                id : decodedToken?.id
            }
        });

        (req as any).user = existingUser;
        next();
    }catch(e){
        logger.error("Invalid Token" , e);
        res.status(400).json({ error: "Invalid token" });
    }
}