window.createRoomService = function (client, roomManager, roomStorage, popup, tabs) {
    var updateIcon = function () {
        if (roomManager.hasWarnings()) {
            popup.setWarningIcon();
            return;
        }

        popup.setNormalIcon();
    };

    var selfId;

    return {
        isFollowingRooms: function () {
            return Object.keys(this.getFollowedRooms()).length > 0;
        },

        getFollowedRooms: function () {
            return roomManager.getFollowedRooms();
        },

        muteRoom: function (roomName) {
            roomManager.muteRoom(roomName);
            tabs.sendToRoomTabs(null, {
                action: 'relay-to-tab',
                callback: 'muted-room',
                argument: roomName
            });
        },

        unmuteRoom: function (roomName) {
            roomManager.unmuteRoom(roomName);
            tabs.sendToRoomTabs(null, {
                action: 'relay-to-tab',
                callback: 'unmuted-room',
                argument: roomName
            });
        },

        unfollowRoom: function (roomName) {
            roomManager.unfollowRoom(roomName);
            roomStorage.update(roomManager);
            client.sendUnfollowRequest(roomName);
            tabs.sendToRoomTabs(null, {
                action: 'relay-to-tab',
                callback: 'unfollowed-room',
                argument: roomName
            });
            updateIcon();
        },

        changeOwner: function (room) {
            if (roomManager.isRoomFollowed(room.roomName)) {
                roomManager.followRoom(room);
                roomStorage.update(roomManager);
                client.sendFollowRequest(room.roomName, room.token);
                tabs.sendToRoomTabs(room.roomName, {
                    action: 'relay-to-tab',
                    callback: 'change-owner',
                    argument: room.roomName
                });
                updateIcon();
            }
        },

        followRoom: function (room) {
            roomManager.followRoom(room);
            roomStorage.update(roomManager);
            client.sendFollowRequest(room.roomName, room.token);
            tabs.sendToRoomTabs(room.roomName, {
                action: 'relay-to-tab',
                callback: 'followed-room',
                argument: room.roomName
            });
            updateIcon();
        },

        reconnectWatchRoom: function (roomName) {
            var room = roomManager.getFollowedRooms()[roomName];
            if (room) {
                client.sendFollowRequest(room.roomName, room.token);
            }
        },

        registerError: function (roomName, error) {
            roomManager.registerError(roomName, error);
            updateIcon();
        },

        setCurrentRoom: function (roomName) {
            return roomManager.setCurrentRoom(roomName);
        },

        setSelfId: function (newSelfId) {
            selfId = newSelfId;

            var message = {
                action: 'relay-to-tab',
                callback: 'connection-information',
                argument: {
                    extensionClientId: selfId
                }
            };

            tabs.sendToAppearInTabs(message);
        },

        getSelfId: function () {
            return selfId;
        }
    };
};
