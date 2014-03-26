/* global _RoomName, decodeURIComponent */

window.createUtils = function (config) {
    var normalizeRoomName = _RoomName.normalize;
    var extractRoomName = function (url) {
        //partly extracted from javascript the good parts
        var queryAndHashRegex = /(?:\?([^#]*))?(?:#(.*))?$/;
        var removeQueryAndHash = function (url) {
            return url.replace(queryAndHashRegex, "");
        };

        if (!url) {
            return null;
        }

        var index = url.indexOf(config.host);
        if (index !== 0) {
            return null;
        }

        var roomName = normalizeRoomName(decodeURIComponent(removeQueryAndHash(url.substring(config.host.length))));
        return (!roomName) ? null : roomName;
    };
    return {
        extractRoomName: extractRoomName
    };
};
