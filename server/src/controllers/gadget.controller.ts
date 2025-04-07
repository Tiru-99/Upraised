import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { gadgetType, gadgetsCodeName } from "../utils/variables";
import client from "../utils/redis";
import { GadgetType } from "../utils/types";
import logger from "../utils/logger";
import { GadgetStatus } from "@prisma/client";

// add a gadget
export const addGadget = async (req: Request, res: Response) => {
    logger.info("/add-gadget route hit !")
    const randomGadgetCodeName = gadgetsCodeName[Math.floor(Math.random() * gadgetsCodeName.length)];
    const randomGadgetType = gadgetType[Math.floor(Math.random() * gadgetType.length)];

    if (!randomGadgetCodeName || !randomGadgetType) {
        logger.warn("Gadget code name or gadget type not available");
        return;
    }

    try {
        const gadget = await prisma.gadget.create({
            data: {
                name: randomGadgetCodeName,
                type: randomGadgetType,
                status: "AVAILABLE"
            }
        });
        //delete the pre-exisiting cache
        await client.del("gadgets");
        logger.info("Gadget inserted successfully! ")

        res.status(200).send({
            message: "Gadget inserted successfully",
            gadget: gadget
        });

    } catch (error) {
        logger.error("Something went wrong while creating a gadget" , error);
        res.status(500).send({
            message: "Something went wrong while creating the gadget",
            error: error
        });
    }
}

//retrieve all gadgets
export const retrieveGadgets = async (req: Request, res: Response) => {
    logger.info("/get-gadgets route hit !");
    try {
        let gadgets ;
        //check if the gadgets are availble in the redis cache 
        const cacheValue = await client.get("gadgets");

        if (cacheValue) {
            console.log("Cache Hit!")
            gadgets = JSON.parse(cacheValue);
        } else {
            gadgets = await prisma.gadget.findMany();
            console.log("Cache Miss ! Fetching from the database ");
            await client.setEx("gadgets", 60, JSON.stringify(gadgets));
        }

        const gadgetsWithProbability = gadgets.map((gadget : GadgetType) => ({
            ...gadget,
            mission_success_probability: `${Math.floor(Math.random() * 100) + 1} %`
        }));

        logger.info("Gadgets fetched successfully!")
        res.status(200).send({
            message: "Gadgets fetched successfully!",
            gadgets: gadgetsWithProbability,
        });
    } catch (error) {
        logger.error("Something went wrong while fetching the gadgets" , error);
        res.status(404).send({
            message: "Something went wrong while fetching the gadgets"
        });
    }
};

//update gadget by id param 
export const updateGadget = async (req: Request, res: Response) => {
    logger.info("/update-gadget route hit !")
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (Object.keys(updateData).length === 0) {
            logger.warn("No updated field provided")
            res.status(400).send({
                message: "No updated fields provided"
            });
        }

        const existingGadget = await prisma.gadget.findFirst({
            where: { id }
        });

        if (!existingGadget) {
            logger.warn("Gadget with this id does not exists");
            res.status(403).send({
                message: "Gadget with this id does not exists"
            });
            return;
        }

        //update gadgets 
        const updatedGadget = await prisma.gadget.update({
            where: { id },
            data: updateData
        });
        //delete existing database key
        await client.del("gadgets");
        logger.info("Gadget updated successfully");

        res.status(200).send({
            message: "Gadget updated successfully",
            updatedGadget: updatedGadget
        })
    } catch (error) {
        logger.error("Something went wrong while updating the gadget" , error);
        res.status(500).send({
            message: "Something went wrong while updating the gadget",
            error: error
        });
    }
}

