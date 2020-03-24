const miningRoutes = require("./mining_routes");
const gettingRoutes = require("./getting_routes");

module.exports = function(app, dbWorker) {
    miningRoutes(app, dbWorker);
    gettingRoutes(app, dbWorker);
};