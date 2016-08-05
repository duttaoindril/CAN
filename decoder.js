var db = "./allData.json"
var allData = require(db);
var canDict = require("./candictionary.json");
var binDict = require("./hex2binDict.json");
var chokidar = require('chokidar');
var fs = require('fs');

chokidar.watch('unprocessed', {
    awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
    }
}).on('add', (event, path) => {
    setTimeout(function(params) {
        fs.readFile(event, function(err, data) {
            console.log(event);
            fs.writeFile(db, decode(data, "campaign0"), function(err) {
                if (err)
                    return console.log(err);
                console.log("The file was saved!");
            });
        });
        fs.unlink(event);
    }, 100);
});

function decode(data, campaignId) {
    var returnObj = {};
    var byteArray = data.toString("hex").match(/.{1,2}/g);
    while (byteArray.length > 0) {
        var time = null;
        if (byteArray[0] == "01") {
            time = parseInt("0x" + byteArray.splice(2, 4).join([separator = '']));
            console.log("Time: " + (new Date(time * 1000).toLocaleString()));
        }
        var latitude = null;
        var longitude = null;
        if (byteArray[1] == "01") {
            latitude = parseFloat("0x" + byteArray.splice(2, 4).join([separator = '']));
            console.log("Latitude: " + latitude);
            longitude = parseFloat("0x" + byteArray.splice(2, 4).join([separator = '']));
            console.log("Longitude: " + longitude);
        }
        byteArray.splice(0, 2); // Remove time and location header
        var messageCount = parseInt("0x" + byteArray.splice(0, 1).join([separator = '']));
        console.log("Number of Messages: " + messageCount);
        for (var i = 0; i < messageCount; i++) {
            var messageId = byteArray.splice(0, 2).join([separator = '']).replace(/^[0]+/g, "").toUpperCase();
            console.log("Message ID: " + messageId);
            // var messageLength = canDict[messageId]["messageLength"];
            // console.log("Message Length: "+messageLength);
            var message = byteArray.splice(0, canDict[messageId]["messageLength"]);
            console.log("Message: " + message);
            console.log("Binary Message: " + hex2bin(message));
            if (allData[campaignId]["vin0"][messageId] == undefined)
                allData[campaignId]["vin0"][messageId] = [];
            if (canDict[messageId]["signals"] != undefined)
                allData[campaignId]["vin0"][messageId].push(decodeHelper(time, latitude, longitude, message, hex2bin(message).reverse(), canDict[messageId]["signals"]));
        }
        console.log();
    }
    console.log("=====================================");
    console.log(JSON.stringify(allData));
    console.log("=====================================");
    return JSON.stringify(allData);
}

function decodeHelper(time, lat, lon, hexmessage, binmessage, signals) {
    var tempJObject = {
        "time": time,
        "latitude": lat,
        "longitude": lon
    };
    for (let signal of signals) {
        console.log(JSON.stringify(signal));
        var bits = binmessage[signal.byte - 1].substring(signal.bit, signal.bit + signal.readLength);
        console.log(bits);
        var temp;
        if (signal.type == "boolean")
            temp = !!parseInt(bits);
        else if (signal.type == "conversion") {
            console.log("Converting " + r(bits) + " to " + parseInt(r(bits), 2));
            temp = parseInt(r(bits), 2);
            if (signal.mult != undefined)
                temp = temp * signal.mult;
            if (signal.add != undefined)
                temp = temp + signal.add;
            temp = Math.round(temp * Math.pow(10, signal.trunc)) / Math.pow(10, signal.trunc);
            if (!signal.unitDict)
                tempJObject[signal.name + "Unit"] = signal.units;
            else {
                tempJObject[signal.name + "Unit"] = null;
                tempJObject[signal.name + "UnitRefer"] = signal.units;
            }
        } else if (signal.type == "combination") // console.log("r[bits] is a " + typeof r(bits) + " with value " + r(bits));
            temp = signal[bits];
        console.log("Temp is a " + typeof temp + " with value " + temp);
        tempJObject[signal.name] = temp;
        console.log("--");
    }
    console.log(JSON.stringify(tempJObject));
    return tempJObject;
}

function r(str) {
    return str.split("").reverse().join("").toString();
}

function hex2bin(hex) {
    var binArray = [];
    for (var i = 0; i < hex.length; i++)
        binArray.push(binDict[hex[i].toString().charAt(0).toUpperCase()] + binDict[hex[i].toString().charAt(1).toUpperCase()]);
    return binArray; //.join([separator = '']);
}