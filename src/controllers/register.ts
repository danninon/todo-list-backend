import express, {Request, Response} from "express";
import bcrypt from "bcrypt";
import logger from "../libs/logger";


import {getUser, setUser} from "../db/usersDal";

const router = express.Router();

const saltRounds = 10
// @ts-ignore
router.post("/register", async (req: Request, res: Response) => {
    logger.info("Received register request");

    const {userId, password} = req.body;

    logger.info(`Received register request: username=${userId}, password=${password}`);
    try {
        const {userId, password} = req.body
        const exists = await getUser(userId);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        if (exists) {
            const errorMsg = `User: ${userId} Already exists`;
            logger.warn(errorMsg)
            return res.status(400).json(errorMsg);
        }
        await setUser({userId, password: hashedPassword})
        logger.info(`User ${userId} registered with hashed password.`);
        return res.status(200).json({message: "Registered successfully"});
    } catch (error) {
        logger.error({error});
        return res.status(500).json({error});
    }
});

export const registerRoute = router;
