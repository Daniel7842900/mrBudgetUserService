const UserRepository = require("../database/repository/user");
const {
  validateSignup,
  validateLogin,
  validatePassword,
  generateAuthToken,
  generateSalt,
  generateHash,
} = require("../utils/index");
const createError = require("http-errors");

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

    // Deconstruct userInput
    const { firstName, lastName, email, password } = userInput;

    // Find if the user exists in the database
    let user = await this.repository.findUser(email);

    // Return 400 if the user already exists
    if (user) throw createError(400, "User already registered.");

    // Generate Salt and Hash
    const salt = await generateSalt();
    const hashed = await generateHash(password, salt);

    let newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashed,
    };

    // Create a user in the database with the given data
    user = await this.repository.createUser(newUser);

    // Generate a token
    const token = generateAuthToken({ id: user.id });

    if (token) return { user, token };
  }

  async logIn(userInput) {
    // Validate the user input
    let { error } = validateLogin(userInput);

    // Return 400 if the user input is incorrect
    if (error) throw createError(400, error.details[0].message);

    // Deconstruct the userInput
    let { email, password } = userInput;

    // Find if the user exists in the database
    let user = await this.repository.findUser(email);

    // Return 400 if the user doesn't exist in the database
    if (!user) throw createError(400, "Invalid email or password.");

    // Validate the password
    const validPassword = await validatePassword(password, user.password);

    // Return 400 if the password is not valid
    if (!validPassword) throw createError(400, "Invalid email or password.");

    // Generate a token
    const token = generateAuthToken({ id: user.id });

    if (token) return token;
  }
}

module.exports = UserService;
