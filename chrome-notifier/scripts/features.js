/* global chrome */
window.createFeatures = (function () {
    return function () {
        var isDesktopShareEnabled = function () {
            var manifest = chrome.runtime.getManifest();
            return manifest.permissions.indexOf('desktopCapture') !== -1 &&
             chrome.hasOwnProperty('desktopCapture');
        };

        return {
            shareScreen: isDesktopShareEnabled()
        };
    };
}());
