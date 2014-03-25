var express = require("express");
var logfmt = require("logfmt");
var gcm = require('node-gcm');
var app = express();
var secrets = require('./secrets.json');
app.use(express.bodyParser());

app.use(logfmt.requestLogger());

// app.get('/', function(req, res) {
//     res.send('Hello World!');
// });
var registrationIds = [];
var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
});

app.use(express.static(__dirname + '/public'));

app.post('/register', function (req, res) {
    console.log(JSON.stringify(req.body));
    console.log("client registered with regid="+req.body.id);
    registrationIds.push(req.body.id);
    gcm("hello world");
});

app.post('/temp', function(req, res) {
  var temp = req.body.temp;
  if (temp > 30 || temp < 20) {
    console.log("Temp="+temp);
    gcm(temp);
  }
  else {
    console.log("Ignoring when temp = "+temp);
  }
});


var gcm = function (temp) {

    // or with object values
    var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: true,
        timeToLive: 3,
        data: {
            temperature: temp,
            message: "hello world"
        }
    });

    var sender = new gcm.Sender(secrets.google_api_key);

    /**
     * Params: message-literal, registrationIds-array, No. of retries, callback-function
     **/
    sender.send(message, registrationIds, 4, function (err, result) {
        console.log(result);
        console.log("error:"+err);
    });
}
