/* global console, RoomManager */
window.createRoomStorage = function (localStorage) {

    var createRoom = function(name, data) {
        if (typeof data === 'boolean') {
            return {roomName: name};
        }
        return data;
    };
    var mapO = function (obj, func) {
        var newObj = {};
        if (obj) {
            Object.keys(obj).forEach(function (key) {
                newObj[key] = func(key, obj[key]);
            });
        }
        return newObj;
    };
    //in order to support the previous format
    var resolveRoomFormat = function (rooms) {
        return mapO(rooms, createRoom);
    };
    //ensure that we only store the properties that we
    //want to store.
    var filterProperties = function (roomName, room) {
        return {
            roomName: room.roomName,
            token: room.token
        };
    };

    var loadFromLocalStorage = function() {
        var _followedRooms;
        var data = localStorage.getItem('followedRooms');
        if (data) {
            try {
                _followedRooms = JSON.parse(data);
                if (typeof _followedRooms === 'object') {
                    return _followedRooms;
                }
            } catch (e) {
                console.warn("Could not load room information: %j", e);
                return {};
            }
        }
        return _followedRooms;
    };

    return {
        update: function (roomManager) {
            localStorage.setItem(
                'followedRooms',
                JSON.stringify(mapO(roomManager.getFollowedRooms(), filterProperties))
            );
        },

        load: function () {
            return new RoomManager(resolveRoomFormat(loadFromLocalStorage()));
        }
    };
};
