/* global console */
export createClient = function(config, io) {
    console.log('Connecting to backend');
    var maxReconnectionAttempts = config.maxReconnectionAttempts;
    var socket = io.connect(config.host, {
        'connect timeout': config.timeout,
        'try multiple transports': false,
        'reconnect': true,
        'reconnection limit': config.reconnectionLimit,
        "max reconnection attempts": maxReconnectionAttempts,
        'auto connect': false,
        'resource': 'watch/socket.io'
    });

    var client = {
        sendFollowRequest: function(room, token) {
            var message = { 'roomName': room };
            if (token) {
                message.token = token;
            }
            socket.emit('start_watch', message);
        },

        sendUnfollowRequest: function(room) {
            socket.emit('end_watch', { 'roomName': room });
        },

        on: function (event, handler) {
            socket.on(event, handler);
        },

        connect: function () {
            socket.socket.connect();
        },

        reconnectIfPassive: function () {
            if (this.isPassive()) {
                socket.socket.reconnect();
            }
        },

        /**
         * A client is passive if it is not connected and not trying to establish contact with the server.
         */
        isPassive: function () {
            return !(this.isConnecting() ||
                     this.isConnected() ||
                    this.isReconnecting());
        },

        isReconnecting: function () {
            //Have to check the reconnectionAttempts since the attemps are not reset when reaching the
            //max number of attemps and giving up.
            return socket.socket.reconnecting && socket.socket.reconnectionAttempts <= maxReconnectionAttempts;
        },

        isConnecting: function () {
            return socket.socket.connecting;
        },

        isConnected: function () {
            return socket.socket.connected;
        }

    };

    return client;
};
