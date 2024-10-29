const express = require("express");
const Cors = require("cors");

const app = express();
Cors(app, {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
});
