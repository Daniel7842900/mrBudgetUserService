const jwt = require("jsonwebtoken");
const Joi = require("joi");
require("dotenv").config();

function generateAuthToken(payload) {
  const token = jwt.sign(payload, process.env.jwtPrivateKey);
  return token;
}

function validateSignup(req) {
  const schema = Joi.object({
    firstName: Joi.string().max(30).required(),
    lastName: Joi.string().max(30).required(),
    email: Joi.string().max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(req);
}

module.exports = {
  generateAuthToken: generateAuthToken,
  validateSignup: validateSignup,
};
