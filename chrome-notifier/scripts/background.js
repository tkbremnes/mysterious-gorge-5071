/* global chrome, io, console, config, createTabs, createUtils, Kissmetrics, GoogleAnalytics, createFeatures, createRoomService, createPopup, createClient, createRoomStorage, createReconnectReviver, createEventLogger */

/* Message passing from the inject.js */
var registerMessageHandler = function(roomService, chrome, features) {
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            switch (request.action) {
            case 'analytics-information':
                var kissmetricsId = request.argument.kissmetricsId;
                if (kissmetricsId) {
                    Kissmetrics.identify(kissmetricsId);
                }
                break;
            case 'check-extension':
                // Respond with the version number
                var version = chrome.runtime.getManifest().version;
                sendResponse({
                    version: version,
                    features: features,
                    extensionClientId: roomService.getSelfId()
                });
                break;
            case 'follow-room':
                roomService.followRoom(request.argument);
                break;
            case 'share-screen':
                if (!features.shareScreen) {
                    return;
                }

                chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], sender.tab, function (streamId) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: 'relay-to-tab',
                        callback: 'share-screen',
                        argument: streamId
                    }, function () {
                        console.log("Message sent with stream %s", streamId);
                    });
                });
                break;
            case 'owner-changed':
                roomService.changeOwner(request.argument);
                break;
            case 'unfollow-room':
                roomService.unfollowRoom(request.argument.roomName);
                break;
            case 'get-followed-rooms':
                // Return followed rooms
                sendResponse(roomService.getFollowedRooms());
                break;
            }
        }
    );
};

/* Injection to tabs already open when the extension is loaded. */

var injectToExistingTabs = function(chrome, tabs) {
    tabs.forAppearInTabs(function(tabs) {
        for (var i in tabs) {
            var tab = tabs[i];
            chrome.tabs.executeScript(tab.id, {
                file: 'scripts/inject.js',
                runAt: 'document_start'
            });
        }
    });
};

function registerCurrentRoomDetector(roomService, utils, chrome) {
    var setCurrentRoomName = function (activeTab) {
        var currentRoomName = utils.extractRoomName(activeTab && activeTab.url);
        roomService.setCurrentRoom(
            currentRoomName
        );
        console.log("Changing current roomname %s", currentRoomName);
    };

    var forActiveTabInFocusedWindow = function (callback) {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
            if (tabs.length === 1) {
                callback(tabs[0]);
            }
        });
    };

    forActiveTabInFocusedWindow(setCurrentRoomName);

    chrome.tabs.onActivated.addListener(function (activeInfo) {
        chrome.tabs.get(activeInfo.tabId, setCurrentRoomName);
    });

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (tab.active) {
            forActiveTabInFocusedWindow(setCurrentRoomName);
        }
    });

    chrome.windows.onFocusChanged.addListener(function (windowId) {
        if (windowId === chrome.windows.WINDOW_ID_NONE) {
            setCurrentRoomName(null);
            return;
        }
        forActiveTabInFocusedWindow(setCurrentRoomName);
    });
}

