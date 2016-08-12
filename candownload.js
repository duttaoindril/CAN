var http = require('http');
var fs = require('fs');

console.log("Downloading http://odutta.me/can" + process.argv[2] + ".dat...");

var request = http.get("http://odutta.me/can"+process.argv[2]+".dat", function(response) {
    response.pipe(fs.createWriteStream("unprocessed/"+Date.now()+".dat"));
});