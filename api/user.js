const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("joi");

/**
 * REST API endpoints for user
 * @param {*} app
 */
module.exports = (app) => {
  app.post("/signup", async (req, res) => {
    console.log("Hitting signup API...");
    // Validate the user input
    let { error } = validate(req.body);
    // Return 400 if the user input is incorrect
    if (error) return res.status(400).send(error.details[0].message);

    let { firstName, lastName, email, password } = req.body;

    // Salt and Hash
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Find if the user exists in the database
    let user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // Return 400 if the user already exists
    if (user) return res.status(400).send("User already registered.");

    let newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashed,
    };

    // Create a user in the database with the given data
    user = await prisma.user.create({ data: newUser });

    // Send handpicked user information as a result
    res.send(_.pick(user, ["id", "firstName", "lastName", "email"]));
  });

  function validate(req) {
    const schema = Joi.object({
      firstName: Joi.string().max(30).required(),
      lastName: Joi.string().max(30).required(),
      email: Joi.string().max(255).required().email(),
      password: Joi.string().min(5).max(255).required(),
    });

    return schema.validate(req);
  }
};
