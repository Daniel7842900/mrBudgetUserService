const { PrismaClient, Prisma, User } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const createError = require("http-errors");
const { generateAuthToken } = require("../utils/index");
const UserService = require("../services/user");
require("dotenv").config();

/**
 * REST API endpoints for user
 * @param {*} app
 */
module.exports = (app) => {
  const service = new UserService();

  app.post(
    "/signup",
    asyncHandler(async (req, res, next) => {
      console.log("Hitting signup API...");
      let result;
      try {
        result = await service.signUp(req.body);
      } catch (error) {
        return next(error);
      }

      // Deconstruct from the result from the service
      const { user, token } = result;

      // Send handpicked user information as a result
      res
        .header("x-auth-token", token)
        .send(_.pick(user, ["id", "firstName", "lastName", "email"]));
    })
  );

  app.post("/login", async (req, res) => {
    console.log("Hitting login API...");
    let { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let { email, password } = req.body;

    let user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // Return 400 if the user doesn't exist
    if (!user) return res.status(400).send("Invalid email or password.");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).send("Invalid email or password.");

    const token = generateAuthToken({ id: user.id });

    res.send(token);
  });

  function validateLogin(req) {
    const schema = Joi.object({
      email: Joi.string().max(255).required().email(),
      password: Joi.string().min(5).max(255).required(),
    });

    return schema.validate(req);
  }

  app.use((error, req, res, next) => {
    // Sets HTTP status code
    res.status(error.status);

    // Sends response
    res.json({
      status: error.status,
      message: error.message,
      stack: error.stack,
    });
  });
};
