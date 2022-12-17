// import { PrismaClient, Prisma } from "@prisma/client";
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * REST API endpoints for user
 * @param {*} app
 */
module.exports = (app) => {
  app.post("/signup", async (req, res) => {
    console.log("hitting signup api...");
    console.log(req);
    console.log(req.body);
    const user = await prisma.user.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      },
    });
  });
};
