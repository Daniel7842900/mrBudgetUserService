const _ = require("lodash");
const asyncHandler = require("express-async-handler");
const UserService = require("../services/user");

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

  app.post(
    "/login",
    asyncHandler(async (req, res, next) => {
      console.log("Hitting login API...");

      let result;
      try {
        result = await service.logIn(req.body);
      } catch (error) {
        return next(error);
      }

      // Send a result (token)
      res.send(result);
    })
  );

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
