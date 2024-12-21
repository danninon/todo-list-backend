import dotenv from 'dotenv';

dotenv.config();

export default {
    // apiKey: process.env.API_KEY || "default-api-key", // default api key is risky
    port: process.env.PORT || 4000,
    // apiBaseUrl: process.env.API_BASE_URL || 'http://api.weatherapi.com/v1',
    environment: process.env.NODE_ENV || 'development',
    // swaggerURL: process.env.SWAGGER_URL || '/api-docs',
    // axios: {
    //     timeout: 10000,
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'responseType': 'json',
    //     }
    // }
};