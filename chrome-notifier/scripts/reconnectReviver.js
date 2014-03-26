//the last argument is basically to allow testing.
window.createReconnectReviver = function (interval, client, wantedIntervalProvider) {
    var intervalProvider = wantedIntervalProvider || window;

    var createScheduler = function (task, timeout) {
        var id;

        return {
            start: function () {
                if (id) {
                    //already started
                    return;
                }

                id = intervalProvider.setInterval(task, timeout);
            },

            stop: function () {
                if (!id) {
                    return;
                }

                intervalProvider.clearInterval(id);
                id = null;
            }
        };
    };
    if (!client.reconnectIfPassive.bind) {
        throw new Error("client must be defined");
    }
    return createScheduler(
        client.reconnectIfPassive.bind(client),
        interval
    );

};
