var canDict = require("./candictionary.json");
var binDict = require("./hex2binDict.json");
var chokidar = require('chokidar');
var fs = require('fs');

chokidar.watch('unprocessed', {awaitWriteFinish: {stabilityThreshold: 500, pollInterval: 100}}).on('add', (event, path) => {
    setTimeout(function (params) {
        fs.readFile(event, function (err, data) {
            var byteArray = data.toString("hex").match(/.{1,2}/g);
            while(byteArray.length > 0) {
                console.log("Current Length: "+byteArray.length);
                if(byteArray[0] == "01") {
                    console.log("Time: "+(new Date(parseInt("0x"+byteArray.splice(2, 4).join([separator = '']))*1000).toLocaleString()));
                } if(byteArray[1] == "01") {
                    console.log("Latitude: "+parseFloat("0x"+byteArray.splice(2, 4).join([separator = ''])));
                    console.log("Longitude: "+parseFloat("0x"+byteArray.splice(2, 4).join([separator = ''])));
                }
                byteArray.splice(0, 2);
                var messageCount = parseInt("0x"+byteArray.splice(0, 1).join([separator = '']));
                console.log("Number of Messages: "+messageCount);
                for(var i = 0; i < messageCount; i++) {
                    var messageId = byteArray.splice(0, 2).join([separator = '']).replace(/^[0]+/g,"").toUpperCase();
                    console.log("Message ID: "+messageId);
                    var messageLength = canDict[messageId]["messageLength"];
                    console.log("Message Length: "+messageLength);
                    var message = byteArray.splice(0, messageLength);
                    console.log("Message: "+message);
                    console.log("Binary Message: "+hex2bin(message));
                    console.log()
                }
                console.log();
            }
            console.log("=====================================");
        });
        fs.unlink(event);
    }, 100);
});

function hex2bin(hex) {
    var binArray = [];
    for(var i = 0; i < hex.length; i++) {
        binArray.push(binDict[hex[i].toString().charAt(0).toUpperCase()]+binDict[hex[i].toString().charAt(1).toUpperCase()]);
    }
    return binArray;//.join([separator = '']);
}

function decodeHelper(message, signals) {

}