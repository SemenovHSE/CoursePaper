const fs = require("fs");
const path = require("path");

function ReadDataAboutHouses() {
    //var pathToFile = path.normalize("C:\\Users\\nvlse\\Desktop\\3 курс\\Курсовая\\DataProcesser\\data\\housesData.txt");
    var pathToFile = path.resolve("data\\housesData.txt");
    console.log(pathToFile);
    var fileData = fs.readFileSync(pathToFile, "utf8");
    var houses = fileData.split("\r\n");
    houses = houses.map(function (value, index) {
        var parts = value.split(",");
        var city = parts[0].trim();
        var street = parts[1].trim();
        var number = parts[2].trim();
        return {
            "city": city,
            "street": street,
            "number": number
        };
    })
    return houses;
}

module.exports = {
    "ReadDataAboutHouses": ReadDataAboutHouses
}