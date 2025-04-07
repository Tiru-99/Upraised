import { Request , Response } from "express";
import bcrypt from 'bcrypt';
import prisma from "../utils/prisma";
import jwt from 'jsonwebtoken'
import logger from "../utils/logger";

//Sign up handler
export const handleSignUp = async(req :Request , res:Response) => {
    logger.info("/sign up route hit !");
    const{ username , email , password} = req.body ;

    if(!username || !email || !password){
        logger.warn("Incomplete user details in signup route")
        return ; 
    }

   try {
     const userExists = await prisma.user.findFirst({
         where: {
           OR: [
             { email: email },
             { username: username }
           ]
         }
     });

     if(userExists){
        res.status(500).send({
            message:"User with this email or username already exists"
        });
        logger.warn("User with this email or username already exists !");
        return ; 
    }

   } catch (error) {
    logger.error("Something went wrong finding the existing user !");
    res.status(500).send({
        message : "Something went wrong while finding the existing user"
    })
   }
    const hashedPassword = await bcrypt.hash(password , 10);

    try {
        console.log("the code is coming here 5");
        const user = await prisma.user.create({
            data :{
                email , 
                username : username, 
                password : hashedPassword
            }
        });

        logger.info("User created successfully");

        res.status(200).send({
            message : "User created successfully",
            data : user 
        })
    } catch (error) {
        logger.error("Something went wrong while signing up " , error)
        res.status(401).send({
            message : "Something went wrong while signing in" , 
            error : error 
        });
    }
}

//login handler
export const handleLogin = async(req : Request , res: Response) => {
    logger.info("login route hit !")
    const {email , password} = req.body ;
    
    if(!email || !password){
        logger.warn("Incomplete user details in the login route !")
        return ;
    }

  try {
      const existingUser = await prisma.user.findFirst({
          where :{
              email : email
          }
      });
  
      if(!existingUser){
          logger.warn("User does not exists!");
          res.send({
              message : "User with this email does not exists"
          });
          return; 
      }
      const comparePassword = await bcrypt.compare(password , existingUser?.password);
  
      if(!comparePassword){
          logger.error("Incorrect Password");
          res.send({
              messeage : "Incorrect Password or Email!"
          });
          return ; 
      }
      const jwtToken = jwt.sign({id : existingUser.id} , process.env.JWT_SECRET!);
      const options = {
          httpOnly : true , 
          secure : true 
      }
      res.status(200)
      .cookie("jwtToken" , jwtToken , options)
      .send({
          message : "User logged in successfully ! ",
          jwt : jwtToken , 
          userId : existingUser.id ,
          email : existingUser.email
      });
  } catch (error) {
    logger.error("Something went wrong while loggin in!" , error);
    res.send({
        message : "Something went wrong while logging in!",
        error : error
    });
  }
}

//logout handler
export const logout = (req: Request, res: Response) => {
    logger.info("logout route hit !")
    res.clearCookie("jwtToken", {
        httpOnly: true,
        secure: true, // Set to true if using HTTPS
        sameSite: "strict",
    });

    res.status(200).send({
        message: "Logged out successfully!",
    });
};