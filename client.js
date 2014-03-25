var request = require('request');


var postData = function() {
    var temperature = Math.floor(Math.random() * 60);
    console.log("posting temperature " + temperature);
    request.post('http://mysterious-gorge-5071.herokuapp.com/temp', {form:{temp:temperature}}
    , function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("it worked!");// Print the google web page.
      }
      else {
        console.log("it failed!");
      }
    });
};
setInterval(postData, 1000*25);

//make the request object
