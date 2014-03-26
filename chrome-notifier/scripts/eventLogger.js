window.createEventLogger = function (log) {
    var createLogHandler = function (eventName) {
        var logMessagePattern = (eventName ? eventName + ":" : "") + " %o";
        return function () {
            log(logMessagePattern, arguments);
        };
    };
    return {
        logEvents: function (socket, events) {
            return events.map(function (eventNameToLog) {
                return socket.on(eventNameToLog, createLogHandler(eventNameToLog));
            });
        }
    };
};