var registerClientHandlers = function (client, roomService, roomManager, tabs) {
    var clientIds = {};
    var clearAndSetNotificationIdForRoom = function (room, notificationId, callback) {
        var previousNotificationId = roomManager.setNotificationId(room, notificationId);
        if (previousNotificationId) {
            chrome.notifications.clear(previousNotificationId, callback);
        }
    };

    var showNotificationForRoom = function(room) {
        var roomName = room.name,
            numClients = room.clients.length,
            message = numClients === 1 ?
                'There is ' + numClients + ' visitor in the room.' :
                'There are ' + numClients + ' visitors in the room.';

        Kissmetrics.sendEvent('Extension notification: Create', {roomName: roomName});
        GoogleAnalytics.sendEvent('Notification', 'Create', roomName);
        chrome.notifications.create('', {
            type: 'basic',
            title: roomName.substring(1) + ' has a new visitor!',
            message: message,
            iconUrl: 'notification_logo.png',
            eventTime: Date.now()
        }, function(roomNotificationId) {
            clearAndSetNotificationIdForRoom(room, roomNotificationId, function(/*notificationId*/) {});
            var openRoomOnNotificationClicked = function(notificationId) {
                if (notificationId === roomNotificationId) {
                    Kissmetrics.sendEvent('Extension notification: Go to Room', {roomName: roomName});
                    GoogleAnalytics.sendEvent('Notification', 'Go to Room', roomName);
                    tabs.createOrActivate(roomName);
                    chrome.notifications.clear(notificationId, function(/*notificationId*/) {});
                }
            };

            var removeEventListenersOnNotificationClosed = function(notificationId, byUser) {
                if (byUser) {
                    Kissmetrics.sendEvent('Extension notification: Close', {roomName: roomName});
                    GoogleAnalytics.sendEvent('Notification', 'Close', roomName);
                }
                if (notificationId === roomNotificationId) {
                    chrome.notifications.onClicked.removeListener(openRoomOnNotificationClicked);
                    chrome.notifications.onClosed.removeListener(removeEventListenersOnNotificationClosed);
                }
            };

            chrome.notifications.onClicked.addListener(openRoomOnNotificationClicked);
            chrome.notifications.onClosed.addListener(removeEventListenersOnNotificationClosed);
        });
    };

    var considerShowingNotification = function(data) {
        var room = data.room,
            roomName = data.room.name,
            newClientId = data.client.id;
        if (!!clientIds[newClientId]) {
            console.log("Already aware of this client, ignoring: " + newClientId);
            return;
        }

        clientIds[newClientId] = true;
        if (roomManager.shouldNotifyUser(roomName)) {
            showNotificationForRoom(room);
        }
    };
    var sendFollowRequests = function() {
        console.log('Connected to backend, sending follow requests');

        var rooms = roomManager.getFollowedRooms();
        var room;
        for (var roomName in rooms) {
            room = rooms[roomName];
            client.sendFollowRequest(roomName, room.token);
        }
    };

    createEventLogger(console.log.bind(console)).logEvents(client, [
        'connecting',
        'connect',
        'error',
        'reconnect',
        'reconnecting',
        'connect_failed',
        'disconnected'
    ]);

    client.on('connect', sendFollowRequests);

    client.on('new_client', considerShowingNotification);

    client.on('connection_information', function (data) {
        roomService.setSelfId(data.selfId);
    });

    client.on('watch_started', function (data) {
        console.log("Received watch_started from server");
        if (!!data.error) {
            roomService.registerError(data.data.roomName, data.error);
            return;
        }
        roomService.registerError(data.room.roomName, undefined);
    });
    client.on('watch_kicked', function (data) {
        console.log("Received watch_kicked from server");
        //Wait in case you are the owner of the room and
        //the plugin may get this token sent to it.
        //This is merely to avoid flickering extension icon in the toolbar.
        setTimeout(function () {
            roomService.reconnectWatchRoom(data.room.name);
        }, 1000);
    });

    client.on('client_left', function (data) {
        console.log("Client left: " + data.clientId);
        delete clientIds[data.clientId];
    });
};

/* Launch! */
var roomStorage = createRoomStorage(localStorage);
var roomManager = roomStorage.load();
var utils = createUtils(config);
var tabs = createTabs(config, utils, chrome);
var features = createFeatures();
var client = createClient(config, io);
var popup = createPopup(chrome);
var roomService = createRoomService(client, roomManager, roomStorage, popup, tabs);

registerMessageHandler(roomService, chrome, features);
registerCurrentRoomDetector(roomService, utils, chrome);
registerClientHandlers(client, roomService, roomManager, tabs);

if (config.connectionRevivalInterval) {
    var reconnectReviver = createReconnectReviver(config, client);
    console.log("Starting reconnect reviver");
    reconnectReviver.start();
}

client.connect();
injectToExistingTabs(chrome, tabs);
