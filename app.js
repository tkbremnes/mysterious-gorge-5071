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

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
});

app.use(express.static(__dirname + '/public'));

app.post('/', function (req, res) {
    registrationIds.push(req.body.device.id);
});


var gcmThing = function () {

    // create a message with default values
    var message = new gcm.Message();

    // or with object values
    var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: true,
        timeToLive: 3,
        data: {
            key1: 'message1',
            key2: 'message2'
        }
    });

    var sender = new gcm.Sender(secrets.google_api_key);
    var registrationIds = [];

    // OPTIONAL
    // add new key-value in data object
    message.addDataWithKeyValue('key1','message1');
    message.addDataWithKeyValue('key2','message2');

    // or add a data object
    message.addDataWithObject({
        key1: 'message1',
        key2: 'message2'
    });

    // or with backwards compability of previous versions
    message.addData('key1','message1');
    message.addData('key2','message2');


    message.collapseKey = 'demo';
    message.delayWhileIdle = true;
    message.timeToLive = 3;
    // END OPTIONAL

    /**
     * Params: message-literal, registrationIds-array, No. of retries, callback-function
     **/
    sender.send(message, registrationIds, 4, function (err, result) {
        console.log(result);
    });

}

