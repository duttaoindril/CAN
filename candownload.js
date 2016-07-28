var http = require('http');
var fs = require('fs');

var request = http.get("http://odutta.me/can.dat", function(response) {
    response.pipe(fs.createWriteStream("unprocessed/"+Date.now()+".dat"));
});