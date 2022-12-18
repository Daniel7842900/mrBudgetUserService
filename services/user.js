const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const UserRepository = require("../database/repository/user");
const { validateSignup, generateAuthToken } = require("../utils/index");
const createError = require("http-errors");
const bcrypt = require("bcrypt");

// Service layer for User
class UserService {
  constructor() {
    this.repository = new UserRepository();
  }

  async signUp(userInput) {
    // Validate the user input
    let { error } = validateSignup(userInput);

    // Return 400 if the user input is incorrect
    if (error) throw createError(400, error.details[0].message);

    // Deconstruct user inputs from req.body
    const { firstName, lastName, email, password } = userInput;

    // Find if the user exists in the database
    let user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // Return 400 if the user already exists
    if (user) throw createError(400, "User already registered.");

    // Salt and Hash
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    let newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashed,
    };

    // Create a user in the database with the given data
    user = await prisma.user.create({ data: newUser });

    // Generate a token
    const token = generateAuthToken({ id: user.id });

    if (token) return { user, token };
  }
}

module.exports = UserService;
