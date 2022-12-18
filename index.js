// Include Express
const express = require("express");

// Middlewares
var cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();

if (!process.env.jwtPrivateKey) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}

// Create an Express app
const app = express();

// Cors
app.use(cors());
app.options("*", cors());

// bodyparser, use qs library
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.send("This is User microservice.");
});

const userAPI = require("./api/user");
userAPI(app);

app.listen(3000, function () {
  console.log("server is successfully running!");
});
