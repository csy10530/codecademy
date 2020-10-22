const apiRouter = require("express").Router();
const artistRouter = require("./artist.js");
const seriesRouter = require("./series.js");

apiRouter.use("/artists", artistRouter);
apiRouter.use("/series", seriesRouter);

module.exports = apiRouter;