const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Repository layer for User
class UserRepository {
  constructor() {}

  async createUser(user) {
    // Create a user in the database with the given data
    let newUser = await prisma.user.create({ data: user });
    return newUser;
  }

  async findUser(email) {
    // Find the user in the database
    let user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    return user;
  }
}

module.exports = UserRepository;
