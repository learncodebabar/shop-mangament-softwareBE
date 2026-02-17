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
//   MONGO_URI: process.env.MONGO_URI,
  MONGO_URI:'mongodb://localhost:27017/mern',
//   JWT_SECRET: process.env.JWT_SECRET,
  JWT_SECRET:'e87b055a87cea13b087f9faaac69529f18dbb84131df39ed237abae07650b77e3efb778de554a311cc9eb772584ae8a422d162ef184444d9fcf976e80969147a',
//   EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_USER: 'razakomal253@gmail.com',
//   EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
  EMAIL_PASSWORD: 'kzpeuytunsojtpzo'
};

