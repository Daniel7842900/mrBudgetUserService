const { PrismaClient } = require("@prisma/client");
const request = require("supertest");
const prisma = new PrismaClient();
const app = require("../../index");
const UserRepository = require("../../database/repository/user");
const {
  generateSalt,
  generateHash,
  generateAuthToken,
} = require("../../utils/index");
require("dotenv").config();

describe("/user", () => {
  beforeAll(async () => {
    const userRepo = new UserRepository();
  });

  describe("POST /signup", () => {
    describe("successful when user input is valid", () => {
      it("should return 200 and create the user", async () => {
        let password = "test123";
        let salt = await generateSalt();
        let hashed = await generateHash(password, salt);
        const response = await request(app).post("/signup").send({
          firstName: "test",
          lastName: "test",
          email: "test@test.com",
          password: hashed,
        });

        const { statusCode, body } = response;
        const token = generateAuthToken({ id: body.id });

        expect(statusCode).toBe(200);

        expect(body).toMatchObject({
          firstName: "test",
          lastName: "test",
          email: "test@test.com",
        });

        await prisma.user.delete({
          where: {
            email: "test@test.com",
          },
        });
      });
    });

    describe("fail when user input is invalid", () => {
      it("should return 400 when one of the user inputs is not passed", async () => {
        const userInputs = [
          { firstName: "firstTest" },
          { lastName: "lastTest" },
          { email: "test2@test.com" },
          { password: "test2" },
        ];

        for (const input of userInputs) {
          const response = await request(app).post("/signup").send(input);

          expect(response.statusCode).toBe(400);
        }
      });

      it("should return 400 when the user already exists", async () => {
        const body = {
          firstName: "firstTest",
          lastName: "lastTest",
          email: "test3@test.com",
          password: "test3",
        };

        await prisma.user.create({
          data: body,
        });

        const response = await request(app).post("/signup").send(body);

        expect(response.statusCode).toBe(400);

        await prisma.user.delete({
          where: {
            email: "test3@test.com",
          },
        });
      });
    });
  });

  describe("POST /login", () => {
    describe("successful when user input is valid", () => {
      it("should return 200 if the user input is valid", async () => {
        let password = "test123";
        let salt = await generateSalt();
        let hashed = await generateHash(password, salt);
        const body = {
          firstName: "firstTest",
          lastName: "lastTest",
          email: "test4@test.com",
          password: hashed,
        };

        await prisma.user.create({
          data: body,
        });

        const response = await request(app)
          .post("/login")
          .send({
            email: "test4@test.com",
            password: "test123",
          })
          .expect(200);

        await prisma.user.delete({
          where: {
            email: "test4@test.com",
          },
        });
      });
    });

    describe("fail when user input is not valid", () => {
      it("should return 400 if the user input is not valid", async () => {
        let password = "test123";
        let salt = await generateSalt();
        let hashed = await generateHash(password, salt);
        const body = {
          firstName: "firstTest",
          lastName: "lastTest",
          email: "test5@test.com",
          password: hashed,
        };

        await prisma.user.create({
          data: body,
        });

        const inputs = [
          { email: "test5@gmail.com", password: hashed },
          { email: "test5@test.com", password: "invalid" },
        ];

        for (const input of inputs) {
          const response = await request(app)
            .post("/login")
            .send(input)
            .expect(400);
        }

        await prisma.user.delete({
          where: {
            email: "test5@test.com",
          },
        });
      });
    });
  });
});
