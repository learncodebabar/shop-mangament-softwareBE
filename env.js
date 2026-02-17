// Change from ES6 exports to CommonJS
// export const PORT = process.env.PORT;
// export const MONGO_URI = process.env.MONGO_URI;
// export const JWT_SECRET = process.env.JWT_SECRET;
// export const EMAIL_USER = process.env.EMAIL_USER;
// export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

require("dotenv").config();

// Use CommonJS module.exports
module.exports = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
};