var http=require('http');


var postData = function() {
    var temperature = Math.floor(Math.random() * 60);

    var request=http.request({
      'host': 'mysterious-gorge-5071.herokuapp.com',
      'port': 80,
      'path': '/temp',
      'method': 'POST',
    });
    console.log("posting temperature " + temperature);
    var dataOut = JSON.stringify({
      temp: temperature
    });
    console.log("data: "+dataOut);
    request.write(dataOut);
    //assign callbacks
    request.on('response', function(response) {
       console.log('Response status code:'+response.statusCode);

       response.on('data', function(data) {
         console.log('Body: '+data);
       });
    });
};
setInterval(postData, 1000*30);

//make the request object
