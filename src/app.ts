import express from "express";
import cors from "cors";
import http from "http";
import {initSocketServer} from "./socket/socket";
import {loginRoute} from "./controllers/login";
import logger from "./libs/logger";
import config from "./config/default";
import {registerRoute} from "./controllers/register";

const app = express();
const server = http.createServer(app);


app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());


app.use("/auth", registerRoute);
app.use("/auth", loginRoute);


initSocketServer(server);


server.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}`);
});
