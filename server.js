const express = require("express");
const mssql = require("mssql");
const mssqlConfig = require("./config/MSSQLConfig")
const MSSQLWorker = require("./application/classes/MSSQLWorker");

const app = express();
const port = 8000;

(async function() {
    try {
        var pool = await mssql.connect(mssqlConfig);
        require("./application/routes")(app, MSSQLWorker(pool));
        app.listen(port, () => {
            console.log("Server is live!");
        });
    }
    catch (error) {
        console.log(error);
    }
})();