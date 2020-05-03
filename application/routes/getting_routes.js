var Handler = function(app, dbWorker) {
    
    app.get("/test", (req, res) => {
        res.send("Hello, Azure!");
    });

    app.get("/houses/get_information", async (req, res) => {
        var requestQuery = req.query;
        if (!requestQuery.hasOwnProperty("city") || !requestQuery.hasOwnProperty("street") || !requestQuery.hasOwnProperty("number")) {
            res.sendStatus(400);
            return;
        }
        var city = requestQuery.city;
        var street = requestQuery.street;
        var number = requestQuery.number;
        var organizations = await dbWorker.GetInformationAboutAllOrganizationsInHouseByHouseInformation(city, street, number);
        res.send(organizations);
    });

    app.get("/houses/get_information/:id", async (req, res) => {
        var requestParams = req.params;
        if (!requestParams.hasOwnProperty("id")) {
            res.sendStatus(400);
            return;
        }
        var id = requestParams.id;
        var organizations = await dbWorker.GetInformationAboutAllOrganizationsInHouseByHouseId(id);
        res.send(organizations);
    });

    app.get("/organization/get_information", async (req, res) => {
        var requestQuery = req.query;
        if (!requestQuery.hasOwnProperty("city") || !requestQuery.hasOwnProperty("street") || !requestQuery.hasOwnProperty("number")
                                                                                           || !requestQuery.hasOwnProperty("organizationName")) {
            res.sendStatus(400);
            return;
        }
        var city = requestQuery.city;
        var street = requestQuery.street;
        var number = requestQuery.number;
        var organizationName = requestQuery.organizationName;
        var organization = await dbWorker.GetInformationAboutOrganizationInHouse(city, street, number, organizationName);
        res.send(organization);
    });

    app.get("/house/get_information", async (req, res) => {
        var requestQuery = req.query;
        if (!requestQuery.hasOwnProperty("city") || !requestQuery.hasOwnProperty("street") || !requestQuery.hasOwnProperty("number")) {
            res.sendStatus(400);
            return;
        }
        var city = requestQuery.city;
        var street = requestQuery.street;
        var number = requestQuery.number;
        var house = await dbWorker.GetInformationAboutHouse(city, street, number);
        res.send(house);
    });

    app.get("/organizations/get_information", async (req, res) => {
        var requestQuery = req.query;
        if (!requestQuery.hasOwnProperty("organizationName")) {
            res.sendStatus(400);
            return;
        }
        var organizationName = requestQuery.organizationName;
        var organizations = await dbWorker.GetInformationAboutAllOrganizationsInAllHouses(organizationName);
        res.send(organizations);
    });
}

module.exports = Handler;