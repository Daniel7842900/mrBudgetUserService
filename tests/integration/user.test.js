const { PrismaClient } = require("@prisma/client");
const request = require("supertest");
const prisma = new PrismaClient();
const app = require("../../index");
require("dotenv").config();

describe("/user", () => {
  describe("POST /signup", () => {
    describe("successful when user input is passed", () => {
      it("should return 200 if an account is successfully created", async () => {
        const response = await request(app).post("/signup").send({
          firstName: "test",
          lastName: "test",
          email: "test@test.com",
          password: "test123",
        });

        expect(response.statusCode).toBe(200);

        await prisma.user.delete({
          where: {
            email: "test@test.com",
          },
        });
      });

      // it("should save the firstName, lastName, email, and password to the database", async () => {
      //   const bodyData = [
      //     {
      //       firstName: "firstTest1",
      //       lastName: "lastTest1",
      //       email: "test1@test.com",
      //       password: "test1",
      //     },
      //     {
      //       firstName: "firstTest2",
      //       lastName: "lastTest2",
      //       email: "test2@test.com",
      //       password: "test2",
      //     },
      //     {
      //       firstName: "firstTest3",
      //       lastName: "lastTest3",
      //       email: "test3@test.com",
      //       password: "test3",
      //     },
      //     {
      //       firstName: "firstTest4",
      //       lastName: "lastTest4",
      //       email: "test4@test.com",
      //       password: "test4",
      //     },
      //   ];
      //   for (const body of bodyData) {
      //     createUser.mockReset();
      //     await request(app).post("/signup").send(body);
      //     console.log(createUser);
      //     console.log(createUser.mock);
      //     console.log(createUser.mock.calls);
      //     expect(createUser.mock.calls.length).toBe(1);

      //     await prisma.user.delete({
      //       where: {
      //         email: body.email,
      //       },
      //     });
      //   }
      // });
    });

    describe("fail when user input is not passed", () => {
      it("should return 400 when one of the user inputs is not passed", async () => {
        const userInputs = [
          { firstName: "firstTest" },
          { lastName: "lastTest" },
          { email: "test5@test.com" },
          { password: "test123" },
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
          email: "test6@test.com",
          password: "test1",
        };

        await prisma.user.create({
          data: body,
        });

        const response = await request(app).post("/signup").send(body);

        expect(response.statusCode).toBe(400);

        await prisma.user.delete({
          where: {
            email: "test6@test.com",
          },
        });
      });
    });
  });
});
