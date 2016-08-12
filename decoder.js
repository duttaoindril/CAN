var spaze = 2;
var db = "./allData.json"
var successful = "successful";
var errr = "error";
var allData = require(db);
var canDict = require("./candictionary.json");
var binDict = require("./hex2binDict.json");
var chokidar = require('chokidar');
var fs = require('fs');
var logs = "";

chokidar.watch('unprocessed', {
    awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
    }
}).on('add', (event, path) => {
    setTimeout(function(params) {
        fs.readFile(event, function(err, data) {
            log("Reading file " + event + "...\n");
            console.log("Time: " + parseInt(event.substring(event.length - 17, event.length - 4)));
            var time = parseInt(event.substring(event.length - 17, event.length - 4));
            var campId = "campaign0"; //event.substring(0, x);
            var vId = "vin0"; //event.substring(x, event.length-17);
            if (allData[campId] == undefined)
                allData[campId] = {};
            if (allData[campId][vId] == undefined)
                allData[campId][vId] = {};
            var decodedObj = decode(data, campId, vId, (time / 1000).toFixed(0));
            if (decodedObj === false) fs.writeFile(errr + "/" + event.substr(11), data, function(err) {
                if (err) {
                    console.log(err);
                    return;
                }
                finish("The file could not be decoded; check logs.txt and error folder!", event);
            });
            else fs.writeFile(db, decodedObj, function(err) {
                if (err) {
                    console.log(err);
                    return;
                }
                fs.writeFile(successful + "/" + event.substr(11), data, function(err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    finish("The file was decoded successfully; check logs.txt and successful folder!", event);
                });
            });
        });
    }, 100);
});

function decode(data, campaignId, vinId, time) {
    var byteArray = data.toString("hex").match(/.{1,2}/g);
    var timeSaved = time;
    while (byteArray.length > 0) {
        time = timeSaved;
        if (byteArray[0] == "01") {
            time = parseInt("0x" + byteArray.splice(2, 4).join([separator = '']));
            log("Time: " + (new Date(time * 1000).toLocaleString()));
        }
        var latitude = null;
        var longitude = null;
        if (byteArray[1] == "01") {
            latitude = parseFloat("0x" + byteArray.splice(2, 4).join([separator = '']));
            log("Latitude: " + latitude);
            longitude = parseFloat("0x" + byteArray.splice(2, 4).join([separator = '']));
            log("Longitude: " + longitude);
        }
        if (time != null && latitude != null && time != null) {
            if (allData[campaignId][vinId]["location"] == undefined) allData[campaignId][vinId]["location"] = {};
            allData[campaignId][vinId]["location"][time] = {
                "lon": longitude,
                "lat": latitude
            };
        }
        byteArray.splice(0, 2); // Remove time and location header
        var messageCount = parseInt("0x" + byteArray.splice(0, 1).join([separator = '']));
        log("Number of Messages: " + messageCount);
        for (var i = 0; i < messageCount; i++) {
            var messageId = byteArray.splice(0, 2).join([separator = '']).replace(/^[0]+/g, "").toUpperCase();
            log("Message ID: " + messageId);
            if (canDict[messageId] === undefined) return false;
            var message = byteArray.splice(0, canDict[messageId]["messageLength"]);
            log("Message: " + message);
            log("Binary Message: " + hex2bin(message) + "\n--");
            if (canDict[messageId]["signals"] != undefined) {
                if (allData[campaignId][vinId][messageId] == undefined) allData[campaignId][vinId][messageId] = [];
                var decodedMessage = decodeHelper(time, latitude, longitude, message, hex2bin(message).reverse(), canDict[messageId]["signals"], hex2bin(message).join(""));
                if (decodedMessage === false) return false;
                else allData[campaignId][vinId][messageId].push(decodedMessage);
            }
        }
        log("");
    }
    return JSON.stringify(allData, null, spaze);
}

function decodeHelper(time, lat, lon, hexmessage, binmessage, signals, binmessageJoined) {
    var tempJObject = {
        "time": time,
        "latitude": lat,
        "longitude": lon
    };
    for (let signal of signals) {
        log(JSON.stringify(signal));
        var bits = binmessage[signal.byte - 1].substring(signal.bit, signal.bit + signal.readLength);
        log(bits);
        var temp;
        if (signal.type == "boolean")
            temp = !!parseInt(bits);
        else if (signal.type == "conversion") {
            log("Converting " + r(bits) + " to " + parseInt(r(bits), 2));
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
        } else if (signal.type == "combination") { // log("r[bits] is a " + typeof r(bits) + " with value " + r(bits));
            var str = signal[bits];
            temp = str.substr(0, str.indexOf("|"));
            tempJObject[signal.name + "CombinationName"] = str.substr(str.indexOf("|") + 1);
            tempJObject[signal.name + "CombinationMeaning"] = signal[temp];
            temp = parseInt(temp);
        }
        log("Temp is a " + typeof temp + " with value " + temp);
        if (temp === undefined)
            return false;
        tempJObject[signal.name] = temp;
        log("--");
    }
    log(JSON.stringify(tempJObject));
    return tempJObject;
}

function r(str) {
    return str.split("").reverse().join("").toString();
}

function hex2bin(hex) {
    var binArray = [];
    for (var i = 0; i < hex.length; i++)
        binArray.push(binDict[hex[i].toString().charAt(0).toUpperCase()] + binDict[hex[i].toString().charAt(1).toUpperCase()]);
    return binArray;
}

function log(data) {
    logs = logs + data + "\n";
    console.log(data);
}

function finish(data, event) {
    fs.unlink(event);
    log(data);
    log("=====================================\n");
    fs.appendFile('logs.txt', logs + "\n", function(err) {});
    logs = "";
}