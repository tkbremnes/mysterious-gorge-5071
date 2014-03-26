/* globals exports:false */
// protocol enum used for both client and server
(function(exports) {
    // roomName
    exports.requirements = 'the room name cannot start with / or one of these reserved words: templates, styles, scripts, libraries, images, information, error, translations/.';
    exports.pattern = '(?!templates|styles|scripts|libraries|images|information|error|extensions|translations\/)(.*)';
    exports.normalize = function (rawName) {
        return (rawName + "").toLowerCase().replace(/\/$/, '');
    };
})
// makes the code available to the browser, as exports only works for requiring the code in Node.js
(typeof exports === 'undefined' ? this['_RoomName'] = {} : exports);
