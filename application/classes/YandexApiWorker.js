var XmlHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function MakeRequestURL(city, street, number) {
    var urlBase = "https://search-maps.yandex.ru/v1/?"
    var requestParameters = {
        "apikey": "80c57af5-b4ea-4290-972c-fe47457c11d3",
        "text": city + " " + street + " " + number,
        "lang": "ru_RU",
        "type": "biz"
    };
    var parameters = Object.keys(requestParameters).map(function (value, index) {
        return value + "=" + requestParameters[value];
    }).join("&");
    var url = urlBase + parameters;
    url = encodeURI(url);
    return url;
}

function GetInformationAboutHouse(information, city, street, number) {
    var house = {
        "city": city,
        "street": street,
        "number": number,
        "latitude": undefined,
        "longitude": undefined
    };
    if (information.hasOwnProperty("properties")) {
        var bounds = information.properties.ResponseMetaData.SearchRequest.boundedBy;
        var leftTop = bounds[0];
        var rightBottom = bounds[1];
        var longitude = (leftTop[0] + rightBottom[0]) / 2;
        var latitude = (leftTop[1] + rightBottom[1]) / 2;
        house.latitude = latitude;
        house.longitude = longitude; 
    }
    return house;
}


function GetInformationAboutOrganizations(information) {
    var ogranizations = [];
    var allOrganizations = information.features;
    for (var i = 0; i < allOrganizations.length; i++) {
        var currentOrganization = {
            "name": undefined,
            "site": undefined,
            "orgCategories": [],
            "phones": [],
            "schedule": undefined
        };
        var currentProperties = allOrganizations[i].properties;
        if (!currentProperties.hasOwnProperty("CompanyMetaData")) {
            continue;
        }
        var currentMetaData = currentProperties.CompanyMetaData;
        currentOrganization.name = currentMetaData.name;
        currentOrganization.site = currentMetaData.url;
        if (currentMetaData.hasOwnProperty("Categories")) {
            var currentCategories = currentMetaData.Categories;
            var informationAboutCategories = currentCategories.map(function (value, index) {
                return value.name;
            });
            currentOrganization.orgCategories = informationAboutCategories;
        }
        if (currentMetaData.hasOwnProperty("Phones")) {
            var currentPhones = currentMetaData.Phones;
            var informationAboutPhones = currentPhones.map(function (value, index) {
                return value.formatted;
            });
            currentOrganization.phones = informationAboutPhones;
        }
        if (currentMetaData.hasOwnProperty("Hours")) {
            var currentInformationAboutHours = currentMetaData.Hours;
            currentOrganization.schedule = currentInformationAboutHours.text;
        }
        ogranizations.push(currentOrganization);
    }
    return ogranizations;
}

function GetInformation(city, street, number) {
    var request = new XmlHttpRequest();
    var url = MakeRequestURL(city, street, number);
    console.log(url);
    request.open("GET", url, false);
    request.send(null);
    var information = JSON.parse(request.responseText);
    var house = GetInformationAboutHouse(information, city, street, number);
    var organizations = GetInformationAboutOrganizations(information);
    return {
        "house": house,
        "organizations": organizations
    };
}

module.exports = {
    "GetInformation": GetInformation
}