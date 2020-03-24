const mssql = require("mssql");

var MSSQLWorker = function(database) {
    async function AddRecordToPhoneTable(phone) {
        var result = await database.request()
                         .input("phone", mssql.NVarChar, phone)
                         .query("INSERT INTO Phone (Phone) VALUES (@phone)");
    }

    async function AddRecordToOrganizationTable(name, site, schedule) {
        console.log("Here!");
        var result = await database.request()
                         .input("name", mssql.NVarChar, name)
                         .input("site", mssql.NVarChar, site)
                         .input("schedule", mssql.NVarChar, schedule)
                         .query("INSERT INTO Organization ([Name], [Site], Schedule) VALUES (@name, @site, @schedule)");
    }

    async function AddRecordToOrgCategoryTable(name) {
        var result = await database.request()
                         .input("name", mssql.NVarChar, name)
                         .query("INSERT INTO OrgCategory ([Name]) VALUES (@name)");
    }

    async function AddRecordToHouseTable(city, street, number, latitude, longitude) {
        var result = await database.request()
                         .input("city", mssql.NVarChar, city)
                         .input("street", mssql.NVarChar, street)
                         .input("number", mssql.NVarChar, number)
                         .input("latitude", mssql.Float, latitude)
                         .input("longitude", mssql.Float, longitude)
                         .query("INSERT INTO House (City, Street, Number, Latitude, Longitude) VALUES (@city, @street, @number, @latitude, @longitude)");
    }

    async function AddRecordToOrgPhonesTable(organizationName, phone) {
        var result = await database.request()
                         .input("organizationName", mssql.NVarChar, organizationName)
                         .input("phone", mssql.NVarChar, phone)
                         .query(`INSERT INTO OrgPhones (OrganizationId, PhoneId) VALUES
                                 (
                                     (SELECT Id FROM Organization WHERE [Name] = @organizationName),
                                     (SELECT Id FROM Phone WHERE Phone = @phone)
                                 )`);
    }

    async function AddRecordToHouseOrgsTable(houseCity, houseStreet, houseNumber, organizationName) {
        var result = await database.request()
                         .input("houseCity", mssql.NVarChar, houseCity)
                         .input("houseStreet", mssql.NVarChar, houseStreet)
                         .input("houseNumber", mssql.NVarChar, houseNumber)
                         .input("organizationName", mssql.NVarChar, organizationName)
                         .query(`INSERT INTO HouseOrgs (HouseId, OrganizationId) VALUES
                                 (
                                     (SELECT Id FROM House WHERE (City = @houseCity) AND (Street = @houseStreet) AND (Number = @houseNumber)),
                                     (SELECT Id FROM Organization WHERE [Name] = @organizationName)
                                 )`);
    }

    async function AddRecordToOrgCategoriesTable(organizationName, orgCategoryName) {
        var result = await database.request()
                         .input("organizationName", mssql.NVarChar, organizationName)
                         .input("orgCategoryName", mssql.NVarChar, orgCategoryName)
                         .query(`INSERT INTO OrgCategories (OrganizationId, CategoryId) VALUES
                                 (
                                     (SELECT Id FROM Organization WHERE [Name] = @organizationName),
                                     (SELECT Id FROM OrgCategory WHERE [Name] = @orgCategoryName)
                                 )`);
    }

    function ConvertOrganizationsRecordsToObjectsArray(organizationsRecords) {
        var result = [];
        var used = [];
        for (let i = 0; i < organizationsRecords.length; i++) {
            used.push(false);
        }
        for (let i = 0; i < organizationsRecords.length; i++) {
            if (used[i]) {
                continue;
            }
            var organizationToAdd = {
                "name": organizationsRecords[i].OrganizationName,
                "site": organizationsRecords[i].OrganizationSite,
                "schedule": organizationsRecords[i].OrganizationSchedule,
                "orgCategories": [],
                "phones": [],
                "houses": []
            };
            var orgCategoryToAdd = organizationsRecords[i].OrgCategoryName;
            if (orgCategoryToAdd !== null) {
                organizationToAdd.orgCategories.push(orgCategoryToAdd);
            }
            var phoneToAdd = organizationsRecords[i].Phone;
            if (phoneToAdd !== null) {
                organizationToAdd.phones.push(phoneToAdd);
            }
            var houseToAdd = {
                "city": organizationsRecords[i].HouseCity,
                "street": organizationsRecords[i].HouseStreet,
                "number": organizationsRecords[i].HouseNumber,
                "latitude": organizationsRecords[i].HouseLatitude,
                "longitude": organizationsRecords[i].HouseLongitude
            };
            organizationToAdd.houses.push(houseToAdd);
            used[i] = true;
            for (let j = i + 1; j < organizationsRecords.length; j++) {
                var currentOrganization = organizationsRecords[j];
                if (currentOrganization.OrganizationName === organizationToAdd.name) {
                    used[j] = true;
                    var currentOrgCategory = currentOrganization.OrgCategoryName;
                    if (currentOrgCategory !== null) {
                        if (organizationToAdd.orgCategories.indexOf(currentOrgCategory) === -1) {
                            organizationToAdd.orgCategories.push(currentOrgCategory);
                        }
                    }
                    var currentPhone = currentOrganization.Phone;
                    if (currentPhone !== null) {
                        if (organizationToAdd.phones.indexOf(currentPhone) === -1) {
                            organizationToAdd.phones.push(currentPhone);
                        }
                    }
                    var currentHouse = {
                        "city": currentOrganization.HouseCity,
                        "street": currentOrganization.HouseStreet,
                        "number": currentOrganization.HouseNumber,
                        "latitude": currentOrganization.HouseLatitude,
                        "longitude": currentOrganization.HouseLongitude
                    };
                    if (!CheckIfHouseIsInArray(organizationToAdd.houses, currentHouse)) {
                        organizationToAdd.houses.push(currentHouse);
                    }
                }
            }
            result.push(organizationToAdd);
        }
        return result;
    }

    function CheckIfHouseIsInArray(array, house) {
        for (let i = 0; i < array.length; i++) {
            var currentHouse = array[i];
            if (currentHouse.city === house.city && currentHouse.street === house.street && currentHouse.number === house.number) {
                return true;
            }
        }
        return false;
    }

    async function GetInformationAboutAllOrganizationsInHouseByHouseInformation(houseCity, houseStreet, houseNumber) {
        
        var result = await database.request()
                    .input("houseCity", mssql.NVarChar, houseCity)
                    .input("houseStreet", mssql.NVarChar, houseStreet)
                    .input("houseNumber", mssql.NVarChar, houseNumber)
                    .query(`SELECT House.City as HouseCity, House.Street as HouseStreet, House.Number as HouseNumber, House.Latitude as HouseLatitude,
                                    House.Longitude as HouseLongitude, Organization.[Name] as OrganizationName, Organization.[Site] as OrganizationSite,
                                    Organization.Schedule as OrganizationSchedule, OrgCategory.[Name] as OrgCategoryName, Phone.Phone as Phone
                            FROM House
                            JOIN HouseOrgs ON HouseOrgs.HouseId = House.Id
                            JOIN Organization ON HouseOrgs.OrganizationId = Organization.Id
                            LEFT JOIN OrgCategories ON OrgCategories.OrganizationId = Organization.Id
                            LEFT JOIN OrgCategory ON OrgCategories.CategoryId = OrgCategory.Id
                            LEFT JOIN OrgPhones on OrgPhones.OrganizationId = Organization.Id
                            LEFT JOIN Phone ON OrgPhones.PhoneId = Phone.Id
                            WHERE (House.City = @houseCity) AND (House.Street = @houseStreet) AND (House.Number = @houseNumber)`);
                            
        var recordSet = result.recordsets[0];
        var organizations = ConvertOrganizationsRecordsToObjectsArray(recordSet);
        return organizations;
    }

    async function GetInformationAboutAllOrganizationsInHouseByHouseId(houseId) {
        var result = await database.request()
                         .input("houseId", mssql.Int, houseId)
                         .query(`SELECT House.City as HouseCity, House.Street as HouseStreet, House.Number as HouseNumber, House.Latitude as HouseLatitude,
                                        House.Longitude as HouseLongitude, Organization.[Name] as OrganizationName, Organization.[Site] as OrganizationSite,
                                        Organization.Schedule as OrganizationSchedule, OrgCategory.[Name] as OrgCategoryName, Phone.Phone as Phone
                                 FROM House
                                 JOIN HouseOrgs ON HouseOrgs.HouseId = House.Id
                                 JOIN Organization ON HouseOrgs.OrganizationId = Organization.Id
                                 LEFT JOIN OrgCategories ON OrgCategories.OrganizationId = Organization.Id
                                 LEFT JOIN OrgCategory ON OrgCategories.CategoryId = OrgCategory.Id
                                 LEFT JOIN OrgPhones on OrgPhones.OrganizationId = Organization.Id
                                 LEFT JOIN Phone ON OrgPhones.PhoneId = Phone.Id
                                 WHERE House.Id = @houseId`);
        var recordSet = result.recordsets[0];
        var organizations = ConvertOrganizationsRecordsToObjectsArray(recordSet);
        return organizations;
    }

    async function GetInformationAboutOrganizationInHouse(houseCity, houseStreet, houseNumber, organizationName) {
        var result = await database.request()
                         .input("houseCity", mssql.NVarChar, houseCity)
                         .input("houseStreet", mssql.NVarChar, houseStreet)
                         .input("houseNumber", mssql.NVarChar, houseNumber)
                         .input("organizationName", mssql.NVarChar, organizationName)
                         .query(`SELECT House.City as HouseCity, House.Street as HouseStreet, House.Number as HouseNumber, House.Latitude as HouseLatitude,
                                        House.Longitude as HouseLongitude, Organization.[Name] as OrganizationName, Organization.[Site] as OrganizationSite,
                                        Organization.Schedule as OrganizationSchedule, OrgCategory.[Name] as OrgCategoryName, Phone.Phone as Phone
                                 FROM House
                                 JOIN HouseOrgs ON HouseOrgs.HouseId = House.Id
                                 JOIN Organization ON HouseOrgs.OrganizationId = Organization.Id
                                 LEFT JOIN OrgCategories ON OrgCategories.OrganizationId = Organization.Id
                                 LEFT JOIN OrgCategory ON OrgCategories.CategoryId = OrgCategory.Id
                                 LEFT JOIN OrgPhones ON OrgPhones.OrganizationId = Organization.Id
                                 LEFT JOIN Phone ON OrgPhones.PhoneId = Phone.Id
                                 WHERE (House.City = @houseCity) AND (House.Street = @houseStreet) AND (House.Number = @houseNumber) AND (Organization.[Name] = @organizationName)`);
        var recordSet = result.recordsets[0];
        var organizations = ConvertOrganizationsRecordsToObjectsArray(recordSet);
        var organization = organizations[0];
        if (organization === undefined) {
            organization = {};
        }
        return organization;
    }

    async function GetInformationAboutAllOrganizationsInAllHouses(organizationName) {
        var result = await database.request()
                                   .input("organizationName", mssql.NVarChar, organizationName)
                                   .query(`SELECT House.City as HouseCity, House.Street as HouseStreet, House.Number as HouseNumber, House.Latitude as HouseLatitude,
                                                  House.Longitude as HouseLongitude, Organization.[Name] as OrganizationName, Organization.[Site] as OrganizationSite,
                                                  Organization.Schedule as OrganizationSchedule, OrgCategory.[Name] as OrgCategoryName, Phone.Phone as Phone
                                           FROM House
                                           JOIN HouseOrgs ON HouseOrgs.HouseId = House.Id
                                           JOIN Organization ON HouseOrgs.OrganizationId = Organization.Id
                                           LEFT JOIN OrgCategories ON OrgCategories.OrganizationId = Organization.Id
                                           LEFT JOIN OrgCategory ON OrgCategories.CategoryId = OrgCategory.Id
                                           LEFT JOIN OrgPhones ON OrgPhones.OrganizationId = Organization.Id
                                           LEFT JOIN Phone ON OrgPhones.PhoneId = Phone.Id
                                           WHERE Organization.[Name] = @organizationName`);
        var recordSet = result.recordsets[0];
        var organizations = ConvertOrganizationsRecordsToObjectsArray(recordSet);
        return organizations;
    }

    async function GetInformationAboutHouse(city, street, number) {
        var result = await database.request()
                                   .input("city", mssql.NVarChar, city)
                                   .input("street", mssql.NVarChar, street)
                                   .input("number", mssql.NVarChar, number)
                                   .query(`SELECT City, Street, Number, Latitude, Longitude FROM House
                                           WHERE (City = @city) AND (Street = @street) AND (Number = @number)`);
        var recordSet = result.recordsets[0];
        var house = recordSet[0];
        if (house === undefined) {
            house = {};
        }
        return house;
    }

    async function GetInformationAboutAllHouses() {
        var result = await database.request()
                                   .query("SELECT * FROM House");
        return result;
    }

    async function GetInformationAboutAllPhones() {
        var result = await database.request()
                                   .query("SELECT * FROM Phone");
        return result;
    }

    async function CheckIfRecordExistsInHouseTable(city, street, number) {
        var result = await database.request()
                                   .input("city", mssql.NVarChar, city)
                                   .input("street", mssql.NVarChar, street)
                                   .input("number", mssql.NVarChar, number)
                                   .query(`SELECT * FROM House
                                           WHERE (City = @city) AND (Street = @street) AND (Number = @number)`);
        console.log(result);
        var numberOfRows = result.rowsAffected[0];
        return numberOfRows > 0;
    }

    async function CheckIfRecordExistsInOrganizationTable(name) {
        console.log(name);
        var result = await database.request()
                                   .input("name", mssql.NVarChar, name)
                                   .query(`SELECT * FROM Organization
                                           WHERE [Name] = @name`);
        var numberOfRows = result.rowsAffected[0];
        console.log(numberOfRows > 0);
        return numberOfRows > 0;
    }

    async function CheckIfRecordExistsInOrgCategoryTable(name) {
        var result = await database.request()
                                   .input("name", mssql.NVarChar, name)
                                   .query(`SELECT * FROM OrgCategory
                                           WHERE [Name] = @name`);
        var numberOfRows = result.rowsAffected[0];
        return numberOfRows > 0;
    }

    async function CheckIfRecordExistsInPhoneTable(phone) {
        var result = await database.request()
                                    .input("phone", mssql.NVarChar, phone)
                                    .query(`SELECT * FROM Phone
                                            WHERE Phone = @phone`);
        var numberOfRows = result.rowsAffected[0];
        return numberOfRows > 0;
    }

    async function CheckIfRecordExistsInHouseOrgsTable(houseCity, houseStreet, houseNumber, organizationName) {
        var result = await database.request()
                                   .input("houseCity", mssql.NVarChar, houseCity)
                                   .input("houseStreet", mssql.NVarChar, houseStreet)
                                   .input("houseNumber", mssql.NVarChar, houseNumber)
                                   .input("organizationName", mssql.NVarChar, organizationName)
                                   .query(`SELECT * FROM HouseOrgs
                                           WHERE 
                                           (
                                               ((SELECT Id FROM House WHERE (House.City = @houseCity) AND (House.Street = @houseStreet) AND (House.Number = @houseNumber)) = HouseOrgs.HouseId) AND
                                               ((SELECT Id FROM Organization WHERE Organization.[Name] = @organizationName) = HouseOrgs.OrganizationId)
                                           )`);
        var numberOfRows = result.rowsAffected[0];
        return numberOfRows > 0;
    }

    async function CheckIfRecordExistsInOrgCategoriesTable(organizationName, orgCategoryName) {
        var result = await database.request()
                                   .input("organizationName", mssql.NVarChar, organizationName)
                                   .input("orgCategoryName", mssql.NVarChar, orgCategoryName)
                                   .query(`SELECT * FROM OrgCategories
                                           WHERE
                                           (
                                               ((SELECT Id FROM Organization WHERE Organization.[Name] = @organizationName) = OrgCategories.OrganizationId) AND
                                               ((SELECT Id FROM OrgCategory WHERE OrgCategory.[Name] = @orgCategoryName) = OrgCategories.CategoryId)
                                           )`);
        var numberOfRows = result.rowsAffected[0];
        return numberOfRows > 0;
    }

    async function CheckIfRecordExistsInOrgPhonesTable(organizationName, phone) {
        var result = await database.request()
                                   .input("organizationName", mssql.NVarChar, organizationName)
                                   .input("phone", mssql.NVarChar, phone)
                                   .query(`SELECT * FROM OrgPhones
                                           WHERE
                                           (
                                               ((SELECT Id FROM Organization WHERE Organization.[Name] = @organizationName) = OrgPhones.OrganizationId) AND
                                               ((SELECT Id FROM Phone WHERE Phone.Phone = @phone) = OrgPhones.PhoneId)
                                           )`);
        var numberOfRows = result.rowsAffected[0];
        return numberOfRows > 0;
    }

    async function AddRecordIfDoesntExistToHouseTable(city, street, number, latitude, longitude) {
        var exists = await CheckIfRecordExistsInHouseTable(city, street, number);
        if (!exists) {
            await AddRecordToHouseTable(city, street, number, latitude, longitude);
        }
    }

    async function AddRecordIfDoesntExistToOrganizationTable(name, site, schedule) {
        var exists = await CheckIfRecordExistsInOrganizationTable(name);
        if (!exists) {
            await AddRecordToOrganizationTable(name, site, schedule);
        }
    }

    async function AddRecordIfDoesntExistToOrgCategoryTable(name) {
        var exists = await CheckIfRecordExistsInOrgCategoryTable(name);
        if (!exists) {
            await AddRecordToOrgCategoryTable(name)
        }
    }

    async function AddRecordIfDoesntExistToPhoneTable(phone) {
        var exists = await CheckIfRecordExistsInPhoneTable(phone);
        if (!exists) {
            await AddRecordToPhoneTable(phone);
        }
    }

    async function AddRecordIfDoesntExistToHouseOrgsTable(houseCity, houseStreet, houseNumber, organizationName) {
        var exists = await CheckIfRecordExistsInHouseOrgsTable(houseCity, houseStreet, houseNumber, organizationName);
        console.log("Between");
        if (!exists) {
            await AddRecordToHouseOrgsTable(houseCity, houseStreet, houseNumber, organizationName);
        }
    }

    async function AddRecordIfDoesntExistToOrgCategoriesTable(organizationName, orgCategoryName) {
        var exists = await CheckIfRecordExistsInOrgCategoriesTable(organizationName, orgCategoryName);
        if (!exists) {
            await AddRecordToOrgCategoriesTable(organizationName, orgCategoryName);
        }
    }

    async function AddRecordIfDoesntExistToOrgPhonesTable(organizationName, phone) {
        var exists = await CheckIfRecordExistsInOrgPhonesTable(organizationName, phone);
        if (!exists) {
            await AddRecordToOrgPhonesTable(organizationName, phone);
        }
    }

    async function AddHouseToDatabase(house) {
        await AddRecordIfDoesntExistToHouseTable(house.city, house.street, house.number, house.latitude, house.longitude);
    }

    async function AddOrganizationToDatabase(organization) {
        var currentHouse = organization.house;
        await AddRecordIfDoesntExistToHouseTable(currentHouse.city, currentHouse.street, currentHouse.number, currentHouse.latitude, currentHouse.longitude);
        await AddRecordIfDoesntExistToOrganizationTable(organization.name, organization.site, organization.schedule);
        await AddRecordIfDoesntExistToHouseOrgsTable(currentHouse.city, currentHouse.street, currentHouse.number, organization.name);
        console.log("Come here!");
        console.log(organization);
        for (var i = 0; i < organization.orgCategories.length; i++) {
            var currentOrgCategory = organization.orgCategories[i];
            await AddRecordIfDoesntExistToOrgCategoryTable(currentOrgCategory);
            await AddRecordIfDoesntExistToOrgCategoriesTable(organization.name, currentOrgCategory);
        }
        for (var i = 0; i < organization.phones.length; i++) {
            var currentPhone = organization.phones[i];
            await AddRecordIfDoesntExistToPhoneTable(currentPhone);
            await AddRecordIfDoesntExistToOrgPhonesTable(organization.name, currentPhone);
        }
    }

    async function ClearDatabase() {
        var result = await database.request()
                             .query(`DELETE HouseOrgs
                                     DELETE OrgCategories
                                     DELETE OrgPhones
                                     DELETE House
                                     DELETE Organization
                                     DELETE OrgCategory
                                     DELETE Phone`);
    }

    return {
        "AddHouseToDatabase": AddHouseToDatabase,
        "AddOrganizationToDatabase": AddOrganizationToDatabase,
        "ClearDatabase": ClearDatabase,
        "GetInformationAboutAllOrganizationsInHouseByHouseInformation": GetInformationAboutAllOrganizationsInHouseByHouseInformation,
        "GetInformationAboutAllOrganizationsInHouseByHouseId": GetInformationAboutAllOrganizationsInHouseByHouseId,
        "GetInformationAboutOrganizationInHouse": GetInformationAboutOrganizationInHouse,
        "GetInformationAboutAllOrganizationsInAllHouses": GetInformationAboutAllOrganizationsInAllHouses,
        "GetInformationAboutHouse": GetInformationAboutHouse
    };
}

module.exports = MSSQLWorker;