//delete gadget functionality
export const deleteGadget = async (req: Request, res: Response) => {
    logger.info("/delete-gadget route hit ! ")
    try {
        const decomissionedAt = new Date().toISOString();
        const { id } = req.params;

        const existingGadget = await prisma.gadget.findFirst({
            where: { id }
        });

        if (!existingGadget) {
            logger.info("Gadget with this id does not exists");
            res.status(403).send({
                message: "Gadget with this id does not exists"
            });
        }
        
        const updateGadgetStatus = await prisma.gadget.update({
            where: { id },
            data: {
                status: "DECOMISSIONED",
                decomissionedAt : decomissionedAt
            }
        });

        logger.info("Gadget decommissioned");

        res.status(200).send({
            message: "Gadget decommissioned",
            decomissionedAt : decomissionedAt,
            decommisionedGadget: updateGadgetStatus
        })
    } catch (error) {
        logger.error("Something went wrong while decommisioning the gadget" ,error );
        res.status(500).send({
            message: "Something went wrong while decommisioning the gadget",
            error: error
        });
    }
}

//utility function to generate confirmation code
const generateConfirmationCode = (length: number) => {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let code = '';

    for (let i = 0; i < length; i++) {
        code += characters[(Math.floor(Math.random() * characters.length) + 1)];
    }

    return code;
}

//self destruct sequence
export const handleSelfDestruct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const code = generateConfirmationCode(6);
  
    if (!code || !id) {
      logger.warn("Either code or the id is missing");
      res.status(400).send({ message: "Missing code or id" });
      return; 
    }
  
    try {
      const gadget = await prisma.gadget.findUnique({
        where: { id },
      });
  
      if (!gadget) {
        logger.warn(`Gadget with id ${id} not found`);
        res.status(404).send({ message: "Gadget not found" });
        return; 
      }
  
      if (gadget.status === "DESTROYED") {
        logger.info("Gadget is already destroyed");
        res.status(200).send({
          message: "Gadget is already destroyed",
          gadget,
        });
        return ;
      }
  
      const updatedGadget = await prisma.gadget.update({
        where: { id },
        data: {
          status: "DESTROYED",
        },
      });
  
      logger.info("Self Destruction Completed!");
      res.status(200).send({
        message: "Self Destruction Completed!",
        gadget: updatedGadget,
        confirmation_code: code,
      });
  
    } catch (error) {
      logger.error("Something went wrong while self destructing", error);
      res.status(500).send({
        message: "Something went wrong during self destruction",
        error,
      });
    }
  };
  
  //filter gadgets by Status
export const filterGadgetsByStatus = async (req: Request, res: Response) => {
    logger.info("/gadgets/filter route hit!");

    try {
        const { status } = req.query;

        if (!status) {
            logger.warn("No status provided in query params");
            res.status(400).json({
                message: "Please provide a valid gadget status.",
            });
            return; 
        }

        let inputStatus = String(status).toUpperCase();

        const validStatuses = ["AVAILABLE" , "DEPLOYED" , "DESTROYED" , "DECOMISSIONED"];

        if(!validStatuses.includes(inputStatus)){
            logger.error("Invalid status type");
            res.status(404).send({
                message : "Invalid Status type"
            });
            return ; 
        } 

        // Construct cache key
        const cacheKey = `gadgets:${status}`;
        const cacheValue = await client.get(cacheKey);

        let gadgets;

        if (cacheValue) {
            logger.info(`Cache Hit for status: ${status}`);
            gadgets = JSON.parse(cacheValue);
        } else {
            
            gadgets = await prisma.gadget.findMany({
                where: { status: inputStatus as GadgetStatus }, 
            });

            if (!gadgets.length) {
                logger.warn(`No gadgets found with status: ${status}`);
                res.status(404).json({
                    message: `No gadgets found with status: ${status}`,
                });
                return ;
            }

            logger.info(`Cache Miss! Fetching gadgets with status: ${status}`);
            await client.setEx(cacheKey, 30, JSON.stringify(gadgets)); 
        }

        res.status(200).json({
            message: `Gadgets with status '${status}' retrieved successfully!`,
            gadgets,
        });
    } catch (error) {
        logger.error("Error fetching gadgets by status", error);
        res.status(500).json({
            message: "Something went wrong while fetching gadgets by status",
            error,
        });
    }
};
