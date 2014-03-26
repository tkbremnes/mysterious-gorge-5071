var express = require("express");
var logfmt = require("logfmt");
var gcm = require('node-gcm');
var app = express();
var secrets = require('./secrets.json');
var io = require('socket.io');
io.on('connection', function(socket){});
io.listen(3000);
var config = {
    host: 'http://appear.in',
    hostname: 'appear.in',
    timeout: 5 * 1000,
    reconnectionLimit: 2 * 60 * 1000,
    connectionRevivalInterval: undefined,
    maxReconnectionAttempts: Infinity
};

var client = require('./chrome-notifier/scripts/client.js')
  .createClient(config, io);
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
    res.end();
    gcmPost("hello world");
});

app.post('/temp', function(req, res) {
  var temp = req.body.temp;
  console.log("Temp="+temp);
  if (!temp) {
    console.log(JSON.stringify(req.body));
    res.writeHead(400, "temp is undefined!");
    res.end();
    return;
  }
  if (temp > 30) {
    gcmPost(temp, 2);
  }
  else if (temp < 20) {
    gcmPost(temp, 1);
  }
  else {
    console.log("Ignoring when temp = "+temp);
  }
  res.end();
  return;
});

app.post('/room', function(req, res) {
  res.end();
});


var gcmPost = function (temp, error) {
    console.log("temp="+temp);
    if (!error) {
      error = 0;
    }
    // or with object values
    var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: true,
        timeToLive: 1,
        data: {
            error: error,
            temperature: temp,
            message: "temperature is "
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
