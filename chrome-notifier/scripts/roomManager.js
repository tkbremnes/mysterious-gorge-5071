window.RoomManager = (function () {
    var RoomManager = function (followedRooms) {
        this.currentRoomName = '';
        this.followedRooms = followedRooms || {};
        this.mutedRooms = {};
        this.currentNotificationIdForRoom = {};
    };

    RoomManager.prototype.setCurrentRoom = function (roomName) {
        this.currentRoomName = roomName;
    };

    RoomManager.prototype.getFollowedRooms = function() {
        return this.followedRooms;
    };

    RoomManager.prototype.shouldNotifyUser = function (roomName) {
        return this.isRoomFollowed(roomName) &&
                !this.isRoomMuted(roomName) &&
                roomName !== this.currentRoomName;
    };

    RoomManager.prototype.hasWarnings = function () {
        var room;
        for (var roomName in this.followedRooms) {
            room = this.followedRooms[roomName];
            if (room.error) {
                return true;
            }
        }
        return false;
    };

    RoomManager.prototype.followRoom = function(room) {
        this.followedRooms[room.roomName] = {roomName: room.roomName, token: room.token};
    };

    RoomManager.prototype.unfollowRoom = function(roomName) {
        delete this.followedRooms[roomName];
    };

    RoomManager.prototype.isRoomFollowed = function(roomName) {
        return (roomName in this.followedRooms);
    };

    RoomManager.prototype.muteRoom = function(roomName) {
        this.mutedRooms[roomName] = true;
    };
    RoomManager.prototype.unmuteRoom = function(roomName) {
        delete this.mutedRooms[roomName];
    };
    RoomManager.prototype.isRoomMuted = function(roomName) {
        return (roomName in this.mutedRooms);
    };

    RoomManager.prototype.registerError = function (roomName, error) {
        var room = this.followedRooms[roomName];
        if (room) {
            room.error = error;
        }
    };

    RoomManager.prototype.setNotificationId = function (roomName, notificationId) {
        var previousNotificationId = this.currentNotificationIdForRoom[roomName];
        this.currentNotificationIdForRoom[roomName] = notificationId;
        return previousNotificationId;
    };

    return RoomManager;
})();
