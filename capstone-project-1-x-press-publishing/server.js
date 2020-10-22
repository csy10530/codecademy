const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const errorhandler = require("errorhandler");

const apiRouter = require("./api/api.js");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(errorhandler());

app.use("/api", apiRouter);

module.exports = app;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));