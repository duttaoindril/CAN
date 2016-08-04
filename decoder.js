var allData = require("./testData.json");
var canDict = require("./candictionary.json");
var binDict = require("./hex2binDict.json");
var chokidar = require('chokidar');
var fs = require('fs');

chokidar.watch('unprocessed', {awaitWriteFinish: {stabilityThreshold: 500, pollInterval: 100}}).on('add', (event, path) => {
    setTimeout(function (params) {
        fs.readFile(event, function (err, data) {
            console.log(event);
            decode(data, "campaign0");
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
            console.log("Time: "+(new Date(time*1000).toLocaleString()));
        }
        var latitude = null;
        var longitude = null;
        if (byteArray[1] == "01") {
            latitude = parseFloat("0x"+byteArray.splice(2, 4).join([separator = '']));
            console.log("Latitude: "+ latitude);
            longitude = parseFloat("0x"+byteArray.splice(2, 4).join([separator = '']));
            console.log("Longitude: "+ longitude);
        }
        byteArray.splice(0, 2); // Remove time and location header
        var messageCount = parseInt("0x"+byteArray.splice(0, 1).join([separator = '']));
        console.log("Number of Messages: "+messageCount);
        for(var i = 0; i < messageCount; i++) {
            var messageId = byteArray.splice(0, 2).join([separator = '']).replace(/^[0]+/g,"").toUpperCase();
            console.log("Message ID: "+messageId);
            // var messageLength = canDict[messageId]["messageLength"];
            // console.log("Message Length: "+messageLength);
            var message = byteArray.splice(0, canDict[messageId]["messageLength"]);
            console.log("Message: "+message);
            // console.log("Binary Message: "+hex2bin(message));
            // allData[campaignId]["vin0"][messageId].push();
            console.log("Message Signals: "+ decodeHelper(time, latitude, longitude, message, hex2bin(message), canDict[messageId]["signals"]));
        }
        console.log();
    }
    console.log("=====================================");
}

function decodeHelper(time, lat, lon, hexmessage, binmessage, signals) {
    var tempJObject = {};
    if (signals == undefined)
        return;
    for (let signal of signals) {
        console.log(JSON.stringify(signal));
    }
    // return JSON.stringify(signals);
}

function hex2bin(hex) {
    var binArray = [];
    for(var i = 0; i < hex.length; i++)
        binArray.push(binDict[hex[i].toString().charAt(0).toUpperCase()]+binDict[hex[i].toString().charAt(1).toUpperCase()]);
    return binArray;//.join([separator = '']);
}