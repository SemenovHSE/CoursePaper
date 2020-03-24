const mssql = require("mssql");
const YandexApiWorker = require("../classes/YandexApiWorker");
const FileWorker = require("../classes/FileWorker");

var Handler = function(app, dbWorker) {
    app.post("/houses", (req, res) => {
        console.log(req.body);
        res.send("Hello");
    });
    
    app.get("/add_data", async (req, res) => {
        var organizationToAdd = {
            "house": {
                "city": "TestCity",
                "street": "TestStreet",
                "number": "TestNumber",
                "latitude": 1,
                "longitude": 1
            },
            "name": "TestOrganizationName",
            "site": "TestSite",
            "schedule": "TestSchedule",
            "orgCategories": [ "TestOrgCetegory" ],
            "phones": [ "TestPhoneNumber" ]
        };
        console.log(organizationToAdd);
        await dbWorker.AddOrganizationToDatabase(organizationToAdd);
        res.send("Done!");
    });
    
    app.get("/add_house", async (req, res) => {
        var house = {
            "city": "TestCity",
            "street": "TestStreet",
            "number": "TestNumber",
            "latitude": 1,
            "longitude": 1
        };
        console.log(house);
        await dbWorker.AddRecordIfDoesntExistToHouseTable(house.city, house.street, house.number, house.latitude, house.longitude);
        res.send("Done!");
    });

    app.get("/add_organization", async (req, res) => {
        var organization = {
            "name": "TestOrganizationName1",
            "site": "TestSite1",
            "schedule": "TestSchedule1"
        };
        await dbWorker.AddRecordIfDoesntExistToOrganizationTable(organization.name, organization.site, organization.schedule);
        res.send("Done!");
    });

    app.get("/check_organization", async (req, res) => {
        var organization = {
            "name": "TestOrganizationName1",
            "site": "TestSite1",
            "schedule": "TestSchedule1"
        };
        var flag = await dbWorker.CheckIfRecordExistsInOrganizationTable(organization.name);
        console.log(flag);
        res.send(flag);
    });

    app.get("/add_house_org", async (req, res) => {
        var houseLatitude = 1;
        var houseLongitude = 1;
        var organizationName = "TestOrganizationName1";
        await dbWorker.AddRecordIfDoesntExistToHouseOrgsTable(houseLatitude, houseLongitude, organizationName);
        res.send("Done!");
    });

    app.get("/get_information", async (req, res) => {
        var result = YandexApiWorker.GetInformation("Пермь", "Бульвар Гагарина", "37а");
        res.send(result);
    });

    app.get("/get_houses_from_file", async (req, res) => {
        var result = FileWorker.ReadDataAboutHouses();
        res.send(result);
    });

    app.get("/update_data", async (req, res) => {
        await dbWorker.ClearDatabase();
        var response = [];
        var houses = FileWorker.ReadDataAboutHouses();
        for (let i = 0; i < houses.length; i++) {
            var currentHouse = houses[i];
            console.log(currentHouse);
            var informationAboutOrganizations = YandexApiWorker.GetInformation(currentHouse.city, currentHouse.street, currentHouse.number);
            console.log(informationAboutOrganizations);
            var house = informationAboutOrganizations.house;
            var organizations = informationAboutOrganizations.organizations;
            if (organizations.length == 0) {
                await dbWorker.AddHouseToDatabase(informationAboutOrganizations.house);
            }
            else {
                for (let j = 0; j < organizations.length; j++) {
                    var currentOrganization = organizations[j];
                    currentOrganization.house = house;
                    await dbWorker.AddOrganizationToDatabase(currentOrganization);
                }
            }
            response.push(informationAboutOrganizations);
        }
        res.send(response); 
    });
};

module.exports = Handler;