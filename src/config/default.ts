import dotenv from 'dotenv';

dotenv.config();

export default {
    // apiKey: process.env.API_KEY || "default-api-key", // default api key is risky
    port: process.env.PORT || 4000,
    // apiBaseUrl: process.env.API_BASE_URL || 'http://api.weatherapi.com/v1',
    environment: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'my_secret_key',
    jwtExpireTime: process.env.JWT_EXPIRE_TIME || "1h",

    servesFront: process.env.SERVES_FRONT || true
    // swaggerURL: process.env.SWAGGER_URL || '/api-docs',
    // axios: {
    //     timeout: 10000,
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'responseType': 'json',
    //     }
    // }
};