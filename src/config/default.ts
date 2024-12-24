import dotenv from 'dotenv';

dotenv.config();

export default {

    port: process.env.PORT || 4000,

    environment: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'my_secret_key',
    jwtExpireTime: process.env.JWT_EXPIRE_TIME || "1h",

    servesFront: process.env.SERVES_FRONT || true


};